import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import {
  TimetableDay,
  TimetableEntry,
  TimetableRecord,
} from "../../lib/timetableTypes";
import { formatSubjectOfferingTag } from "../../lib/subjectEnrollment";

interface TimetableLibraryProps {
  fetchPath: string;
  fetchParams?: Record<string, string | number | boolean | undefined | null>;
  title: string;
  description: string;
  emptyMessage?: string;
  highlightTeacherId?: string;
  refreshKey?: number;
  allowDelete?: boolean;
  onDeleteSuccess?: (message: string) => void;
}

type TimetableDisplayRow =
  | {
      type: "break";
      key: string;
      label: string;
    }
  | {
      type: "lesson";
      key: string;
      timeLabel: string;
      entries: Array<TimetableEntry | null>;
    };

const DISPLAY_DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

const orderDays = (days: TimetableDay[]) => {
  const dayMap = new Map(days.map((day) => [day.day, day]));
  return DISPLAY_DAY_ORDER.map((day) => dayMap.get(day)).filter(Boolean) as TimetableDay[];
};

const buildBreakLabel = (entry: TimetableEntry) =>
  `${(entry.label || "Break").toUpperCase()} | ${entry.startTime} - ${entry.endTime}`;

const buildLessonMeta = (entry: TimetableEntry | null) => {
  if (!entry || entry.type !== "lesson") {
    return "No lesson scheduled";
  }

  if (Array.isArray(entry.parallelLessons) && entry.parallelLessons.length > 0) {
    return `Parallel block (${entry.parallelLessons.length} subjects)`;
  }

  return `${entry.teacherName || "Department Supervision"}${
    entry.slotNumber ? ` - Lesson ${entry.slotNumber}` : ""
  }`;
};

const isHighlightedTeacherLesson = (entry: TimetableEntry | null, teacherId?: string) => {
  if (!teacherId || !entry || entry.type !== "lesson") {
    return false;
  }

  if (entry.teacherId === teacherId) {
    return true;
  }

  return Array.isArray(entry.parallelLessons)
    ? entry.parallelLessons.some((lesson) => lesson.teacherId === teacherId)
    : false;
};

