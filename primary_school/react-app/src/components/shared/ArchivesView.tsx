import React, { useCallback, useEffect, useState } from "react";
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
  pdfUrl: string;
  createdAt: string;
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
  const [archives, setArchives] = useState<Archive[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const fetchArchives = useCallback(async () => {
    setLoading(true);

    try {
      const data: Archive[] = await api.get("/school/archives", {
        classGrade,
        classStream,
        search: allowManagement ? search.trim() || undefined : undefined,
      });
      setArchives(data);
      setFeedback((current) => (current?.type === "error" ? null : current));
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to load archives right now.",
      });
    } finally {
      setLoading(false);
    }
  }, [allowManagement, classGrade, classStream, search]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchArchives();
    }, allowManagement ? 250 : 0);

    return () => window.clearTimeout(timeoutId);
  }, [allowManagement, fetchArchives]);

  const handleDelete = async (archive: Archive) => {
    if (!allowManagement) return;

    const classLabel = `${archive.classGrade} ${archive.classStream}`.trim();
    const confirmed = window.confirm(
      `Delete the archived ${archive.examType} report for ${classLabel}, Term ${archive.term} ${archive.year}? This removes the PDF from Supabase and deletes its archive record.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(archive._id);
    setFeedback(null);

    try {
      const response = await api.delete<{ message?: string }>(`/school/archives/${archive._id}`);
      setArchives((current) => current.filter((item) => item._id !== archive._id));
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

  const hasSearch = search.trim().length > 0;

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
          Access archived performance reports from previous exam phases.
        </p>
      </div>

      {allowManagement ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(240px, 420px)",
            gap: 12,
            marginBottom: 16,
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
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
                  <div>
                    <h4 style={{ margin: "0 0 4px", fontSize: 15, color: C.text, fontWeight: 700 }}>
                      {classLabel} - {archive.examType.toUpperCase()}
                    </h4>
                    <p style={{ margin: "0 0 6px", fontSize: 12, color: C.textMuted }}>
                      Term {archive.term}, {archive.year} | {new Date(archive.createdAt).toLocaleDateString()}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: C.textFaint }}>
                      Open or download the archived PDF report for this class cycle.
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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
                        {isDeleting ? "Deleting..." : "Delete Archive"}
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
