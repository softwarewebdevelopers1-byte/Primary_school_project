// components/classteacher/SubjectAssignments.tsx
import React, { useState } from "react";
import { C, FONT } from "./shared/constants";
import { formatSubjectOfferingTag, type SubjectEnrollmentMode } from "../../lib/subjectEnrollment";

interface SubjectAssignmentsProps {
  subjects: any[];
  assignments: any[];
  classGrade: string;
  classStream: string;
  classTeacherName: string;
  onSwitchToSubjectDashboard: () => void;
  canSwitchToSubjectDashboard: boolean;
  onToggleSubjectOffering: (
    subjectId: string,
    isOffered: boolean,
    enrollmentMode?: SubjectEnrollmentMode,
    sharedSlotId?: string | null,
  ) => Promise<void>;
}

export const SubjectAssignments: React.FC<SubjectAssignmentsProps> = ({
  subjects,
  assignments,
  classGrade,
  classStream,
  classTeacherName,
  onSwitchToSubjectDashboard,
  canSwitchToSubjectDashboard,
  onToggleSubjectOffering,
}) => {
  const [busySubjectId, setBusySubjectId] = useState("");
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const offeredSubjects = subjects.filter((subject) => subject.isOffered !== false);
  const droppedSubjects = subjects.filter((subject) => subject.isOffered === false);
  const subjectsWithTeachers = offeredSubjects.map((subject) => {
    const assignment = assignments.find(
      (item) => item.subjectId === subject.id || item.subjectId?._id === subject.id,
    );

    return {
      ...subject,
      assignedTeacher: assignment ? assignment.teacherName : "Not assigned",
      isClassTeacher: assignment ? assignment.teacherName === classTeacherName : false,
    };
  });

  const myTeachingLoad = subjectsWithTeachers.filter((subject) => subject.isClassTeacher).length;
  const supportingTeachersCount = new Set(
    subjectsWithTeachers
      .filter((subject) => subject.assignedTeacher !== "Not assigned" && !subject.isClassTeacher)
      .map((subject) => subject.assignedTeacher),
  ).size;

  const handleToggle = async (subjectId: string, isOffered: boolean, subjectName: string) => {
    const confirmed = window.confirm(
      isOffered
        ? `Add ${subjectName} back to Grade ${classGrade}${classStream}?`
        : `Drop ${subjectName} for Grade ${classGrade}${classStream}? Any teacher assignment for that class subject will be removed.`,
    );

    if (!confirmed) {
      return;
    }

    setBusySubjectId(subjectId);
    setFeedback(null);

    try {
      const subject = subjects.find((item) => item.id === subjectId);
      await onToggleSubjectOffering(
        subjectId,
        isOffered,
        subject?.enrollmentMode || "compulsory",
        subject?.sharedSlotId || null,
      );
      setFeedback({
        text: isOffered ? `${subjectName} is active for this class again.` : `${subjectName} has been dropped for this class.`,
        type: "success",
      });
    } catch (error: any) {
      setFeedback({
        text: error?.message || "Unable to update this class subject right now.",
        type: "error",
      });
    } finally {
      setBusySubjectId("");
    }
  };

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
            Review active subjects, see who teaches each one, and trim subjects this class does not take without leaving the class dashboard.
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
          label="Active subjects"
          value={offeredSubjects.length}
          note="Currently taught in this class"
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
        <MetricCard
          label="Dropped subjects"
          value={droppedSubjects.length}
          note={droppedSubjects.length > 0 ? "Ready to add back anytime" : "Nothing dropped right now"}
        />
      </section>

      {feedback && (
        <section
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            border: `1px solid ${feedback.type === "success" ? C.green : "#e8b1b1"}`,
            background: feedback.type === "success" ? C.successBg : C.dangerBg,
            color: feedback.type === "success" ? C.successText : C.dangerText,
            fontFamily: FONT.sans,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {feedback.text}
        </section>
      )}

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
            Active subjects and assigned teachers
          </h3>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.cream }}>
                {["Subject", "Department", "Assigned teacher", "Availability"].map((heading) => (
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
                ))}
              </tr>
            </thead>
            <tbody>
              {subjectsWithTeachers.map((subject) => (
                <tr
                  key={subject.id}
                  style={{ borderTop: `1px solid ${C.borderLight}` }}
                >
                  <td style={cellStyle}>
                    <p style={primaryTextStyle}>{subject.name}</p>
                    <p style={secondaryTextStyle}>
                      {formatSubjectOfferingTag(subject.enrollmentMode, subject.sharedSlotId)} | {subject.isClassTeacher
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
                          : subject.assignedTeacher === "Not assigned"
                            ? C.dangerBg
                            : C.goldPale,
                        color: subject.isClassTeacher
                          ? C.successText
                          : subject.assignedTeacher === "Not assigned"
                            ? C.dangerText
                            : C.textMid,
                        fontFamily: FONT.sans,
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {subject.assignedTeacher}
                    </span>
                  </td>
                  <td style={cellStyle}>
                    <button
                      type="button"
                      onClick={() => void handleToggle(subject.id, false, subject.name)}
                      disabled={busySubjectId === subject.id}
                      style={{
                        padding: "7px 12px",
                        borderRadius: 999,
                        border: `1px solid ${C.gold}`,
                        background: C.goldPale,
                        color: C.gold,
                        fontFamily: FONT.sans,
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: busySubjectId === subject.id ? "wait" : "pointer",
                        opacity: busySubjectId === subject.id ? 0.7 : 1,
                      }}
                    >
                      {busySubjectId === subject.id ? "Updating..." : "Drop subject"}
                    </button>
                  </td>
                </tr>
              ))}

              {subjectsWithTeachers.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      padding: "18px 16px",
                      textAlign: "center",
                      fontFamily: FONT.sans,
                      fontSize: 13,
                      color: C.textMuted,
                    }}
                  >
                    No active subjects are configured for this class right now.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {droppedSubjects.length > 0 && (
        <section
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: "16px 18px",
            display: "grid",
            gap: 12,
          }}
        >
          <div>
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
              Dropped subjects
            </p>
            <h3
              style={{
                fontFamily: FONT.serif,
                fontSize: "1.2rem",
                fontWeight: 600,
                color: C.text,
                margin: 0,
              }}
            >
              Add subjects back when the class needs them
            </h3>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {droppedSubjects.map((subject) => (
              <div
                key={subject.id}
                style={{
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: "12px 14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                  background: C.cream,
                }}
              >
                <div>
                  <p style={primaryTextStyle}>{subject.name}</p>
                  <p style={secondaryTextStyle}>
                    {subject.department || "Academic"} | {formatSubjectOfferingTag(subject.enrollmentMode, subject.sharedSlotId)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleToggle(subject.id, true, subject.name)}
                  disabled={busySubjectId === subject.id}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 999,
                    border: `1px solid ${C.green}`,
                    background: C.successBg,
                    color: C.successText,
                    fontFamily: FONT.sans,
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: busySubjectId === subject.id ? "wait" : "pointer",
                    opacity: busySubjectId === subject.id ? 0.7 : 1,
                  }}
                >
                  {busySubjectId === subject.id ? "Updating..." : "Add back"}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
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
