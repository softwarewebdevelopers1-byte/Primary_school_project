// components/classteacher/ResultsReports.tsx
import React from "react";
import { DlIcon } from "./shared/Icons";
import { C, FONT } from "./shared/constants";
import { avg, gradeColor } from "./shared/helpers";
import { Avatar } from "./shared/Avatar";

interface ResultsReportsProps {
  students: any[];
  subjects: any[];
}

const SectionHeader: React.FC<{
  eyebrow: string;
  title: string;
  sub?: string;
}> = ({ eyebrow, title, sub }) => (
  <div style={{ marginBottom: "1.6rem" }}>
    <p
      style={{
        fontFamily: FONT.sans,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.09em",
        textTransform: "uppercase",
        color: C.gold,
        margin: "0 0 5px",
      }}
    >
      {eyebrow}
    </p>
    <h2
      style={{
        fontFamily: FONT.serif,
        fontSize: "1.9rem",
        fontWeight: 600,
        color: C.text,
        margin: "0 0 4px",
        letterSpacing: "-0.01em",
      }}
    >
      {title}
    </h2>
    {sub && (
      <p
        style={{
          fontFamily: FONT.sans,
          fontSize: 13,
          color: C.textMuted,
          margin: 0,
        }}
      >
        {sub}
      </p>
    )}
  </div>
);

export const ResultsReports: React.FC<ResultsReportsProps> = ({ students, subjects }) => {
  const reports = [
    {
      title: "Full class report",
      desc: `Complete results for all ${students.length} students across all subjects.`,
      tag: "XLSX / PDF",
    },
    {
      title: "Individual result slips",
      desc: "One slip per learner — ready for printing or digital distribution.",
      tag: "PDF",
    },
    {
      title: "Subject summary",
      desc: "Subject-by-subject performance table with class averages.",
      tag: "XLSX",
    },
  ];

  const sortedStudents = [...students].sort((a, b) => avg(b.marks || {}) - avg(a.marks || {}));

  return (
    <div className="ct-anim" style={{ display: "grid", gap: 30 }}>
      <div>
        <SectionHeader
          eyebrow="Reports"
          title="Results & reports"
          sub={`Download and review performance summaries for Term 1, 2024.`}
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {reports.map(({ title, desc, tag }) => (
            <div
              key={title}
              className="ct-card ct-metric"
              style={{
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: "1.4rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 10,
                }}
              >
                <h3
                  style={{
                    fontFamily: FONT.serif,
                    fontSize: "1.15rem",
                    fontWeight: 600,
                    color: C.text,
                  }}
                >
                  {title}
                </h3>
                <span
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    background: C.goldLight,
                    color: C.gold,
                    padding: "3px 9px",
                    borderRadius: 12,
                    flexShrink: 0,
                  }}
                >
                  {tag}
                </span>
              </div>
              <p
                style={{
                  fontFamily: FONT.sans,
                  fontSize: 13,
                  color: C.textMuted,
                  lineHeight: 1.6,
                  marginBottom: "1.2rem",
                }}
              >
                {desc}
              </p>
              <button
                className="ct-actionbtn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "9px 16px",
                  background: C.sand,
                  border: `1px solid ${C.border}`,
                  borderRadius: 9,
                  fontFamily: FONT.sans,
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.textMid,
                  cursor: "pointer",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <DlIcon /> Download
              </button>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          background: C.white,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, background: C.goldPale }}>
          <h3 style={{ fontFamily: FONT.serif, fontSize: "1.3rem", fontWeight: 600, color: C.text, margin: 0 }}>
            Class Merit List (Real-time Preview)
          </h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
            <thead>
              <tr style={{ background: C.sand }}>
                <th style={thStyle}>Rank</th>
                <th style={thStyle}>Student</th>
                {subjects.slice(0, 5).map(s => (
                  <th key={s.id} style={{ ...thStyle, textAlign: "center" }}>{s.name.slice(0, 3)}</th>
                ))}
                <th style={{ ...thStyle, textAlign: "center" }}>Avg</th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.map((s, idx) => {
                const a = avg(s.marks || {});
                return (
                  <tr key={s.id} style={{ borderTop: `1px solid ${C.borderLight}` }}>
                    <td style={tdStyle}>{idx + 1}</td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Avatar name={s.name} size={24} />
                        <span style={{ fontWeight: 600 }}>{s.name}</span>
                      </div>
                    </td>
                    {subjects.slice(0, 5).map(sub => (
                      <td key={sub.id} style={{ ...tdStyle, textAlign: "center", color: gradeColor((s.marks || {})[sub.id] || 0) }}>
                        {(s.marks || {})[sub.id] || "-"}
                      </td>
                    ))}
                    <td style={{ ...tdStyle, textAlign: "center", fontWeight: 700, color: gradeColor(a) }}>{a}%</td>
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

const thStyle: React.CSSProperties = {
  padding: "11px 16px",
  textAlign: "left",
  fontFamily: FONT.sans,
  fontSize: 10.5,
  fontWeight: 700,
  color: C.textFaint,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
  fontFamily: FONT.sans,
  fontSize: 13,
  color: C.textMid,
};
