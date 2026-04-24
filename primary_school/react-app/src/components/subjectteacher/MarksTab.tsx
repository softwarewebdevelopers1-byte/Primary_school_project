// components/subjectteacher/MarksTab.tsx
import React from "react";
import styles from "./SubjectTeacherDashboard.module.css";
import { Subject, Student, MarksData } from "./types";

interface MarksTabProps {
  subjects: Subject[];
  activeSubjectId: string;
  students: Student[];
  marksData: MarksData;
  pushedSubjects: Set<string>;
  pushedStudents: Set<string>;
  onSubjectChange: (subjectId: string) => void;
  onMarkUpdate: (
    subjectId: string,
    studentId: string,
    key: string,
    value: string,
  ) => void;
  onSaveMarks: (subjectId: string) => void;
  onPushMarks: (subjectId: string) => void;
  avatar: (name: string, size: number) => string;
  gc: (value: number) => string;
}

export const MarksTab: React.FC<MarksTabProps> = ({
  subjects,
  activeSubjectId,
  students,
  marksData,
  pushedSubjects,
  pushedStudents,
  onSubjectChange,
  onMarkUpdate,
  onSaveMarks,
  onPushMarks,
  avatar,
  gc,
}) => {
  const currentSubject =
    subjects.find((s) => s.id === activeSubjectId) || subjects[0];
  const subjectMarks = marksData[activeSubjectId] || {};
  const allFilled = students.every((s) => {
    const m = subjectMarks[s.id];
    return m && m.cat1 !== null && m.cat2 !== null && m.exam !== null;
  });

  return (
    <div className={styles.anim}>
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Mark Entry</p>
          <h2 className={styles.sectionTitle}>Enter & Push Marks</h2>
          <p className={styles.sectionSub}>
            {currentSubject.name} · {currentSubject.grade} · Term 1, 2024
          </p>
        </div>
        <select
          className={styles.dhInput}
          value={activeSubjectId}
          onChange={(e) => onSubjectChange(e.target.value)}
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} – {s.grade}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.pushBanner}>
        <div>
          <p
            style={{
              fontSize: "10px",
              fontWeight: 700,
              color: "var(--gold)",
              textTransform: "uppercase",
              margin: "0 0 2px",
            }}
          >
            Marks status
          </p>
          <h3
            style={{
              fontFamily: "var(--serif)",
              fontSize: "1.1rem",
              color: "#fdf9f2",
              margin: 0,
            }}
          >
            {pushedSubjects.has(activeSubjectId)
              ? "Marks pushed to class teacher"
              : "Ready to push marks when complete"}
          </h3>
        </div>
        <button
          className={styles.btnPrimary}
          disabled={!allFilled}
          onClick={() => onPushMarks(activeSubjectId)}
          style={!allFilled ? { opacity: 0.5, cursor: "not-allowed" } : {}}
        >
          {pushedSubjects.has(activeSubjectId)
            ? "Re-push Marks"
            : "Push to Class Teacher"}
        </button>
      </div>

      <div className={styles.card}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "0.9rem",
          }}
        >
          <p className={styles.cardLabel} style={{ margin: 0 }}>
            {students.length} learners · CAT 1 (40) · CAT 2 (40) · Exam (100)
          </p>
          <button
            className={styles.btnGhost}
            style={{ fontSize: "11.5px" }}
            onClick={() => onSaveMarks(activeSubjectId)}
          >
            Save Progress
          </button>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Adm. No</th>
                <th>
                  CAT 1{" "}
                  <span style={{ fontWeight: 400, opacity: 0.6 }}>/40</span>
                </th>
                <th>
                  CAT 2{" "}
                  <span style={{ fontWeight: 400, opacity: 0.6 }}>/40</span>
                </th>
                <th>
                  Exam{" "}
                  <span style={{ fontWeight: 400, opacity: 0.6 }}>/100</span>
                </th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const marks = subjectMarks[student.id] || {
                  cat1: null,
                  cat2: null,
                  exam: null,
                };
                const total =
                  marks.cat1 !== null &&
                  marks.cat2 !== null &&
                  marks.exam !== null
                    ? marks.cat1 + marks.cat2 + marks.exam
                    : null;
                const totalPct =
                  total !== null ? Math.round(total / 1.8) : null;
                const pushed = pushedStudents.has(student.id);

                return (
                  <tr key={student.id}>
                    <td>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: avatar(student.name, 26),
                        }}
                      />
                      <span style={{ fontWeight: 600, color: "var(--text)" }}>
                        {student.name}
                      </span>
                    </td>
                    <td style={{ color: "var(--textMut)", fontSize: "12px" }}>
                      {student.adm}
                    </td>
                    <td>
                      <input
                        className={styles.markInput}
                        type="number"
                        min="0"
                        max="40"
                        value={marks.cat1 ?? ""}
                        placeholder="–"
                        onChange={(e) =>
                          onMarkUpdate(
                            activeSubjectId,
                            student.id,
                            "cat1",
                            e.target.value,
                          )
                        }
                      />
                    </td>
                    <td>
                      <input
                        className={styles.markInput}
                        type="number"
                        min="0"
                        max="40"
                        value={marks.cat2 ?? ""}
                        placeholder="–"
                        onChange={(e) =>
                          onMarkUpdate(
                            activeSubjectId,
                            student.id,
                            "cat2",
                            e.target.value,
                          )
                        }
                      />
                    </td>
                    <td>
                      <input
                        className={styles.markInput}
                        type="number"
                        min="0"
                        max="100"
                        value={marks.exam ?? ""}
                        placeholder="–"
                        onChange={(e) =>
                          onMarkUpdate(
                            activeSubjectId,
                            student.id,
                            "exam",
                            e.target.value,
                          )
                        }
                      />
                    </td>
                    <td>
                      {total !== null ? (
                        <span
                          style={{
                            fontFamily: "var(--serif)",
                            fontSize: "15px",
                            fontWeight: 600,
                            // color: gc(totalPct),
                          }}
                        >
                          {total}
                        </span>
                      ) : (
                        <span style={{ color: "var(--textF)" }}>–</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={styles.pill}
                        style={{
                          background: pushed ? "var(--sBg)" : "var(--wBg)",
                          color: pushed ? "var(--sText)" : "var(--wText)",
                        }}
                      >
                        {pushed ? "Pushed" : "Draft"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
