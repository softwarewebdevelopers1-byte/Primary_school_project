// components/subjectteacher/ProgressTab.tsx
import React from "react";
import styles from "./SubjectTeacherDashboard.module.css";
import { Subject, Student, MarksData } from "./types";

interface ProgressTabProps {
  subjects: Subject[];
  activeSubjectId: string;
  students: Student[];
  marksData: MarksData;
  onSubjectChange: (subjectId: string) => void;
  avatar: (name: string, size: number) => string;
  gc: (value: number) => string;
}

export const ProgressTab: React.FC<ProgressTabProps> = ({
  subjects,
  activeSubjectId,
  students,
  marksData,
  onSubjectChange,
  avatar,
  gc,
}) => {
  const currentSubject =
    subjects.find((s) => s.id === activeSubjectId) || subjects[0];
  const subjectMarks = marksData[activeSubjectId] || {};
  const marksReadyCount = students.filter((s) => {
    const m = subjectMarks[s.id];
    return m && m.cat1 !== null && m.cat2 !== null;
  }).length;

  return (
    <div className={styles.anim}>
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Learner Progress</p>
          <h2 className={styles.sectionTitle}>Student Progress</h2>
          <p className={styles.sectionSub}>
            Performance across all assigned streams
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

      <div className={styles.metricGrid} style={{ marginBottom: 12 }}>
        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>Learners</p>
          <p className={styles.metricValue}>{students.length}</p>
          <p className={styles.metricNote}>{currentSubject.grade}</p>
        </div>
        <div
          className={styles.metricCard}
          style={{ borderTopColor: "var(--sText)" }}
        >
          <p className={styles.metricLabel}>Stream avg</p>
          <p className={styles.metricValue}>{currentSubject.avg}%</p>
          <p className={styles.metricNote}>Overall</p>
        </div>
        <div
          className={styles.metricCard}
          style={{ borderTopColor: "var(--gold)" }}
        >
          <p className={styles.metricLabel}>Marks ready</p>
          <p className={styles.metricValue}>{marksReadyCount}</p>
          <p className={styles.metricNote}>With CAT scores</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student</th>
                <th>CAT 1</th>
                <th>CAT 2</th>
                <th>Progress</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const marks = subjectMarks[student.id] || {
                  cat1: null,
                  cat2: null,
                };
                const pct =
                  marks.cat1 !== null
                    ? Math.round((Number(marks.cat1) / 40) * 100)
                    : null;
                const trend =
                  marks.cat1 !== null && marks.cat2 !== null
                    ? marks.cat2 > marks.cat1
                      ? "↑"
                      : "↓"
                    : "–";
                const tColor =
                  trend === "↑"
                    ? "var(--sText)"
                    : trend === "↓"
                      ? "var(--dText)"
                      : "var(--textF)";

                return (
                  <tr key={student.id}>
                    <td>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: avatar(student.name, 26),
                        }}
                      />
                      <div>
                        <p
                          style={{
                            fontWeight: 600,
                            color: "var(--text)",
                            margin: 0,
                            fontSize: "13px",
                          }}
                        >
                          {student.name}
                        </p>
                        <p
                          style={{
                            fontSize: "10.5px",
                            color: "var(--textMut)",
                            margin: 0,
                          }}
                        >
                          {student.adm}
                        </p>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontFamily: "var(--serif)",
                          fontSize: "15px",
                          fontWeight: 600,
                          color:
                            marks.cat1 !== null
                              ? gc(Math.round((Number(marks.cat1) / 40) * 100))
                              : "var(--textF)",
                        }}
                      >
                        {marks.cat1 !== null ? marks.cat1 : "–"}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontFamily: "var(--serif)",
                          fontSize: "15px",
                          fontWeight: 600,
                          color:
                            marks.cat2 !== null
                              ? gc(Math.round((Number(marks.cat2) / 40) * 100))
                              : "var(--textF)",
                        }}
                      >
                        {marks.cat2 !== null ? marks.cat2 : "–"}
                      </span>
                    </td>
                    <td>
                      {pct !== null ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <div className={styles.barWrap}>
                            <div
                              className={styles.barFill}
                              style={{ width: `${pct}%`, background: gc(pct) }}
                            />
                          </div>
                          <span style={{ fontSize: "12px", color: gc(pct) }}>
                            {pct}%
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: "var(--textF)" }}>–</span>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: "16px",
                          fontWeight: 700,
                          color: tColor,
                        }}
                      >
                        {trend}
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
