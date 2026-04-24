// components/subjectteacher/AssessmentsTab.tsx
import React from "react";
import styles from "./SubjectTeacherDashboard.module.css";
import { Assessment } from "./types";

interface AssessmentsTabProps {
  assessments: Assessment[];
}

const getStatusStyle = (status: string) => {
  const statusMap: Record<string, { bg: string; t: string }> = {
    Marked: { bg: "var(--sBg)", t: "var(--sText)" },
    "Pending marks": { bg: "var(--wBg)", t: "var(--wText)" },
    Upcoming: { bg: "var(--iBg)", t: "var(--iText)" },
  };
  return statusMap[status] || { bg: "var(--sand)", t: "var(--textMut)" };
};

export const AssessmentsTab: React.FC<AssessmentsTabProps> = ({
  assessments,
}) => {
  return (
    <div className={styles.anim}>
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Assessments</p>
          <h2 className={styles.sectionTitle}>Assessment Schedule</h2>
          <p className={styles.sectionSub}>
            {assessments.length} assessments · Term 1, 2024
          </p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Assessment</th>
                <th>Stream</th>
                <th>Date</th>
                <th>Max</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((a, idx) => {
                const statusStyle = getStatusStyle(a.status);
                return (
                  <tr key={idx}>
                    <td>
                      <span style={{ fontWeight: 600, color: "var(--text)" }}>
                        {a.title}
                      </span>
                    </td>
                    <td style={{ color: "var(--textM)" }}>{a.subject}</td>
                    <td style={{ color: "var(--textMut)", fontSize: "12px" }}>
                      {a.date}
                    </td>
                    <td
                      style={{
                        fontFamily: "var(--serif)",
                        fontSize: "15px",
                        fontWeight: 600,
                      }}
                    >
                      {a.max}
                    </td>
                    <td>
                      <span
                        className={styles.pill}
                        style={{
                          background: statusStyle.bg,
                          color: statusStyle.t,
                        }}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td>
                      <button className={styles.btnAction}>
                        {a.status === "Upcoming" ? "Plan" : "View"}
                      </button>
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
