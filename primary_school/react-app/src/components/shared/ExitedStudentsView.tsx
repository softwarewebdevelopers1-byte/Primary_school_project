import React, { useMemo, useState } from "react";
import { api } from "../../lib/api";
import type { ExitedStudent } from "../admin/types";

interface ExitedStudentsViewProps {
  exitedStudents: ExitedStudent[];
  onRefresh?: () => Promise<void>;
  allowDelete?: boolean;
}

const panelStyle: React.CSSProperties = {
  background: "var(--white, var(--dh-white))",
  border: "1px solid var(--border, var(--dh-border))",
  borderRadius: 13,
  padding: "1.1rem 1.2rem",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1.5px solid var(--border, var(--dh-border))",
  borderRadius: 8,
  fontSize: 13.5,
  color: "var(--text, var(--dh-text))",
  background: "var(--cream, var(--dh-cream))",
};

const buttonStyle: React.CSSProperties = {
  border: "1px solid var(--border, var(--dh-border))",
  background: "var(--white, var(--dh-white))",
  color: "var(--text, var(--dh-text))",
  borderRadius: 8,
  padding: "7px 10px",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};

export const ExitedStudentsView: React.FC<ExitedStudentsViewProps> = ({
  exitedStudents,
  onRefresh,
  allowDelete = false,
}) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ExitedStudent | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return exitedStudents;

    return exitedStudents.filter((student) =>
      [
        student.name,
        student.admissionNo,
        student.finalClassGrade,
        student.finalClassStream,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [exitedStudents, search]);

  const handleDelete = async (student: ExitedStudent) => {
    const recordId = student._id || student.id;
    if (!recordId) return;

    const ok = window.confirm(
      `Delete exited record for ${student.name}? This removes the archived education-health summary only.`,
    );
    if (!ok) return;

    await api.delete(`/users/exited-students/${recordId}`);
    setMessage("Exited learner archive deleted.");
    setSelected(null);
    await onRefresh?.();
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gap: 6 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "var(--gold, var(--dh-gold))", textTransform: "uppercase", letterSpacing: ".09em", margin: 0 }}>
          Exited learners
        </p>
        <h2 style={{ margin: 0, fontFamily: "var(--serif, Georgia, serif)", fontSize: "1.8rem", color: "var(--text, var(--dh-text))" }}>
          Education health archive
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: "var(--textMut, var(--dh-text-muted))" }}>
          Learners who completed the configured final grade are inactive and kept outside current class workflows.
        </p>
      </div>

      <div style={{ ...panelStyle, display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center" }}>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, admission number, or final class"
          style={inputStyle}
        />
        <strong style={{ color: "var(--text, var(--dh-text))" }}>{filtered.length} records</strong>
      </div>

      {message ? (
        <div style={{ ...panelStyle, color: "var(--sText, var(--dh-success-text))", background: "var(--sBg, var(--dh-success-bg))" }}>{message}</div>
      ) : null}

      <div style={{ ...panelStyle, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", background: "var(--sand, var(--dh-sand))" }}>
              {["Student", "Adm No", "Final class", "Exams", "Avg Pts", "Avg %", ""].map((heading) => (
                <th key={heading} style={{ padding: 12, fontSize: 11, color: "var(--textMut, var(--dh-text-muted))", textTransform: "uppercase" }}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 32, textAlign: "center", color: "var(--textMut, var(--dh-text-muted))" }}>
                  No exited learners found.
                </td>
              </tr>
            ) : (
              filtered.map((student) => (
                <tr key={student._id || student.id} style={{ borderTop: "1px solid var(--border, var(--dh-border))" }}>
                  <td style={{ padding: 12, fontWeight: 700 }}>{student.name}</td>
                  <td style={{ padding: 12, color: "var(--textMut, var(--dh-text-muted))" }}>{student.admissionNo}</td>
                  <td style={{ padding: 12 }}>
                    Grade {student.finalClassGrade} {student.finalClassStream || ""}
                  </td>
                  <td style={{ padding: 12 }}>{student.examCount}</td>
                  <td style={{ padding: 12, fontWeight: 700 }}>{Number(student.averagePoints || 0).toFixed(2)}</td>
                  <td style={{ padding: 12 }}>{student.averagePercentage || 0}%</td>
                  <td style={{ padding: 12, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button style={buttonStyle} onClick={() => setSelected(student)}>
                      View
                    </button>
                    {allowDelete ? (
                      <button
                        style={{ ...buttonStyle, color: "var(--dText, var(--dh-danger-text))", borderColor: "var(--dBg, var(--dh-danger-bg))" }}
                        onClick={() => void handleDelete(student)}
                      >
                        Delete
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected ? (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(11,32,24,.35)", zIndex: 1000, display: "grid", placeItems: "center", padding: 20 }}
          onClick={() => setSelected(null)}
        >
          <div
            style={{ background: "var(--white, var(--dh-white))", borderRadius: 13, width: "min(760px, 100%)", maxHeight: "86vh", overflow: "auto", border: "1px solid var(--border, var(--dh-border))" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border, var(--dh-border))", display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <h3 style={{ margin: 0, fontFamily: "var(--serif, Georgia, serif)", color: "var(--text, var(--dh-text))" }}>{selected.name}</h3>
                <p style={{ margin: "4px 0 0", color: "var(--textMut, var(--dh-text-muted))", fontSize: 13 }}>
                  {selected.admissionNo} | Grade {selected.finalClassGrade} {selected.finalClassStream || ""}
                </p>
              </div>
              <button style={buttonStyle} onClick={() => setSelected(null)}>Close</button>
            </div>
            <div style={{ padding: 20, display: "grid", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
                <div style={panelStyle}><strong>{Number(selected.averagePoints || 0).toFixed(2)}</strong><br /><span style={{ color: "var(--textMut, var(--dh-text-muted))", fontSize: 12 }}>Average points</span></div>
                <div style={panelStyle}><strong>{selected.averagePercentage || 0}%</strong><br /><span style={{ color: "var(--textMut, var(--dh-text-muted))", fontSize: 12 }}>Average score</span></div>
                <div style={panelStyle}><strong>{selected.examCount}</strong><br /><span style={{ color: "var(--textMut, var(--dh-text-muted))", fontSize: 12 }}>Done exams</span></div>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", background: "var(--sand, var(--dh-sand))" }}>
                    {["Cycle", "Class", "Subjects", "Points", "Avg Pts", "Average", "Grade"].map((heading) => (
                      <th key={heading} style={{ padding: 10, fontSize: 11, color: "var(--textMut, var(--dh-text-muted))" }}>{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selected.examSummaries.map((exam) => (
                    <tr key={`${exam.year}-${exam.term}-${exam.examType}-${exam.classGrade}`} style={{ borderTop: "1px solid var(--border, var(--dh-border))" }}>
                      <td style={{ padding: 10 }}>T{exam.term} {exam.year} {exam.examType.toUpperCase()}</td>
                      <td style={{ padding: 10 }}>Grade {exam.classGrade} {exam.classStream || ""}</td>
                      <td style={{ padding: 10 }}>{exam.subjectCount}</td>
                      <td style={{ padding: 10 }}>{exam.points}</td>
                      <td style={{ padding: 10 }}>{Number(exam.avgPoints || 0).toFixed(2)}</td>
                      <td style={{ padding: 10 }}>{exam.average}%</td>
                      <td style={{ padding: 10, fontWeight: 700 }}>{exam.grade}</td>
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
