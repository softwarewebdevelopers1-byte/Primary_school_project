import React, { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import { DlIcon } from "../classteacher/shared/Icons";
import { C, FONT } from "../classteacher/shared/constants";

interface Archive {
  _id: string;
  classGrade: string;
  classStream: string;
  term: number;
  year: number;
  examType: string;
  pdfUrl: string | null;
  source?: "pdf" | "database";
  markCount?: number;
  createdAt: string;
}

interface ArchiveResultSubject {
  id: string;
  name: string;
}

interface ArchiveResultStudent {
  studentId: string;
  name: string;
  admissionNo: string;
  average: number | null;
  subjects: Record<
    string,
    {
      percentage: number | null;
      cat1: number | null;
      cat2: number | null;
      cat3: number | null;
      cat4: number | null;
      cat5: number | null;
      exam: number | null;
      finalScore: number | null;
      cbcBand?: string | null;
      points?: number | null;
    }
  >;
}

interface ArchiveResultsPayload {
  archive: Archive;
  subjects: ArchiveResultSubject[];
  students: ArchiveResultStudent[];
}

interface ArchivesViewProps {
  classGrade?: string;
  classStream?: string;
  title?: string;
  allowManagement?: boolean;
}

type FeedbackState =
  | {
      type: "success" | "error";
      text: string;
    }
  | null;

const searchInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: `1px solid ${C.border}`,
  background: C.white,
  color: C.text,
  fontSize: 14,
  outline: "none",
};

const actionButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  minHeight: 38,
  padding: "0 14px",
  borderRadius: 10,
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
  textDecoration: "none",
  transition: "transform 0.15s ease, opacity 0.15s ease",
};

