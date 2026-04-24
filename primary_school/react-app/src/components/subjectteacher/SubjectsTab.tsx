// components/subjectteacher/SubjectsTab.tsx
import React from "react";
import styles from "./SubjectTeacherDashboard.module.css";
import { Subject } from "./types";

interface SubjectsTabProps {
  subjects: Subject[];
  onSelectSubject: (subjectId: string) => void;
  onEnterMarks: (subjectId: string) => void;
  pushedSubjects: Set<string>;
  gc: (value: number) => string;
}

export const SubjectsTab: React.FC<SubjectsTabProps> = ({
  subjects,
  onSelectSubject,
  onEnterMarks,
  pushedSubjects,
  gc,
}) => {
  const totalStudents = subjects.reduce((sum, s) => sum + s.students, 0);
  const avgAll = Math.round(
    subjects.reduce((sum, s) => sum + s.avg, 0) / subjects.length,
  );

  return (
    <div className={styles.anim}>
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.sectionEyebrow}>My Teaching Streams</p>
          <h2 className={styles.sectionTitle}>Assigned Subjects</h2>
          <p className={styles.sectionSub}>
            {subjects.length} streams · {totalStudents} total learners · Term 1,
            2024
          </p>
        </div>
      </div>

      <div className={styles.metricGrid}>
        <div className={styles.metricCard}>
          <p className={styles.metricLabel}>Streams</p>
          <p className={styles.metricValue}>{subjects.length}</p>
          <p className={styles.metricNote}>Assigned this term</p>
        </div>
        <div
          className={styles.metricCard}
          style={{ borderTopColor: "var(--sText)" }}
        >
          <p className={styles.metricLabel}>Total learners</p>
          <p className={styles.metricValue}>{totalStudents}</p>
          <p className={styles.metricNote}>Across all streams</p>
        </div>
        <div
          className={styles.metricCard}
          style={{ borderTopColor: gc(avgAll) }}
        >
          <p className={styles.metricLabel}>Average score</p>
          <p className={styles.metricValue}>{avgAll}%</p>
          <p className={styles.metricNote}>Combined streams</p>
        </div>
        <div
          className={styles.metricCard}
          style={{ borderTopColor: "var(--iText)" }}
        >
          <p className={styles.metricLabel}>Marks pushed</p>
          <p className={styles.metricValue}>{pushedSubjects.size}</p>
          <p className={styles.metricNote}>To class teacher</p>
        </div>
      </div>

      <div className={styles.subjectsGrid}>
        {subjects.map((subject) => (
          <div
            key={subject.id}
            className={styles.subjectCard}
            onClick={() => onSelectSubject(subject.id)}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 10,
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    color: "var(--text)",
                    margin: "0 0 2px",
                  }}
                >
                  {subject.name}
                </h3>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--textMut)",
                    margin: 0,
                  }}
                >
                  {subject.grade}
                </p>
              </div>
              <span
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "1.6rem",
                  fontWeight: 600,
                  color: gc(subject.avg),
                }}
              >
                {subject.avg}%
              </span>
            </div>
            <div
              style={{
                height: 6,
                background: "var(--sand)",
                borderRadius: 3,
                overflow: "hidden",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: `${subject.avg}%`,
                  height: "100%",
                  background: gc(subject.avg),
                  borderRadius: 3,
                }}
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 6,
                marginBottom: 10,
              }}
            >
              {[
                ["Students", subject.students],
                ["Term", `T${subject.term}`],
                ["Last", subject.lastAssess.split(" ")[0]],
              ].map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    background: "var(--sand)",
                    borderRadius: 7,
                    padding: "7px 8px",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: "9px",
                      fontWeight: 700,
                      color: "var(--textF)",
                      textTransform: "uppercase",
                      margin: "0 0 2px",
                    }}
                  >
                    {k}
                  </p>
                  <p
                    style={{
                      fontSize: "12.5px",
                      fontWeight: 700,
                      color: "var(--text)",
                      margin: 0,
                    }}
                  >
                    {v}
                  </p>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 7 }}>
              <button
                className={styles.btnPrimary}
                style={{ flex: 1, fontSize: "11.5px" }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEnterMarks(subject.id);
                }}
              >
                Enter Marks
              </button>
              <span
                className={
                  pushedSubjects.has(subject.id)
                    ? styles.badgePushed
                    : styles.badgePending
                }
              >
                {pushedSubjects.has(subject.id) ? "Pushed" : "Not pushed"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
