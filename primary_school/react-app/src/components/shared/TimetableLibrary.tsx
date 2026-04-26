import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import { TimetableRecord } from "../../lib/timetableTypes";

interface TimetableLibraryProps {
  fetchPath: string;
  fetchParams?: Record<string, string | number | boolean | undefined | null>;
  title: string;
  description: string;
  emptyMessage?: string;
  highlightTeacherId?: string;
  refreshKey?: number;
}

export const TimetableLibrary: React.FC<TimetableLibraryProps> = ({
  fetchPath,
  fetchParams,
  title,
  description,
  emptyMessage = "No timetable has been published yet.",
  highlightTeacherId,
  refreshKey = 0,
}) => {
  const [timetables, setTimetables] = useState<TimetableRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await api.get<TimetableRecord[]>(fetchPath, fetchParams);
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
      current && timetables.some((item) => item.id === current) ? current : timetables[0].id,
    );
  }, [timetables]);

  const selected = useMemo(
    () => timetables.find((item) => item.id === selectedId) || timetables[0] || null,
    [selectedId, timetables],
  );

  const teacherLessonCount = selected?.myLessons?.length || 0;

  return (
    <div className="ct-anim">
      <div style={{ marginBottom: 24 }}>
        <p
          style={{
            margin: "0 0 5px",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            color: "var(--gold)",
          }}
        >
          Timetable Center
        </p>
        <h2
          style={{
            margin: 0,
            fontSize: "1.9rem",
            fontFamily: "var(--serif)",
            color: "var(--text)",
          }}
        >
          {title}
        </h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--textMut)" }}>
          {description}
        </p>
      </div>

      {loading ? (
        <div
          style={{
            padding: 42,
            textAlign: "center",
            borderRadius: 16,
            border: "1px dashed var(--border)",
            background: "var(--white)",
            color: "var(--textMut)",
          }}
        >
          Loading timetables...
        </div>
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
        <div
          style={{
            padding: 54,
            textAlign: "center",
            borderRadius: 16,
            border: "1px dashed var(--border)",
            background: "var(--white)",
            color: "var(--textMut)",
          }}
        >
          {emptyMessage}
        </div>
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
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              {timetables.map((item) => {
                const isActive = item.id === selected.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 999,
                      border: isActive ? "1px solid var(--gold)" : "1px solid var(--border)",
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
                <h3
                  style={{
                    margin: "0 0 6px",
                    fontSize: "1.25rem",
                    fontFamily: "var(--serif)",
                    color: "var(--text)",
                  }}
                >
                  {selected.classGrade} {selected.classStream}
                </h3>
                <p style={{ margin: "0 0 4px", fontSize: 12.5, color: "var(--textMut)" }}>
                  Class teacher: {selected.classTeacherName || "Not assigned"}
                </p>
                <p style={{ margin: 0, fontSize: 12.5, color: "var(--textMut)" }}>
                  Lessons start at {selected.schoolStartTime} and each subject runs for{" "}
                  {selected.subjectDurationMinutes} minutes.
                </p>
              </div>

              <a
                href={selected.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "var(--gold)",
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 12.5,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                Open PDF
              </a>
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
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 14,
              }}
            >
              {selected.days.map((day) => (
                <div
                  key={day.day}
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: 16,
                    background: "var(--cream)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "12px 14px",
                      background: "var(--cg)",
                      color: "#e8dcc8",
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: ".02em",
                    }}
                  >
                    {day.day}
                  </div>
                  <div style={{ padding: 12, display: "grid", gap: 10 }}>
                    {day.entries.map((entry, index) => {
                      const isTeacherLesson =
                        highlightTeacherId &&
                        entry.type === "lesson" &&
                        entry.teacherId === highlightTeacherId;

                      return (
                        <div
                          key={`${day.day}-${index}-${entry.startTime}`}
                          style={{
                            padding: "10px 11px",
                            borderRadius: 12,
                            border: isTeacherLesson
                              ? "1px solid var(--gold)"
                              : "1px solid rgba(0,0,0,0.05)",
                            background: entry.type === "break"
                              ? "rgba(201, 150, 61, 0.12)"
                              : isTeacherLesson
                                ? "var(--goldP)"
                                : "var(--white)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 12,
                              marginBottom: 4,
                              alignItems: "center",
                            }}
                          >
                            <strong style={{ fontSize: 12.5, color: "var(--text)" }}>
                              {entry.type === "break"
                                ? entry.label || "Break"
                                : entry.subjectName || "Independent Study"}
                            </strong>
                            <span style={{ fontSize: 11, color: "var(--textMut)", whiteSpace: "nowrap" }}>
                              {entry.startTime} - {entry.endTime}
                            </span>
                          </div>

                          <p style={{ margin: 0, fontSize: 11.5, color: "var(--textMut)" }}>
                            {entry.type === "break"
                              ? "Student break"
                              : `${entry.teacherName || "Department Supervision"}${entry.slotNumber ? ` • Lesson ${entry.slotNumber}` : ""}`}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {highlightTeacherId && selected.myLessons.length > 0 && (
              <div
                style={{
                  borderTop: "1px solid var(--border)",
                  paddingTop: 16,
                }}
              >
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
                      <strong style={{ display: "block", fontSize: 12.5, color: "var(--text)" }}>
                        {lesson.day}
                      </strong>
                      <span style={{ display: "block", fontSize: 12, color: "var(--textMut)", marginTop: 2 }}>
                        {lesson.startTime} - {lesson.endTime}
                      </span>
                      <span style={{ display: "block", fontSize: 12, color: "var(--gold)", marginTop: 5, fontWeight: 700 }}>
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
