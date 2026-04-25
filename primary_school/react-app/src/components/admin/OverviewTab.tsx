import React from "react";
import styles from "./AdminDashboard.module.css";
import { Class, Student, Subject, Teacher } from "./types";

interface OverviewTabProps {
  classes: Class[];
  subjects: Subject[];
  teachers: Teacher[];
  students: Student[];
  assignments: any[];
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
    <p style={metricLabelStyle}>{label}</p>
    <p style={metricValueStyle}>{value}</p>
    <p style={metricNoteStyle}>{note}</p>
  </div>
);

export const OverviewTab: React.FC<OverviewTabProps> = ({
  classes,
  subjects,
  teachers,
  students,
  assignments,
  onSwitchTab,
  pill,
  avatar,
}) => {
  const unassignedCT = classes.filter((currentClass) => !currentClass.classTeacherId)
    .length;
  const activeTeachers = teachers.filter((teacher) => teacher.status === "Active")
    .length;
  const assignedSubjectsCount = new Set(assignments.map(a => a.subjectId)).size;
  const classesWithStudents = classes.filter((currentClass) => currentClass.students > 0)
    .length;

  const quickActions = [
    {
      label: "Review live classes",
      desc: "See classes generated from enrolled learners and class-teacher assignments.",
      tab: "classes",
      color: "#1a4a99",
    },
    {
      label: "Enroll a student",
      desc: "Create a real student record and place the learner in a grade and stream.",
      tab: "students",
      color: "var(--sText)",
    },
    {
      label: "Manage staff roles",
      desc: "Add admins, head teachers, deputy teachers, class teachers, and subject teachers.",
      tab: "teachers",
      color: "var(--gold)",
    },
    {
      label: "Review live subjects",
      desc: "Track subject ownership pulled from saved staff subject assignments.",
      tab: "subjects",
      color: "var(--gold)",
    },
  ];

  return (
    <div className={styles.anim}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <MetricCard
          label="Total classes"
          value={classes.length}
          note={`${classesWithStudents} with enrolled learners`}
          accent="#1a4a99"
        />
        <MetricCard
          label="Students"
          value={students.length}
          note="All enrolled students"
          accent="#4a3820"
        />
        <MetricCard
          label="Subjects"
          value={subjects.length}
          note={`${assignedSubjectsCount} with assigned teachers`}
        />
        <MetricCard
          label="Teaching staff"
          value={teachers.length}
          note={`${activeTeachers} active teachers`}
          accent="var(--sText)"
        />
        <MetricCard
          label="Unassigned CT"
          value={unassignedCT}
          note="Classes needing class teachers"
          accent={unassignedCT > 0 ? "var(--dText)" : "var(--sText)"}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 14 }}>
        <div
          style={{
            background: "#fff",
            border: "1px solid var(--border)",
            borderRadius: 13,
            padding: "1.3rem",
          }}
        >
          <p style={sectionLabelStyle}>Quick actions</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => onSwitchTab(action.tab)}
                style={actionButtonStyle}
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
                  <p style={actionLabelStyle}>{action.label}</p>
                  <p style={actionDescStyle}>{action.desc}</p>
                </div>
                <svg
                  style={{ marginLeft: "auto", color: "var(--textF)", flexShrink: 0 }}
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

        <div
          style={{
            background: "#fff",
            border: "1px solid var(--border)",
            borderRadius: 13,
            padding: "1.3rem",
          }}
        >
          <p style={sectionLabelStyle}>Class teacher roster</p>
          {classes.map((currentClass) => {
            const classTeacher = teachers.find(
              (teacher) => teacher.id === currentClass.classTeacherId,
            );
            return (
              <div
                key={currentClass.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  marginBottom: 10,
                }}
              >
                {classTeacher ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: avatar(classTeacher.name, 26),
                    }}
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
                  <p style={rosterPrimaryStyle}>{currentClass.name}</p>
                  <p style={rosterMetaStyle}>
                    {classTeacher ? classTeacher.name : "No class teacher"}
                  </p>
                </div>
                <span
                  dangerouslySetInnerHTML={{
                    __html: pill(
                      classTeacher ? "Assigned" : "Vacant",
                      classTeacher ? "green" : "red",
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

const metricLabelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: "var(--textF)",
  textTransform: "uppercase",
  letterSpacing: ".05em",
  margin: "0 0 5px",
};

const metricValueStyle: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontSize: "2rem",
  fontWeight: 600,
  color: "var(--text)",
  margin: "0 0 3px",
  lineHeight: 1,
};

const metricNoteStyle: React.CSSProperties = {
  fontSize: 11.5,
  color: "var(--textF)",
  margin: 0,
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: "var(--textMut)",
  textTransform: "uppercase",
  letterSpacing: ".06em",
  margin: "0 0 1rem",
};

const actionButtonStyle: React.CSSProperties = {
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
};

const actionLabelStyle: React.CSSProperties = {
  fontSize: 12.5,
  fontWeight: 700,
  color: "var(--text)",
  margin: 0,
};

const actionDescStyle: React.CSSProperties = {
  fontSize: 11,
  color: "var(--textMut)",
  margin: 0,
};

const rosterPrimaryStyle: React.CSSProperties = {
  fontSize: 12.5,
  fontWeight: 600,
  color: "var(--text)",
  margin: 0,
};

const rosterMetaStyle: React.CSSProperties = {
  fontSize: 11,
  color: "var(--textMut)",
  margin: 0,
};
