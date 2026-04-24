// components/admin/OverviewTab.tsx
import React from "react";
import styles from "./AdminDashboard.module.css";
import { Class, Subject, Teacher } from "./types";

interface OverviewTabProps {
  classes: Class[];
  subjects: Subject[];
  teachers: Teacher[];
  onSwitchTab: (tab: string) => void;
  pill: (text: string, color: string) => string;
  avatar: (name: string, size: number) => string;
}

const MetricCard: React.FC<{
  label: string;
  value: number | string;
  note: string;
  accent?: string;
}> = ({ label, value, note, accent = "var(--gold)" }) => (
  <div
    style={{
      background: "var(--white)",
      border: "1px solid var(--border)",
      borderRadius: 12,
      padding: "1.1rem 1.2rem",
      borderTop: `3px solid ${accent}`,
    }}
  >
    <p
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: "var(--textF)",
        textTransform: "uppercase",
        letterSpacing: ".05em",
        margin: "0 0 5px",
      }}
    >
      {label}
    </p>
    <p
      style={{
        fontFamily: "var(--serif)",
        fontSize: "2rem",
        fontWeight: 600,
        color: "var(--text)",
        margin: "0 0 3px",
        lineHeight: 1,
      }}
    >
      {value}
    </p>
    <p style={{ fontSize: 11.5, color: "var(--textF)", margin: 0 }}>{note}</p>
  </div>
);

export const OverviewTab: React.FC<OverviewTabProps> = ({
  classes,
  subjects,
  teachers,
  onSwitchTab,
  pill,
  avatar,
}) => {
  const totalStudents = classes.reduce((sum, c) => sum + c.students, 0);
  const unassignedCT = classes.filter((c) => !c.classTeacherId).length;
  const assignedCount = classes.reduce(
    (sum, c) => sum + Object.keys(c.subjectAssignments || {}).length,
    0,
  );
  const activeTeachers = teachers.filter((t) => t.status === "Active").length;

  const quickActions = [
    {
      label: "Add a new class",
      desc: "Create a stream and assign a class teacher.",
      tab: "classes",
      color: "#1a4a99",
    },
    {
      label: "Add a new subject",
      desc: "Register a subject for schedules.",
      tab: "subjects",
      color: "var(--gold)",
    },
    {
      label: "Assign class teacher",
      desc: "Link a teacher as class teacher.",
      tab: "classes",
      color: "var(--sText)",
    },
    {
      label: "Subject assignments",
      desc: "Allocate subject teachers to classes.",
      tab: "assignments",
      color: "var(--wText)",
    },
  ];

  return (
    <div className={styles.anim}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <MetricCard
          label="Total classes"
          value={classes.length}
          note="All streams"
          accent="#1a4a99"
        />
        <MetricCard
          label="Total subjects"
          value={subjects.length}
          note="Across school"
        />
        <MetricCard
          label="Teaching staff"
          value={teachers.length}
          note={`${activeTeachers} active`}
          accent="var(--sText)"
        />
        <MetricCard
          label="Students"
          value={totalStudents}
          note="All enrolled"
          accent="#4a3820"
        />
        <MetricCard
          label="Unassigned"
          value={unassignedCT}
          note="Need class teacher"
          accent={unassignedCT > 0 ? "var(--dText)" : "var(--sText)"}
        />
        <MetricCard
          label="Subject slots"
          value={assignedCount}
          note="Filled assignments"
          accent="var(--wText)"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Quick Actions */}
        <div
          style={{
            background: "#fff",
            border: "1px solid var(--border)",
            borderRadius: 13,
            padding: "1.3rem",
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--textMut)",
              textTransform: "uppercase",
              letterSpacing: ".06em",
              margin: "0 0 1rem",
            }}
          >
            Quick actions
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => onSwitchTab(action.tab)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  background: "var(--sand)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  transition: "box-shadow .18s, transform .18s",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: action.color,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <p
                    style={{
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: "var(--text)",
                      margin: 0,
                    }}
                  >
                    {action.label}
                  </p>
                  <p
                    style={{ fontSize: 11, color: "var(--textMut)", margin: 0 }}
                  >
                    {action.desc}
                  </p>
                </div>
                <svg
                  style={{
                    marginLeft: "auto",
                    color: "var(--textF)",
                    flexShrink: 0,
                  }}
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Class Teacher Roster */}
        <div
          style={{
            background: "#fff",
            border: "1px solid var(--border)",
            borderRadius: 13,
            padding: "1.3rem",
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--textMut)",
              textTransform: "uppercase",
              letterSpacing: ".06em",
              margin: "0 0 1rem",
            }}
          >
            Class teacher roster
          </p>
          {classes.map((cls) => {
            const ct = teachers.find((t) => t.id === cls.classTeacherId);
            return (
              <div
                key={cls.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  marginBottom: 9,
                }}
              >
                {ct ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: avatar(ct.name, 26) }}
                  />
                ) : (
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: "var(--sand)",
                      border: "1.5px dashed var(--border)",
                      flexShrink: 0,
                    }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: "var(--text)",
                      margin: 0,
                    }}
                  >
                    {cls.name}
                  </p>
                  <p
                    style={{ fontSize: 11, color: "var(--textMut)", margin: 0 }}
                  >
                    {ct ? ct.name : "No class teacher"}
                  </p>
                </div>
                <span
                  dangerouslySetInnerHTML={{
                    __html: pill(
                      ct ? "Assigned" : "Vacant",
                      ct ? "green" : "red",
                    ),
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
