// components/deputyhead/SchoolOverview.tsx
import React from "react";
import { SectionHeader } from "./shared/SectionHeader";
import { MetricCard } from "./shared/MetricCard";
import { Avatar } from "./shared/Avatar";
import { C, F } from "./shared/constants";
import { CONCERNS } from "./shared/data";
import { gc } from "./shared/helpers";

interface SchoolOverviewProps {
  isHT: boolean;
  classes?: any[];
  students?: any[];
  staff?: any[];
  term?: number;
  year?: number;
}

export const SchoolOverview: React.FC<SchoolOverviewProps> = ({ 
  isHT, 
  classes = [], 
  students = [], 
  staff = [],
  term = 1,
  year = 2024
}) => {
  const totalStudents = students.length;
  const totalTeachers = staff.length;
  const totalClasses = classes.length;
  const classAvg = classes.length > 0 ? Math.round(classes.reduce((a, c) => a + c.avg, 0) / classes.length) : 0;
  const openConcerns = CONCERNS.filter((c) => c.status === "Open").length;

  return (
    <div className="dh-anim">
      <SectionHeader
        eyebrow="Overview"
        title="School overview"
        sub={`Academic Year ${year} · Term ${term} · ${isHT ? "Full school" : "Academic support"} access`}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
          gap: 13,
          marginBottom: 18,
        }}
      >
        <MetricCard
          label="Total students"
          value={totalStudents}
          note="All enrolled learners"
          accent={C.successText}
        />
        <MetricCard
          label="Teaching staff"
          value={totalTeachers}
          note="Active and on-leave"
          accent={C.gold}
        />
        <MetricCard
          label="Class streams"
          value={totalClasses}
          note="Grade 7–9 streams"
          accent={C.infoText}
        />
        <MetricCard
          label="School average"
          value={`${classAvg}%`}
          note="All streams combined"
          accent={gc(classAvg)}
        />
        <MetricCard
          label="Open alerts"
          value="3"
          note="Need attention today"
          accent={C.dangerText}
        />
        <MetricCard
          label="Parent concerns"
          value={openConcerns}
          note="Awaiting response"
          accent={C.warnText}
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 13,
            padding: "1.3rem",
          }}
        >
          <p
            style={{
              fontFamily: F.sans,
              fontSize: 10.5,
              fontWeight: 700,
              color: C.textMuted,
              textTransform: "uppercase",
              letterSpacing: ".06em",
              margin: "0 0 1rem",
            }}
          >
            Class performance
          </p>
          {classes.map((c, i) => (
            <div key={c.id || i} style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <span
                  style={{ fontFamily: F.sans, fontSize: 13, color: C.textMid }}
                >
                  {c.name}
                </span>
                <span
                  style={{
                    fontFamily: F.serif,
                    fontSize: 14,
                    fontWeight: 600,
                    color: gc(c.avg),
                  }}
                >
                  {c.avg}%
                </span>
              </div>
              <div
                style={{
                  height: 7,
                  background: C.sand,
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${c.avg}%`,
                    height: "100%",
                    background: gc(c.avg),
                    borderRadius: 4,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 13,
            padding: "1.3rem",
          }}
        >
          <p
            style={{
              fontFamily: F.sans,
              fontSize: 10.5,
              fontWeight: 700,
              color: C.textMuted,
              textTransform: "uppercase",
              letterSpacing: ".06em",
              margin: "0 0 1rem",
            }}
          >
            Staff overview
          </p>
          {staff.slice(0, 6).map((t, i) => (
            <div
              key={t.id || i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <Avatar name={t.name} size={30} />
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontFamily: F.sans,
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.text,
                    margin: 0,
                  }}
                >
                  {t.name}
                </p>
                <p
                  style={{
                    fontFamily: F.sans,
                    fontSize: 11,
                    color: C.textMuted,
                    margin: 0,
                  }}
                >
                  {t.department || "General"} · {t.roleLabel || t.role}
                </p>
              </div>
              <span
                style={{
                  display: "inline-block",
                  padding: "2px 9px",
                  borderRadius: 12,
                  fontSize: 10.5,
                  fontWeight: 700,
                  background: t.status === "Active" ? C.successBg : C.warnBg,
                  color: t.status === "Active" ? C.successText : C.warnText,
                }}
              >
                {t.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
