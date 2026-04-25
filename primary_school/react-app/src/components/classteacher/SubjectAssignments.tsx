// components/classteacher/SubjectAssignments.tsx
import React from "react";
import { C, FONT } from "./shared/constants";

interface SubjectAssignmentsProps {
  subjects: any[];
  assignments: any[];
  classGrade: string;
  classStream: string;
  classTeacherName: string;
  onSwitchToSubjectDashboard: () => void;
  canSwitchToSubjectDashboard: boolean;
}

export const SubjectAssignments: React.FC<SubjectAssignmentsProps> = ({
  subjects,
  assignments,
  classGrade,
  classStream,
  classTeacherName,
  onSwitchToSubjectDashboard,
  canSwitchToSubjectDashboard,
}) => {
  const subjectsWithTeachers = subjects.map(sub => {
    const assignment = assignments.find(a => a.subjectId === sub.id || a.subjectId._id === sub.id);
    return {
      ...sub,
      assignedTeacher: assignment ? assignment.teacherName : "Not assigned",
      isClassTeacher: assignment ? assignment.teacherName === classTeacherName : false
    };
  });

  const myTeachingLoad = subjectsWithTeachers.filter(s => s.isClassTeacher).length;
  const supportingTeachersCount = new Set(
    subjectsWithTeachers
      .filter(s => s.assignedTeacher !== "Not assigned" && !s.isClassTeacher)
      .map(s => s.assignedTeacher)
  ).size;

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <section
        style={{
          background: C.white,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          padding: "18px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <p
            style={{
              fontFamily: FONT.sans,
              fontSize: 10.5,
              fontWeight: 700,
              color: C.gold,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              margin: "0 0 4px",
            }}
          >
            Subject overview
          </p>
          <h2
            style={{
              fontFamily: FONT.serif,
              fontSize: "1.55rem",
              fontWeight: 600,
              color: C.text,
              margin: "0 0 6px",
            }}
          >
            Assigned teachers for Grade {classGrade}{classStream}
          </h2>
          <p
            style={{
              fontFamily: FONT.sans,
              fontSize: 13,
              color: C.textMuted,
              margin: 0,
              maxWidth: 620,
            }}
          >
            The class teacher can review subject ownership at a glance and jump
            into the subject-teacher workspace for the subjects they handle.
          </p>
        </div>
        {canSwitchToSubjectDashboard && (
          <button
            type="button"
            onClick={onSwitchToSubjectDashboard}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "none",
              background: C.green,
              color: C.white,
              fontFamily: FONT.sans,
              fontSize: 12.5,
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Open subject dashboard
          </button>
        )}
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        <MetricCard
          label="Total subjects"
          value={subjects.length}
          note="Full curriculum coverage"
        />
        <MetricCard
          label="My teaching load"
          value={myTeachingLoad}
          note="Subjects handled personally"
        />
        <MetricCard
          label="Supporting teachers"
          value={supportingTeachersCount}
          note="Other staff on this stream"
        />
      </section>

      <section
        style={{
          background: C.white,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 18px",
            borderBottom: `1px solid ${C.border}`,
            background: C.goldPale,
          }}
        >
          <p
            style={{
              fontFamily: FONT.sans,
              fontSize: 10.5,
              fontWeight: 700,
              color: C.textFaint,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              margin: "0 0 3px",
            }}
          >
            Assignment dashboard
          </p>
          <h3
            style={{
              fontFamily: FONT.serif,
              fontSize: "1.3rem",
              fontWeight: 600,
              color: C.text,
              margin: 0,
            }}
          >
            Subjects and assigned teachers
          </h3>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.cream }}>
                {["Subject", "Department", "Assigned teacher"].map(
                  (heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: "11px 16px",
                        textAlign: "left",
                        fontFamily: FONT.sans,
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: C.textFaint,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {subjectsWithTeachers.map((subject) => {
                return (
                  <tr
                    key={subject.id}
                    style={{ borderTop: `1px solid ${C.borderLight}` }}
                  >
                    <td style={cellStyle}>
                      <p style={primaryTextStyle}>{subject.name}</p>
                      <p style={secondaryTextStyle}>
                        {subject.isClassTeacher
                          ? "Taught by class teacher"
                          : "Taught by supporting staff"}
                      </p>
                    </td>
                    <td style={cellStyle}>{subject.department || "Academic"}</td>
                    <td style={cellStyle}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "5px 12px",
                          borderRadius: 20,
                          background: subject.isClassTeacher
                            ? C.successBg
                            : subject.assignedTeacher === "Not assigned" ? C.dangerBg : C.goldPale,
                          color: subject.isClassTeacher
                            ? C.successText
                            : subject.assignedTeacher === "Not assigned" ? C.dangerText : C.textMid,
                          fontFamily: FONT.sans,
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {subject.assignedTeacher}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const MetricCard: React.FC<{
  label: string;
  value: number;
  note: string;
}> = ({ label, value, note }) => (
  <div
    style={{
      background: C.white,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: "14px 16px",
    }}
  >
    <p
      style={{
        fontFamily: FONT.sans,
        fontSize: 10.5,
        fontWeight: 700,
        color: C.textFaint,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        margin: "0 0 4px",
      }}
    >
      {label}
    </p>
    <p
      style={{
        fontFamily: FONT.serif,
        fontSize: "1.75rem",
        fontWeight: 600,
        color: C.text,
        margin: "0 0 3px",
      }}
    >
      {value}
    </p>
    <p
      style={{
        fontFamily: FONT.sans,
        fontSize: 11.5,
        color: C.textMuted,
        margin: 0,
      }}
    >
      {note}
    </p>
  </div>
);

const cellStyle: React.CSSProperties = {
  padding: "14px 16px",
  fontFamily: FONT.sans,
  fontSize: 13,
  color: C.textMid,
};

const primaryTextStyle: React.CSSProperties = {
  fontFamily: FONT.sans,
  fontSize: 13,
  fontWeight: 700,
  color: C.text,
  margin: 0,
};

const secondaryTextStyle: React.CSSProperties = {
  fontFamily: FONT.sans,
  fontSize: 11,
  color: C.textMuted,
  margin: 0,
};