export const TimetableLibrary: React.FC<TimetableLibraryProps> = ({
  fetchPath,
  fetchParams,
  title,
  description,
  emptyMessage = "No timetable has been published yet.",
  highlightTeacherId,
  refreshKey = 0,
  allowDelete = false,
  onDeleteSuccess,
}) => {
  const [timetables, setTimetables] = useState<TimetableRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        setActionMessage(null);
        const data = await api.get<TimetableRecord[]>((fetchPath as string), fetchParams);
        setTimetables(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load timetables.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [fetchPath, refreshKey, JSON.stringify(fetchParams || {})]);

  useEffect(() => {
    if (timetables.length === 0) {
      setSelectedId("");
      return;
    }

    setSelectedId((current) =>
      current && timetables.some((item) => item.id === current)
        ? current
        : timetables[0].id,
    );
  }, [timetables]);

  const selected = useMemo(
    () => timetables.find((item) => item.id === selectedId) || timetables[0] || null,
    [selectedId, timetables],
  );

  const orderedDays = useMemo(
    () => (selected ? orderDays(selected.days || []) : []),
    [selected],
  );

  const timeLabels = useMemo(() => {
    if (orderedDays.length === 0) return [];
    return orderedDays[0].entries.map((entry) => 
      entry.type === "break" 
        ? (entry.label || "Break").toUpperCase() 
        : `${entry.startTime} - ${entry.endTime}`
    );
  }, [orderedDays]);

  const teacherLessonCount = selected?.myLessons?.length || 0;

  const handleDelete = async () => {
    if (!selected || deleting) return;

    const classLabel = `${selected.classGrade} ${selected.classStream}`.trim();
    const confirmed = window.confirm(
      `Delete the published timetable for ${classLabel}? This will remove the PDF from Supabase and delete its database record.`,
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      const response = await api.delete<{ message: string }>(
        `/school/timetables/${selected.id}`,
      );
      const successMessage =
        response.message || `Deleted timetable for ${classLabel} successfully.`;

      setTimetables((current) =>
        current.filter((item) => item.id !== selected.id),
      );
      setActionMessage({ type: "success", text: successMessage });
      onDeleteSuccess?.(successMessage);
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to delete timetable.",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="ct-anim">
      <div style={{ marginBottom: 24 }}>
        <p style={eyebrowStyle}>Timetable Center</p>
        <h2 style={titleStyle}>{title}</h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--textMut)" }}>
          {description}
        </p>
      </div>

      {actionMessage && (
        <div
          style={{
            marginBottom: 16,
            padding: "12px 14px",
            borderRadius: 12,
            border:
              actionMessage.type === "success"
                ? "1px solid var(--sBg)"
                : "1px solid var(--dBg)",
            background:
              actionMessage.type === "success" ? "var(--sBg)" : "var(--dBg)",
            color:
              actionMessage.type === "success"
                ? "var(--sText)"
                : "var(--dText)",
            fontSize: 12.5,
            fontWeight: 700,
            lineHeight: 1.5,
          }}
        >
          {actionMessage.text}
        </div>
      )}

      {loading ? (
        <div style={emptyPanelStyle}>Loading timetables...</div>
      ) : error ? (
        <div
          style={{
            padding: 18,
            borderRadius: 14,
            border: "1px solid var(--dBg)",
            background: "var(--dBg)",
            color: "var(--dText)",
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      ) : timetables.length === 0 || !selected ? (
        <div style={emptyPanelStyle}>{emptyMessage}</div>
      ) : (
        <div style={{ display: "grid", gap: 18 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            <div style={metricCardStyle}>
              <p style={metricLabelStyle}>Published Classes</p>
              <p style={metricValueStyle}>{timetables.length}</p>
            </div>
            <div style={metricCardStyle}>
              <p style={metricLabelStyle}>Current Cycle</p>
              <p style={metricValueStyle}>
                T{selected.term} {selected.year}
              </p>
            </div>
            <div style={metricCardStyle}>
              <p style={metricLabelStyle}>Generation Mode</p>
              <p style={metricValueStyle}>
                {selected.generationMode === "ai" ? "Groq AI" : "Fallback"}
              </p>
            </div>
            <div style={metricCardStyle}>
              <p style={metricLabelStyle}>
                {highlightTeacherId ? "My Lessons This Week" : "Breaks Per Day"}
              </p>
              <p style={metricValueStyle}>
                {highlightTeacherId ? teacherLessonCount : selected.breaks.length}
              </p>
            </div>
          </div>

          {timetables.length > 1 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {timetables.map((item) => {
                const isActive = item.id === selected.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 999,
                      border: isActive
                        ? "1px solid var(--gold)"
                        : "1px solid var(--border)",
                      background: isActive ? "var(--goldP)" : "var(--white)",
                      color: isActive ? "var(--gold)" : "var(--text)",
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {item.classGrade} {item.classStream}
                  </button>
                );
              })}
            </div>
          )}

          <div
            style={{
              background: "var(--white)",
              border: "1px solid var(--border)",
              borderRadius: 18,
              padding: 20,
              display: "grid",
              gap: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <div>
                <h3 style={sectionTitleStyle}>
                  {selected.classGrade} {selected.classStream}
                </h3>
                <p style={metaTextStyle}>
                  Class teacher: {selected.classTeacherName || "Not assigned"}
                </p>
                <p style={metaTextStyle}>
                  Lessons start at {selected.schoolStartTime} and each subject runs
                  for {` ${selected.subjectDurationMinutes} `}minutes.
                </p>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a
                  href={selected.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={primaryLinkStyle}
                >
                  Open PDF
                </a>
                {allowDelete && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    style={{
                      ...dangerButtonStyle,
                      cursor: deleting ? "not-allowed" : "pointer",
                      opacity: deleting ? 0.7 : 1,
                    }}
                  >
                    {deleting ? "Deleting..." : "Delete Timetable"}
                  </button>
                )}
              </div>
            </div>

            {selected.aiSummary ? (
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: "var(--cream)",
                  border: "1px solid var(--border)",
                  color: "var(--textMut)",
                  fontSize: 12.5,
                  lineHeight: 1.5,
                }}
              >
                {selected.aiSummary}
              </div>
            ) : null}

            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: 16,
                overflow: "hidden",
                background: "var(--cream)",
              }}
            >
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    minWidth: 860,
                    borderCollapse: "collapse",
                  }}
                >
                  <thead>
                    <tr style={{ background: "var(--cg)" }}>
                      <th style={dayHeaderStyle}>Day</th>
                      {timeLabels.map((label, idx) => (
                        <th key={`head-${idx}`} style={timeHeaderStyle}>
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orderedDays.map((day) => (
                      <tr key={day.day}>
                        <td style={dayCellStyle}>{day.day}</td>
                        {day.entries.map((entry, idx) => {
                          if (entry?.type === "break") {
                            return (
                              <td
                                key={`${day.day}-break-${idx}`}
                                style={breakCellStyle}
                              >
                                {entry.label || "BREAK"}
                              </td>
                            );
                          }

                          const isTeacherLesson = isHighlightedTeacherLesson(
                            entry,
                            highlightTeacherId,
                          );

                          return (
                            <td
                              key={`${day.day}-slot-${idx}`}
                              style={{
                                ...lessonCellStyle,
                                background: isTeacherLesson
                                  ? "var(--goldP)"
                                  : "var(--white)",
                                borderColor: isTeacherLesson
                                  ? "var(--gold)"
                                  : "var(--borderL)",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: "var(--text)",
                                }}
                              >
                                {entry?.type === "lesson"
                                  ? entry.subjectName || "Independent Study"
                                  : "Independent Study"}
                              </div>
                              <div
                                style={{
                                  marginTop: 5,
                                  fontSize: 11,
                                  color: "var(--textMut)",
                                  lineHeight: 1.4,
                                }}
                              >
                                {buildLessonMeta(entry)}
                              </div>
                              {entry?.type === "lesson" && Array.isArray(entry.parallelLessons) && entry.parallelLessons.length > 0 && (
                                <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
                                  {entry.parallelLessons.map((lesson, lessonIndex) => {
                                    const isLessonHighlighted = lesson.teacherId === highlightTeacherId;

                                    return (
                                      <div
                                        key={`${lesson.subjectId}-${lessonIndex}`}
                                        style={{
                                          padding: "8px 9px",
                                          borderRadius: 10,
                                          border: `1px solid ${isLessonHighlighted ? "var(--gold)" : "var(--border)"}`,
                                          background: isLessonHighlighted ? "var(--goldP)" : "var(--cream)",
                                        }}
                                      >
                                        <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text)" }}>
                                          {lesson.subjectName}
                                        </div>
                                        <div style={{ marginTop: 3, fontSize: 10.5, color: "var(--textMut)", lineHeight: 1.4 }}>
                                          {lesson.teacherName || "Department Supervision"} | {formatSubjectOfferingTag(
                                            lesson.enrollmentMode || undefined,
                                            lesson.sharedSlotId || null,
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>


            {highlightTeacherId && selected.myLessons.length > 0 && (
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                <h4
                  style={{
                    margin: "0 0 10px",
                    fontSize: 14,
                    color: "var(--text)",
                    fontWeight: 700,
                  }}
                >
                  My lessons in this class
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 10,
                  }}
                >
                  {selected.myLessons.map((lesson, index) => (
                    <div
                      key={`${lesson.day}-${lesson.startTime}-${index}`}
                      style={{
                        borderRadius: 12,
                        border: "1px solid var(--border)",
                        background: "var(--white)",
                        padding: "10px 12px",
                      }}
                    >
                      <strong
                        style={{
                          display: "block",
                          fontSize: 12.5,
                          color: "var(--text)",
                        }}
                      >
                        {lesson.day}
                      </strong>
                      <span
                        style={{
                          display: "block",
                          fontSize: 12,
                          color: "var(--textMut)",
                          marginTop: 2,
                        }}
                      >
                        {lesson.startTime} - {lesson.endTime}
                      </span>
                      <span
                        style={{
                          display: "block",
                          fontSize: 12,
                          color: "var(--gold)",
                          marginTop: 5,
                          fontWeight: 700,
                        }}
                      >
                        {lesson.subjectName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const eyebrowStyle: React.CSSProperties = {
  margin: "0 0 5px",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: ".08em",
  textTransform: "uppercase",
  color: "var(--gold)",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "1.9rem",
  fontFamily: "var(--serif)",
  color: "var(--text)",
};

const sectionTitleStyle: React.CSSProperties = {
  margin: "0 0 6px",
  fontSize: "1.25rem",
  fontFamily: "var(--serif)",
  color: "var(--text)",
};

const metaTextStyle: React.CSSProperties = {
  margin: "0 0 4px",
  fontSize: 12.5,
  color: "var(--textMut)",
};

const emptyPanelStyle: React.CSSProperties = {
  padding: 42,
  textAlign: "center",
  borderRadius: 16,
  border: "1px dashed var(--border)",
  background: "var(--white)",
  color: "var(--textMut)",
};

const metricCardStyle: React.CSSProperties = {
  padding: "14px 16px",
  borderRadius: 14,
  background: "var(--white)",
  border: "1px solid var(--border)",
};

const metricLabelStyle: React.CSSProperties = {
  margin: "0 0 6px",
  fontSize: 10.5,
  fontWeight: 700,
  color: "var(--textMut)",
  textTransform: "uppercase",
  letterSpacing: ".06em",
};

const metricValueStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "1.35rem",
  fontWeight: 700,
  fontFamily: "var(--serif)",
  color: "var(--text)",
};

const primaryLinkStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  background: "var(--gold)",
  color: "#fff",
  textDecoration: "none",
  fontSize: 12.5,
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const dangerButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  background: "var(--dText)",
  color: "#fff",
  border: "none",
  fontSize: 12.5,
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const dayHeaderStyle: React.CSSProperties = {
  padding: "12px 14px",
  color: "#fff",
  fontSize: 12,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: ".04em",
  textAlign: "center",
  minWidth: 100,
};

const timeHeaderStyle: React.CSSProperties = {
  padding: "12px 14px",
  color: "#fff",
  fontSize: 12,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: ".04em",
  textAlign: "center",
  minWidth: 140,
};

const dayCellStyle: React.CSSProperties = {
  padding: "14px 12px",
  borderTop: "1px solid var(--borderL)",
  background: "var(--goldP)",
  color: "var(--text)",
  fontSize: 12,
  fontWeight: 700,
  textAlign: "center",
  verticalAlign: "middle",
  whiteSpace: "nowrap",
  minWidth: 100,
};

const lessonCellStyle: React.CSSProperties = {
  padding: "14px 12px",
  borderTop: "1px solid var(--borderL)",
  borderLeft: "1px solid var(--borderL)",
  verticalAlign: "top",
  minWidth: 140,
};

const breakCellStyle: React.CSSProperties = {
  padding: "12px 16px",
  borderTop: "1px solid var(--borderL)",
  borderLeft: "1px solid var(--borderL)",
  background: "rgba(201, 150, 61, 0.14)",
  color: "var(--textM)",
  fontSize: 11,
  fontWeight: 700,
  textAlign: "center",
  verticalAlign: "middle",
  letterSpacing: ".03em",
};
