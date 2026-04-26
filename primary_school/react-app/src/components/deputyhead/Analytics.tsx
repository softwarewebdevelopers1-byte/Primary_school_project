// components/deputyhead/Analytics.tsx
import React from "react";
import { SectionHeader } from "./shared/SectionHeader";
import { MetricCard } from "./shared/MetricCard";
import { Avatar } from "./shared/Avatar";
import { C, F } from "./shared/constants";
import { gc } from "./shared/helpers";
interface AnalyticsProps {
  classes?: any[];
  staff?: any[];
  students?: any[];
  term?: number;
  year?: number;
}

export const Analytics: React.FC<AnalyticsProps> = ({ 
  classes = [], 
  staff = [], 
  term = 1,
  year = 2024
}) => {
  const classAvg = classes.length > 0 ? Math.round(
    classes.reduce((a, c) => a + (c.avg || 0), 0) / classes.length,
  ) : 0;
  
  const teacherAvg = staff.length > 0 ? Math.round(
    staff.reduce((a, t) => a + (t.avg || 0), 0) / staff.length,
  ) : 0;
  
  const topClass = classes.length > 0 ? classes.reduce((a, b) => ((a.avg || 0) > (b.avg || 0) ? a : b)) : { name: "N/A", avg: 0 };
  const bottomClass = classes.length > 0 ? classes.reduce((a, b) => ((a.avg || 0) < (b.avg || 0) ? a : b)) : { name: "N/A", avg: 0 };
  const sorted = [...classes].sort((a, b) => (b.avg || 0) - (a.avg || 0));
  const activeTeachers = staff.filter((t) => t.status === "active" || t.status === "Active").length;
  const highPerformers = classes.filter((c) => (c.avg || 0) >= 80).length;

  // Mock concerns since not in DB yet
  const openConcerns = 0;
  const highPriority = 0;

  return (
    <div className="dh-anim">
      <SectionHeader
        eyebrow="Insights"
        title="Performance analytics"
        sub={`Schoolwide trends · Term ${term}, ${year}`}
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
          {staff.map((t) => (
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
                      color: gc(t.avg || 0),
                    }}
                  >
                    {t.avg || 0}%
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
                      width: `${t.avg || 0}%`,
                      height: "100%",
                      background: gc(t.avg || 0),
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
                value: 0,
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
                value: classes.length,
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
