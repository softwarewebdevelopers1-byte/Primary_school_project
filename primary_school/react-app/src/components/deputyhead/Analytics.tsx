// components/deputyhead/Analytics.tsx
import React from "react";
import { SectionHeader } from "./shared/SectionHeader";
import { MetricCard } from "./shared/MetricCard";
import { Avatar } from "./shared/Avatar";
import { C, F } from "./shared/constants";
import { CLASSES, TEACHERS, CONCERNS } from "./shared/data";
import { gc } from "./shared/helpers";

export const Analytics: React.FC = () => {
  const classAvg = Math.round(
    CLASSES.reduce((a, c) => a + c.avg, 0) / CLASSES.length,
  );
  const teacherAvg = Math.round(
    TEACHERS.reduce((a, t) => a + t.avg, 0) / TEACHERS.length,
  );
  const topClass = CLASSES.reduce((a, b) => (a.avg > b.avg ? a : b));
  const bottomClass = CLASSES.reduce((a, b) => (a.avg < b.avg ? a : b));
  const sorted = [...CLASSES].sort((a, b) => b.avg - a.avg);
  const activeTeachers = TEACHERS.filter((t) => t.status === "Active").length;
  const openConcerns = CONCERNS.filter((c) => c.status === "Open").length;
  const highPriority = CONCERNS.filter((c) => c.priority === "High").length;
  const highPerformers = CLASSES.filter((c) => c.avg >= 80).length;

  return (
    <div className="dh-anim">
      <SectionHeader
        eyebrow="Insights"
        title="Performance analytics"
        sub="Schoolwide trends · Term 1, 2024"
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
          label="School average"
          value={`${classAvg}%`}
          note="All streams"
          accent={gc(classAvg)}
        />
        <MetricCard
          label="Teacher avg"
          value={`${teacherAvg}%`}
          note="Class outcomes"
          accent={C.gold}
        />
        <MetricCard
          label="Top stream"
          value={topClass.name}
          note={`${topClass.avg}% avg`}
          accent={C.successText}
        />
        <MetricCard
          label="Needs support"
          value={bottomClass.name}
          note={`${bottomClass.avg}% avg`}
          accent={C.dangerText}
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Stream ranking */}
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
            Stream ranking
          </p>
          {sorted.map((c, i) => (
            <div
              key={c.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontFamily: F.serif,
                  fontSize: 16,
                  fontWeight: 600,
                  color: C.textFaint,
                  width: 20,
                  textAlign: "center",
                }}
              >
                {i + 1}
              </span>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontFamily: F.sans,
                      fontSize: 13,
                      color: C.textMid,
                    }}
                  >
                    {c.name}
                  </span>
                  <span
                    style={{
                      fontFamily: F.serif,
                      fontSize: 13,
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
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${c.avg}%`,
                      height: "100%",
                      background: gc(c.avg),
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Teacher performance */}
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
            Teacher performance
          </p>
          {TEACHERS.map((t) => (
            <div
              key={t.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 11,
              }}
            >
              <Avatar name={t.name} size={28} />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 3,
                  }}
                >
                  <span
                    style={{
                      fontFamily: F.sans,
                      fontSize: 12.5,
                      color: C.text,
                    }}
                  >
                    {t.name.split(" ").slice(-1)[0]}
                  </span>
                  <span
                    style={{
                      fontFamily: F.serif,
                      fontSize: 13,
                      fontWeight: 600,
                      color: gc(t.avg),
                    }}
                  >
                    {t.avg}%
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    background: C.sand,
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${t.avg}%`,
                      height: "100%",
                      background: gc(t.avg),
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Operational summary */}
        <div
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 13,
            padding: "1.3rem",
            gridColumn: "1/-1",
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
            Operational summary
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
              gap: 12,
            }}
          >
            {[
              {
                label: "Active teachers",
                value: activeTeachers,
                bg: C.successBg,
                text: C.successText,
              },
              {
                label: "On leave",
                value: TEACHERS.length - activeTeachers,
                bg: C.warnBg,
                text: C.warnText,
              },
              {
                label: "Open concerns",
                value: openConcerns,
                bg: C.dangerBg,
                text: C.dangerText,
              },
              {
                label: "High-priority",
                value: highPriority,
                bg: C.dangerBg,
                text: C.dangerText,
              },
              {
                label: "Total classes",
                value: CLASSES.length,
                bg: C.infoBg,
                text: C.infoText,
              },
              {
                label: "Streams ≥ 80%",
                value: highPerformers,
                bg: C.successBg,
                text: C.successText,
              },
            ].map(({ label, value, bg, text }) => (
              <div
                key={label}
                style={{
                  background: bg,
                  borderRadius: 10,
                  padding: "1rem",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontFamily: F.serif,
                    fontSize: "2rem",
                    fontWeight: 600,
                    color: text,
                    margin: "0 0 2px",
                    lineHeight: 1,
                  }}
                >
                  {value}
                </p>
                <p
                  style={{
                    fontFamily: F.sans,
                    fontSize: 11.5,
                    color: text,
                    margin: 0,
                    opacity: 0.85,
                  }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