export const ArchivesView: React.FC<ArchivesViewProps> = ({
  classGrade,
  classStream,
  title = "Academic Archives",
  allowManagement = false,
}) => {
  const [allArchives, setAllArchives] = useState<Archive[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isCompact, setIsCompact] = useState(() => window.innerWidth <= 720);
  const [deletingId, setDeletingId] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<ArchiveResultsPayload | null>(null);
  const [resultsLoadingId, setResultsLoadingId] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const fetchArchives = useCallback(async () => {
    setLoading(true);

    try {
      const data: Archive[] = await api.get("/school/archives", {
        classGrade,
        classStream,
      });
      setAllArchives(data);
      setSelectedIds(new Set());
      setFeedback((current) => (current?.type === "error" ? null : current));
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to load archives right now.",
      });
    } finally {
      setLoading(false);
    }
  }, [classGrade, classStream]);

  useEffect(() => {
    void fetchArchives();
  }, [fetchArchives]);

  useEffect(() => {
    const handleResize = () => setIsCompact(window.innerWidth <= 720);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDelete = async (archive: Archive) => {
    if (!allowManagement) return;

    const classLabel = `${archive.classGrade} ${archive.classStream}`.trim();
    const confirmed = window.confirm(
      archive.pdfUrl
        ? `Delete the archived ${archive.examType} report for ${classLabel}, Term ${archive.term} ${archive.year}? This removes the PDF from Supabase and deletes its archive record.`
        : `Delete the saved ${archive.examType} results for ${classLabel}, Term ${archive.term} ${archive.year}? This deletes the matching mark records from the database.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(archive._id);
    setFeedback(null);

    try {
      const response = await api.delete<{ message?: string }>(`/school/archives/${archive._id}`);
      setAllArchives((current) => current.filter((item) => item._id !== archive._id));
      setSelectedIds((current) => {
        const next = new Set(current);
        next.delete(archive._id);
        return next;
      });
      if (results?.archive?._id === archive._id) {
        setResults(null);
      }
      setFeedback({
        type: "success",
        text: response.message || "Archive deleted successfully.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to delete this archive.",
      });
    } finally {
      setDeletingId("");
    }
  };

  const handleBulkDelete = async () => {
    if (!allowManagement || selectedIds.size === 0) return;

    const confirmed = window.confirm(
      `Delete ${selectedIds.size} selected archived result${selectedIds.size === 1 ? "" : "s"}? Database-backed results will delete matching mark records.`,
    );
    if (!confirmed) return;

    setDeletingId("bulk");
    setFeedback(null);

    try {
      const response = await api.post<{ message?: string }>("/school/archives/delete", {
        ids: Array.from(selectedIds),
      });
      const deletedIds = new Set(selectedIds);
      setAllArchives((current) => current.filter((item) => !deletedIds.has(item._id)));
      if (results && deletedIds.has(results.archive._id)) {
        setResults(null);
      }
      setSelectedIds(new Set());
      setFeedback({
        type: "success",
        text: response.message || "Selected archived results deleted.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to delete selected results.",
      });
    } finally {
      setDeletingId("");
    }
  };

  const handleViewResults = async (archive: Archive) => {
    if (archive.pdfUrl) {
      window.open(archive.pdfUrl, "_blank", "noopener,noreferrer");
      return;
    }

    setResultsLoadingId(archive._id);
    setFeedback(null);

    try {
      const data = await api.get<ArchiveResultsPayload>(
        `/school/archives/${encodeURIComponent(archive._id)}/results`,
      );
      setResults(data);
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to load archived results.",
      });
    } finally {
      setResultsLoadingId("");
    }
  };

  const toggleSelected = (archiveId: string, checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(archiveId);
      } else {
        next.delete(archiveId);
      }
      return next;
    });
  };

  const normalizedSearch = search.trim().toLowerCase();

  const archives = useMemo(() => {
    if (!allowManagement || !normalizedSearch) {
      return allArchives;
    }

    return allArchives.filter((archive) => {
      const classLabel = `${archive.classGrade} ${archive.classStream}`.trim().toLowerCase();
      const haystack = [
        archive.classGrade,
        archive.classStream,
        classLabel,
        archive.examType,
        `term ${archive.term}`,
        String(archive.term),
        String(archive.year),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [allArchives, allowManagement, normalizedSearch]);

  const hasSearch = normalizedSearch.length > 0;

  return (
    <div className="ct-anim">
      <div style={{ marginBottom: "1.6rem" }}>
        <p
          style={{
            fontFamily: FONT.sans,
            fontSize: 11,
            fontWeight: 700,
            color: C.gold,
            textTransform: "uppercase",
            margin: "0 0 5px",
          }}
        >
          History
        </p>
        <h2 style={{ fontFamily: FONT.serif, fontSize: "1.9rem", fontWeight: 600, color: C.text, margin: 0 }}>
          {title}
        </h2>
        <p style={{ fontFamily: FONT.sans, fontSize: 13, color: C.textMuted, margin: "4px 0 0" }}>
          Access preserved performance results from previous exam phases.
        </p>
      </div>

      {allowManagement ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isCompact ? "1fr" : "minmax(220px, 420px) auto",
            gap: 12,
            marginBottom: 16,
            alignItems: "end",
          }}
        >
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.textMuted }}>
              Search archives
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by class, stream, term, year, or exam"
              aria-label="Search archived reports"
              style={searchInputStyle}
            />
          </label>
          <button
            type="button"
            onClick={() => void handleBulkDelete()}
            disabled={selectedIds.size === 0 || deletingId === "bulk"}
            style={{
              ...actionButtonStyle,
              minHeight: 43,
              background: selectedIds.size === 0 ? C.sand : "#fff5f5",
              color: selectedIds.size === 0 ? C.textFaint : "#9a2d2d",
              border: selectedIds.size === 0 ? `1px solid ${C.border}` : "1px solid #e6b4b4",
              cursor: selectedIds.size === 0 ? "not-allowed" : "pointer",
            }}
          >
            {deletingId === "bulk" ? "Deleting..." : `Delete Selected (${selectedIds.size})`}
          </button>
        </div>
      ) : null}

      {feedback ? (
        <div
          style={{
            marginBottom: 16,
            padding: "12px 14px",
            borderRadius: 12,
            border: `1px solid ${feedback.type === "success" ? C.gold : "#efb6b6"}`,
            background: feedback.type === "success" ? C.goldPale : "#fff3f3",
            color: feedback.type === "success" ? C.text : "#8a1f1f",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {feedback.text}
        </div>
      ) : null}

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: C.textFaint }}>Loading archives...</div>
      ) : archives.length === 0 ? (
        <div
          style={{
            padding: 60,
            textAlign: "center",
            background: C.white,
            borderRadius: 16,
            border: `1px dashed ${C.border}`,
          }}
        >
          <p style={{ fontSize: 15, color: C.textMuted, margin: 0 }}>
            {hasSearch ? "No archived reports matched your search." : "No archived reports found yet."}
          </p>
        </div>
      ) : (
        <>
          <p style={{ margin: "0 0 12px", fontSize: 12, color: C.textMuted }}>
            Showing {archives.length} archived report{archives.length === 1 ? "" : "s"}.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))", gap: 16 }}>
            {archives.map((archive) => {
              const classLabel = `${archive.classGrade} ${archive.classStream}`.trim();
              const isDeleting = deletingId === archive._id;

              return (
                <div
                  key={archive._id}
                  style={{
                    background: C.white,
                    border: `1px solid ${C.border}`,
                    borderRadius: 14,
                    padding: "1.2rem",
                    display: "grid",
                    gap: 14,
                  }}
                >
                  {allowManagement ? (
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.textMuted }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(archive._id)}
                        onChange={(event) => toggleSelected(archive._id, event.target.checked)}
                      />
                      Select result
                    </label>
                  ) : null}
                  <div>
                    <h4 style={{ margin: "0 0 4px", fontSize: 15, color: C.text, fontWeight: 700 }}>
                      {classLabel} - {archive.examType.toUpperCase()}
                    </h4>
                    <p style={{ margin: "0 0 6px", fontSize: 12, color: C.textMuted }}>
                      Term {archive.term}, {archive.year} | {new Date(archive.createdAt).toLocaleDateString()}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: C.textFaint }}>
                      {archive.source === "database"
                        ? `${archive.markCount || 0} saved mark records are preserved in the database for this class cycle.`
                        : "Open or download the archived PDF report for this class cycle."}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {archive.pdfUrl ? (
                      <a
                        href={archive.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          ...actionButtonStyle,
                          background: C.goldPale,
                          color: C.gold,
                          border: `1px solid ${C.gold}`,
                        }}
                      >
                        <DlIcon />
                        Open PDF
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void handleViewResults(archive)}
                        style={{
                          ...actionButtonStyle,
                          background: C.goldPale,
                          color: C.gold,
                          border: `1px solid ${C.gold}`,
                          cursor: "pointer",
                        }}
                      >
                        {resultsLoadingId === archive._id ? "Loading..." : "View Results"}
                      </button>
                    )}

                    {allowManagement ? (
                      <button
                        type="button"
                        onClick={() => void handleDelete(archive)}
                        disabled={isDeleting}
                        style={{
                          ...actionButtonStyle,
                          background: isDeleting ? "#f3e3e3" : "#fff5f5",
                          color: "#9a2d2d",
                          border: "1px solid #e6b4b4",
                          opacity: isDeleting ? 0.75 : 1,
                        }}
                      >
                        {isDeleting ? "Deleting..." : archive.pdfUrl ? "Delete Archive" : "Delete Results"}
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {results ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1200,
            background: "rgba(8, 17, 13, 0.62)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 14,
          }}
          onClick={() => setResults(null)}
        >
          <div
            style={{
              width: "min(1120px, 100%)",
              maxHeight: "calc(100dvh - 28px)",
              overflow: "hidden",
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              display: "grid",
              gridTemplateRows: "auto minmax(0, 1fr)",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              style={{
                padding: "16px 18px",
                borderBottom: `1px solid ${C.border}`,
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: isCompact ? "stretch" : "flex-start",
                flexDirection: isCompact ? "column" : "row",
                position: "sticky",
                top: 0,
                zIndex: 3,
                background: C.white,
              }}
            >
              <div>
                <h3 style={{ margin: 0, color: C.text, fontSize: 18 }}>
                  Grade {results.archive.classGrade}
                  {results.archive.classStream ? ` ${results.archive.classStream}` : ""} Results
                </h3>
                <p style={{ margin: "4px 0 0", color: C.textMuted, fontSize: 12 }}>
                  Term {results.archive.term}, {results.archive.year} | {results.archive.examType.toUpperCase()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setResults(null)}
                style={{
                  ...actionButtonStyle,
                  background: C.sand,
                  color: C.textMid,
                  border: `1px solid ${C.border}`,
                  alignSelf: isCompact ? "flex-end" : "flex-start",
                  flexShrink: 0,
                }}
              >
                Close
              </button>
            </div>
            <div style={{ overflow: "auto", padding: 16 }}>
              <table style={{ width: "100%", minWidth: 720, borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Student", "Adm No", ...results.subjects.map((subject) => subject.name), "Average"].map((heading) => (
                      <th
                        key={heading}
                        style={{
                          textAlign: "left",
                          padding: "10px 12px",
                          fontSize: 11,
                          color: C.textMuted,
                          background: C.sand,
                          borderBottom: `1px solid ${C.border}`,
                          position: heading === "Student" ? "sticky" : undefined,
                          left: heading === "Student" ? 0 : undefined,
                          zIndex: heading === "Student" ? 2 : 1,
                          minWidth: heading === "Student" ? 220 : undefined,
                        }}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.students.map((student) => (
                    <tr key={student.studentId}>
                      <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.borderLight}`, color: C.text, fontWeight: 700, position: "sticky", left: 0, zIndex: 1, background: C.white, minWidth: 220, boxShadow: `1px 0 0 ${C.borderLight}` }}>
                        {student.name}
                      </td>
                      <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.borderLight}`, color: C.textMuted }}>
                        {student.admissionNo}
                      </td>
                      {results.subjects.map((subject) => {
                        const mark = student.subjects[subject.id];
                        return (
                          <td key={subject.id} style={{ padding: "10px 12px", borderBottom: `1px solid ${C.borderLight}`, color: C.text }}>
                            {typeof mark?.percentage === "number" ? `${mark.percentage}%` : "-"}
                          </td>
                        );
                      })}
                      <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.borderLight}`, color: C.gold, fontWeight: 800 }}>
                        {typeof student.average === "number" ? `${student.average}%` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
