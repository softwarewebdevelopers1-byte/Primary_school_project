// components/classteacher/ResultsReports.tsx
import React from "react";
import { DlIcon } from "./shared/Icons";
import { C, FONT } from "./shared/constants";

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
      desc: `Complete results for all ${students.length} students across all subjects, with grades and averages.`,
      tag: "XLSX / PDF",
    },
    {
      title: "Individual result slips",
      desc: "One slip per learner — ready for printing or digital distribution to parents.",
      tag: "PDF",
    },
    {
      title: "Subject summary",
      desc: "Subject-by-subject performance table with class averages and pass rates.",
      tag: "XLSX",
    },
    {
      title: "Parent communication pack",
      desc: "Cover letter + result slip bundle, formatted for guardian distribution.",
      tag: "PDF",
    },
  ];

  return (
    <div className="ct-anim">
      <SectionHeader
        eyebrow="Reports"
        title="Results & reports"
        sub={`Download result slips and class summaries for Term 1, 2024.`}
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
              transition: "box-shadow 0.2s, transform 0.2s",
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
                transition: "all 0.2s",
              }}
            >
              <DlIcon /> Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
