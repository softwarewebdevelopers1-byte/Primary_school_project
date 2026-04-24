// components/subjectteacher/ResourcesTab.tsx
import React from "react";
import styles from "./SubjectTeacherDashboard.module.css";
import { Resource } from "./types";

interface ResourcesTabProps {
  resources: Resource[];
}

const getTypeStyle = (type: string) => {
  const typeMap: Record<string, { bg: string; t: string }> = {
    PDF: { bg: "var(--dBg)", t: "var(--dText)" },
    ZIP: { bg: "var(--wBg)", t: "var(--wText)" },
    DOCX: { bg: "var(--iBg)", t: "var(--iText)" },
  };
  return typeMap[type] || { bg: "var(--sand)", t: "var(--textMut)" };
};

export const ResourcesTab: React.FC<ResourcesTabProps> = ({ resources }) => {
  return (
    <div className={styles.anim}>
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Resources</p>
          <h2 className={styles.sectionTitle}>Teaching Resources</h2>
          <p className={styles.sectionSub}>
            {resources.length} files · Shared with your streams
          </p>
        </div>
        <button className={styles.btnPrimary}>+ Upload Resource</button>
      </div>

      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Size</th>
                <th>Date added</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r, idx) => {
                const typeStyle = getTypeStyle(r.type);
                return (
                  <tr key={idx}>
                    <td>
                      <span style={{ fontWeight: 600, color: "var(--text)" }}>
                        {r.title}
                      </span>
                    </td>
                    <td>
                      <span
                        className={styles.pill}
                        style={{ background: typeStyle.bg, color: typeStyle.t }}
                      >
                        {r.type}
                      </span>
                    </td>
                    <td style={{ color: "var(--textMut)", fontSize: "12px" }}>
                      {r.size}
                    </td>
                    <td style={{ color: "var(--textMut)", fontSize: "12px" }}>
                      {r.date}
                    </td>
                    <td>
                      <button className={styles.btnAction}>Download</button>
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
