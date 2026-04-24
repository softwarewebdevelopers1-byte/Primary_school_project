// components/deputyhead/Reports.tsx
import React from "react";
import { SectionHeader } from "./shared/SectionHeader";
import { DownloadIcon } from "./shared/Icons";
import { C, F } from "./shared/constants";

export const Reports: React.FC = () => {
  const reports = [
    {
      title: "Term performance report",
      desc: "Full academic performance summary across all classes and subjects.",
      tag: "PDF",
      color: C.gold,
    },
    {
      title: "Staff attendance log",
      desc: "Monthly teacher attendance and punctuality record for leadership review.",
      tag: "XLSX",
      color: C.successText,
    },
    {
      title: "Parent concerns summary",
      desc: "Consolidated log of open, pending, and resolved parent contacts.",
      tag: "PDF",
      color: C.dangerText,
    },
    {
      title: "Class readiness report",
      desc: "Stream-by-stream readiness assessment ahead of exam preparation.",
      tag: "PDF",
      color: C.infoText,
    },
    {
      title: "Leadership briefing pack",
      desc: "One-page exec summary prepared for weekly head teacher meetings.",
      tag: "PDF",
      color: C.warnText,
    },
    {
      title: "Financial overview",
      desc: "Fee collection status and outstanding balances by class stream.",
      tag: "XLSX",
      color: C.gold,
    },
  ];

  return (
    <div className="dh-anim">
      <SectionHeader
        eyebrow="Reports"
        title="Leadership reports"
        sub="Summaries and documentation packs for Term 1, 2024"
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
          gap: 14,
        }}
      >
        {reports.map(({ title, desc, tag, color }) => (
          <div
            key={title}
            className="dh-card"
            style={{
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: 13,
              padding: "1.3rem",
              transition: "box-shadow .2s,transform .2s",
              borderTop: `3px solid ${color}`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 9,
              }}
            >
              <h3
                style={{
                  fontFamily: F.serif,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: C.text,
                  lineHeight: 1.25,
                }}
              >
                {title}
              </h3>
              <span
                style={{
                  padding: "2px 9px",
                  borderRadius: 10,
                  fontSize: 10,
                  fontWeight: 700,
                  background: C.goldLight,
                  color: C.gold,
                  flexShrink: 0,
                  marginLeft: 8,
                }}
              >
                {tag}
              </span>
            </div>
            <p
              style={{
                fontFamily: F.sans,
                fontSize: 12.5,
                color: C.textMuted,
                lineHeight: 1.6,
                marginBottom: "1rem",
              }}
            >
              {desc}
            </p>
            <button
              className="dh-actbtn"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                width: "100%",
                padding: "8px",
                background: C.sand,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                fontFamily: F.sans,
                fontSize: 13,
                fontWeight: 600,
                color: C.textMid,
                cursor: "pointer",
                transition: "all .2s",
              }}
            >
              <DownloadIcon /> Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
