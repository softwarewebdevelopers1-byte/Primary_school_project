// components/classteacher/Analytics.tsx
import React from "react";
import { avg, grade, gradeColor } from "./shared/helpers";
import { Avatar } from "./shared/Avatar";
import { C, FONT } from "./shared/constants";

interface AnalyticsProps {
  students: any[];
  subjects: any[];
  classGrade: string;
  classStream: string;
}

const MetricCard: React.FC<{
  label: string;
  value: string;
  note?: string;
  color?: string;
}> = ({ label, value, note, color }) => (
  <div
    style={{
      background: C.white,
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      padding: "1.3rem 1.4rem",
      borderTop: `3px solid ${color || C.gold}`,
    }}
  >
    <p
      style={{
        fontFamily: FONT.sans,
        fontSize: 11.5,
        fontWeight: 600,
        color: C.textMuted,
        margin: "0 0 8px",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {label}
    </p>
    <p
      style={{
        fontFamily: FONT.serif,
        fontSize: "2.1rem",
        fontWeight: 600,
        color: C.text,
        margin: "0 0 6px",
        lineHeight: 1,
      }}
    >
      {value}
    </p>
    {note && (
      <p
        style={{
          fontFamily: FONT.sans,
          fontSize: 12,
          color: C.textFaint,
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        {note}
      </p>
    )}
  </div>
);

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

export const Analytics: React.FC<AnalyticsProps> = ({ students, subjects, classGrade, classStream }) => {
  if (students.length === 0) {
    return <div style={{ padding: 40, textAlign: "center", color: C.textMuted }}>No analytics data available.</div>;
  }

  const subjectAvgs = subjects.map((s) => {
    const marks = students.map((st) => st.marks?.[s.id] || 0);
    const sum = marks.reduce((a, b) => a + b, 0);
    return {
      ...s,
      avg: marks.length > 0 ? Math.round(sum / marks.length) : 0,
    };
  });

  const studentAvgs = students
    .map((s) => ({ ...s, avg: avg(s.marks || {}) }))
    .sort((a, b) => b.avg - a.avg);

  const classAvg = Math.round(
    studentAvgs.reduce((a, s) => a + s.avg, 0) / studentAvgs.length,
  );

  const bestSubject = [...subjectAvgs].sort((a, b) => b.avg - a.avg)[0];
  const passRate = Math.round((students.filter(s => avg(s.marks || {}) >= 50).length / students.length) * 100);

  return (
    <div className="ct-anim">
      <SectionHeader
        eyebrow="Insights"
        title="Performance analytics"
        sub={`Grade ${classGrade}${classStream} · Academic Year 2024`}
      />

      {/* Metrics row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 14,
          marginBottom: "1.6rem",
        }}
      >
        <MetricCard
          label="Class average"
          value={`${classAvg}%`}
          note={`Across ${subjects.length} subjects`}
          color={gradeColor(classAvg)}
        />
        <MetricCard
          label="Top student"
          value={studentAvgs[0]?.avg + "%"}
          note={studentAvgs[0]?.name}
          color={C.successText}
        />
        <MetricCard
          label="Best subject"
          value={bestSubject?.name.split(" ")[0] || "N/A"}
          note={bestSubject ? `${bestSubject.avg}% avg` : "N/A"}
          color={C.gold}
        />
        <MetricCard
          label="Pass rate"
          value={`${passRate}%`}
          note="Students above 50%"
          color={C.warnText}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Subject bars */}
        <div
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: "1.4rem",
          }}
        >
          <p
            style={{
              fontFamily: FONT.sans,
              fontSize: 11,
              fontWeight: 700,
              color: C.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              margin: "0 0 1.2rem",
            }}
          >
            Subject averages
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {subjectAvgs.map((s) => (
              <div key={s.id}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 5,
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONT.sans,
                      fontSize: 13,
                      color: C.textMid,
                    }}
                  >
                    {s.name}
                  </span>
                  <span
                    style={{
                      fontFamily: FONT.serif,
                      fontSize: 14,
                      fontWeight: 600,
                      color: gradeColor(s.avg),
                    }}
                  >
                    {s.avg}%
                  </span>
                </div>
                <div
                  style={{
                    height: 9,
                    background: C.sand,
                    borderRadius: 5,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${s.avg}%`,
                      height: "100%",
                      background: gradeColor(s.avg),
                      borderRadius: 5,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student ranking */}
        <div
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: "1.4rem",
          }}
        >
          <p
            style={{
              fontFamily: FONT.sans,
              fontSize: 11,
              fontWeight: 700,
              color: C.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              margin: "0 0 1.2rem",
            }}
          >
            Student ranking (Top 10)
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {studentAvgs.slice(0, 10).map((s, i) => (
              <div
                key={s.id}
                style={{ display: "flex", alignItems: "center", gap: 12 }}
              >
                <span
                  style={{
                    fontFamily: FONT.serif,
                    fontSize: 17,
                    fontWeight: 600,
                    color: C.textFaint,
                    width: 22,
                    textAlign: "center",
                  }}
                >
                  {i + 1}
                </span>
                <Avatar name={s.name} size={30} />
                <span
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.text,
                    flex: 1,
                  }}
                >
                  {s.name}
                </span>
                <div
                  style={{
                    width: 100,
                    height: 7,
                    background: C.sand,
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${s.avg}%`,
                      height: "100%",
                      background: gradeColor(s.avg),
                      borderRadius: 4,
                    }}
                  />
                </div>
                <span
                  style={{
                    fontFamily: FONT.serif,
                    fontSize: 14,
                    fontWeight: 600,
                    color: gradeColor(s.avg),
                    width: 42,
                    textAlign: "right",
                  }}
                >
                  {s.avg}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Grade distribution */}
        <div
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: "1.4rem",
            gridColumn: "1/-1",
          }}
        >
          <p
            style={{
              fontFamily: FONT.sans,
              fontSize: 11,
              fontWeight: 700,
              color: C.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              margin: "0 0 1.2rem",
            }}
          >
            Grade distribution
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 12,
            }}
          >
            {["A", "B", "C", "D", "E"].map((g) => {
              const count = studentAvgs.filter(
                (s) => grade(s.avg) === g,
              ).length;
              const ranges: Record<string, string> = {
                A: "≥ 80",
                B: "70–79",
                C: "60–69",
                D: "50–59",
                E: "< 50",
              };
              const colors: Record<string, string> = {
                A: C.successText,
                B: C.gold,
                C: C.warnText,
                D: "#993C1D",
                E: C.dangerText,
              };
              const bgs: Record<string, string> = {
                A: C.successBg,
                B: C.goldLight,
                C: C.warnBg,
                D: "#FAECE7",
                E: C.dangerBg,
              };
              return (
                <div
                  key={g}
                  style={{
                    background: bgs[g],
                    borderRadius: 11,
                    padding: "1rem",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontFamily: FONT.serif,
                      fontSize: "2rem",
                      fontWeight: 600,
                      color: colors[g],
                      margin: "0 0 2px",
                    }}
                  >
                    {g}
                  </p>
                  <p
                    style={{
                      fontFamily: FONT.serif,
                      fontSize: "1.6rem",
                      fontWeight: 600,
                      color: colors[g],
                      margin: "0 0 4px",
                    }}
                  >
                    {count}
                  </p>
                  <p
                    style={{
                      fontFamily: FONT.sans,
                      fontSize: 11,
                      color: colors[g],
                      margin: 0,
                      opacity: 0.8,
                    }}
                  >
                    {ranges[g]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
