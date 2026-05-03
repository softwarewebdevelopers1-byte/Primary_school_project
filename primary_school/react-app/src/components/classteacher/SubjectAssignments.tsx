// components/classteacher/SubjectAssignments.tsx
import React, { useState } from "react";
import { C, FONT } from "./shared/constants";
import { formatSubjectOfferingTag, type SubjectEnrollmentMode } from "../../lib/subjectEnrollment";
import { isStudentSubject } from "./shared/helpers";

const generateElectivePairId = () => `EL-${crypto.randomUUID()}`;

interface SubjectAssignmentsProps {
  subjects: any[];
  assignments: any[];
  classGrade: string;
  classStream: string;
  classTeacherName: string;
  onSwitchToSubjectDashboard: () => void;
  students?: any[];
  canSwitchToSubjectDashboard: boolean;
  onBulkEnrollElective?: (studentIds: string[], subjectId: string, action: "enroll" | "unenroll") => Promise<void>;
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
  students = [],
  onSwitchToSubjectDashboard,
  canSwitchToSubjectDashboard,
  onToggleSubjectOffering,
  onBulkEnrollElective,
}) => {
  const [busySubjectId, setBusySubjectId] = useState("");
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [configSubjectId, setConfigSubjectId] = useState("");
  const [configMode, setConfigMode] = useState<SubjectEnrollmentMode>("compulsory");
  const [configSharedSlot, setConfigSharedSlot] = useState("");
  const [configSharedSlotCopied, setConfigSharedSlotCopied] = useState(false);

  const handleOpenConfig = (subject: any) => {
    setConfigSubjectId(subject.id);
    setConfigMode(subject.enrollmentMode || "compulsory");
    setConfigSharedSlot(subject.sharedSlotId || "");
    setConfigSharedSlotCopied(false);
    setConfigModalOpen(true);
  };

  const handleSaveConfig = async () => {
    setFeedback(null);
    try {
      await onToggleSubjectOffering(configSubjectId, true, configMode, configSharedSlot || null);
      setFeedback({ text: "Subject configuration saved successfully.", type: "success" });
      setConfigModalOpen(false);
    } catch (err: any) {
      setFeedback({ text: err.message || "Failed to save configuration.", type: "error" });
    }
  };

  const [selectedElective, setSelectedElective] = useState<string>("");
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());

  const handleToggleStudent = (studentId: string) => {
    const next = new Set(selectedStudents);
    if (next.has(studentId)) next.delete(studentId);
    else next.add(studentId);
    setSelectedStudents(next);
  };

  const handleSelectAll = () => {
    if (!selectedElective) return;
    const next = new Set<string>();

    students.forEach(s => {
      next.add(s.id);
    });
    setSelectedStudents(next);
  };

  const handleBulkEnroll = async (action: "enroll" | "unenroll") => {
    if (!onBulkEnrollElective || !selectedElective || selectedStudents.size === 0) return;
    try {
      await onBulkEnrollElective(Array.from(selectedStudents), selectedElective, action);
      setFeedback({ text: `Successfully ${action}ed ${selectedStudents.size} students.`, type: "success" });
      setSelectedStudents(new Set());
    } catch (err: any) {
      setFeedback({ text: err.message || `Failed to ${action} students.`, type: "error" });
    }
  };

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
                      onClick={() => handleOpenConfig(subject)}
                      style={{
                        marginRight: 8,
                        padding: "7px 12px",
                        borderRadius: 999,
                        border: `1px solid ${C.green}`,
                        background: C.successBg,
                        color: C.green,
                        fontFamily: FONT.sans,
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Configure
                    </button>
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
      {configModalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{
            background: C.white, padding: 24, borderRadius: 16, width: 400, maxWidth: "90%"
          }}>
            <h3 style={{ fontFamily: FONT.serif, fontSize: 20, margin: "0 0 16px" }}>Configure Subject</h3>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 8, fontFamily: FONT.sans, fontSize: 13, fontWeight: 600 }}>Enrollment Mode</label>
              <select 
                value={configMode} 
                onChange={e => setConfigMode(e.target.value as any)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}` }}
              >
                <option value="compulsory">Compulsory</option>
                <option value="elective">Elective</option>
              </select>
            </div>

            {configMode === "elective" && (
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", marginBottom: 8, fontFamily: FONT.sans, fontSize: 13, fontWeight: 600 }}>Shared Slot ID (for paired subjects)</label>
                <input 
                  type="text" 
                  value={configSharedSlot} 
                  onChange={e => {
                    setConfigSharedSlot(e.target.value);
                    setConfigSharedSlotCopied(false);
                  }}
                  placeholder="Generated automatically for linked electives"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, boxSizing: "border-box", marginBottom: 8 }}
                />
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setConfigSharedSlot(generateElectivePairId());
                      setConfigSharedSlotCopied(false);
                    }}
                    style={{ padding: "7px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.cream, cursor: "pointer" }}
                  >
                    Generate
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!configSharedSlot.trim()) return;
                      try {
                        await navigator.clipboard.writeText(configSharedSlot.trim());
                        setConfigSharedSlotCopied(true);
                      } catch (error) {
                        setConfigSharedSlotCopied(false);
                      }
                    }}
                    disabled={!configSharedSlot.trim()}
                    style={{ padding: "7px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.cream, cursor: configSharedSlot.trim() ? "pointer" : "default", opacity: configSharedSlot.trim() ? 1 : 0.55 }}
                  >
                    {configSharedSlotCopied ? "Copied" : "Copy ID"}
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button 
                onClick={() => setConfigModalOpen(false)}
                style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, cursor: "pointer" }}
              >Cancel</button>
              <button 
                onClick={handleSaveConfig}
                style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: C.green, color: C.white, fontWeight: 600, cursor: "pointer" }}
              >Save</button>
            </div>
          </div>
        </div>
      )}

      {offeredSubjects.filter(s => s.enrollmentMode === "elective").length > 0 && (
        <section style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
          <h3 style={{ fontFamily: FONT.serif, fontSize: 20, margin: "0 0 16px" }}>Bulk Elective Enrollment</h3>
          <p style={{ fontFamily: FONT.sans, fontSize: 13, color: C.textMuted, marginBottom: 16 }}>Select an elective subject to assign multiple students at once.</p>
          
          <select 
            value={selectedElective} 
            onChange={e => { setSelectedElective(e.target.value); setSelectedStudents(new Set()); }}
            style={{ width: "100%", maxWidth: 300, padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, marginBottom: 16 }}
          >
            <option value="">-- Choose an elective subject --</option>
            {offeredSubjects.filter(s => s.enrollmentMode === "elective").map(s => (
              <option key={s.id} value={s.id}>{s.name} {s.sharedSlotId ? `(Paired: ${s.sharedSlotId})` : ''}</option>
            ))}
          </select>

          {selectedElective && (() => {
            const currentSub = offeredSubjects.find(s => s.id === selectedElective);
            const isLinkedPair = Boolean(currentSub?.sharedSlotId);
            const pairSubjectIds = isLinkedPair ? offeredSubjects.filter(s => s.sharedSlotId === currentSub?.sharedSlotId).map(s => s.id) : [];

            return (
              <div>
                <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                  <button onClick={handleSelectAll} style={{ padding: "6px 12px", borderRadius: 6, cursor: "pointer" }}>Select All</button>
                  <button onClick={() => setSelectedStudents(new Set())} style={{ padding: "6px 12px", borderRadius: 6, cursor: "pointer" }}>Deselect All</button>
                  <span style={{ flex: 1 }} />
                  <button onClick={() => void handleBulkEnroll("enroll")} disabled={selectedStudents.size === 0} style={{ padding: "6px 16px", borderRadius: 8, background: C.green, color: "white", border: "none", cursor: "pointer", opacity: selectedStudents.size === 0 ? 0.5 : 1 }}>Enroll Selected</button>
                  <button onClick={() => void handleBulkEnroll("unenroll")} disabled={selectedStudents.size === 0} style={{ padding: "6px 16px", borderRadius: 8, background: C.dangerBg, color: C.dangerText, border: "none", cursor: "pointer", opacity: selectedStudents.size === 0 ? 0.5 : 1 }}>Unenroll Selected</button>
                </div>

                <div style={{ maxHeight: 400, overflowY: "auto", border: `1px solid ${C.borderLight}`, borderRadius: 8 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: C.sand, textAlign: "left" }}>
                        <th style={{ padding: "8px 12px", width: 40 }}></th>
                        <th style={{ padding: "8px 12px" }}>Student</th>
                        <th style={{ padding: "8px 12px" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(s => {
                        const currentSub = offeredSubjects.find(sub => sub.id === selectedElective);
                        const isEnrolled = currentSub ? isStudentSubject(s, currentSub) : false;
                        const enrolledInOther = isLinkedPair && (s.enrolledSubjects || []).some((e: any) => {
                          const eSubId = e?.subjectId?._id || e?.subjectId?.id || e?.subjectId;
                          return e.isActive && pairSubjectIds.includes(eSubId) && eSubId !== selectedElective;
                        });
                        
                        return (
                          <tr key={s.id} style={{ borderTop: `1px solid ${C.borderLight}` }}>
                            <td style={{ padding: "8px 12px", textAlign: "center" }}>
                              <input 
                                type="checkbox" 
                                checked={selectedStudents.has(s.id)}
                                onChange={() => handleToggleStudent(s.id)}
                              />
                            </td>
                            <td style={{ padding: "8px 12px", fontFamily: FONT.sans, fontSize: 13 }}>{s.name}</td>
                            <td style={{ padding: "8px 12px", fontFamily: FONT.sans, fontSize: 12 }}>
                              {isEnrolled ? (
                                <span style={{ color: C.green, fontWeight: 600 }}>Enrolled</span>
                              ) : enrolledInOther ? (
                                <span style={{ color: C.textMuted }}>Will switch</span>
                              ) : (
                                <span style={{ color: C.textMuted }}>Not enrolled</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
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
