import React, { useMemo, useState } from "react";
import { Class, Student, Subject, Teacher } from "./types";
import { formatSubjectOfferingTag, type SubjectEnrollmentMode } from "../../lib/subjectEnrollment";

const miniButtonStyle: React.CSSProperties = {
  padding: "5px 10px",
  borderRadius: 6,
  fontSize: 11,
  fontWeight: 700,
  cursor: "pointer",
};

const modalHeaderStyle: React.CSSProperties = {
  padding: "20px 22px 16px",
  borderBottom: "1px solid var(--border)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const modalTitleStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--serif)",
  fontSize: "1.3rem",
  color: "var(--text)",
};

const closeButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  fontSize: 22,
  color: "var(--textMut)",
  cursor: "pointer",
  lineHeight: 1,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: "var(--textMut)",
  textTransform: "uppercase",
  letterSpacing: ".05em",
  marginBottom: 6,
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "9px 18px",
  background: "var(--sand)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  color: "var(--textM)",
  cursor: "pointer",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "9px 18px",
  background: "var(--gold)",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: "var(--gold)",
  textTransform: "uppercase",
  letterSpacing: ".09em",
  margin: "0 0 3px",
};

const pageTitleStyle: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontSize: "1.8rem",
  fontWeight: 600,
  color: "var(--text)",
  margin: 0,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1.5px solid var(--border)",
  borderRadius: 8,
  fontSize: 13.5,
  color: "var(--text)",
  background: "var(--cream)",
};

const noticeStyle: React.CSSProperties = {
  marginBottom: 12,
  background: "var(--sand)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: "11px 14px",
  fontSize: 12.5,
  color: "var(--textM)",
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "var(--text)",
  margin: 0,
};

const rowPrimaryTextStyle: React.CSSProperties = {
  fontSize: 12.5,
  fontWeight: 700,
  color: "var(--text)",
  margin: 0,
};

const rowMetaTextStyle: React.CSSProperties = {
  fontSize: 10.5,
  color: "var(--textMut)",
  margin: 0,
};

const smallLabelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: "var(--textF)",
  textTransform: "uppercase",
  letterSpacing: ".05em",
  margin: "0 0 5px",
};

const generateElectivePairId = () =>
  `EL-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;

const metricValueStyle: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontSize: "1.9rem",
  fontWeight: 600,
  color: "var(--text)",
  margin: 0,
};

const emptyCardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid var(--border)",
  borderRadius: 13,
  padding: "2.5rem",
  textAlign: "center",
  fontSize: "1.05rem",
  color: "var(--textF)",
  marginTop: 8,
};

const StatCard: React.FC<{ label: string; value: number; accent?: string }> = ({
  label,
  value,
  accent = "var(--gold)",
}) => (
  <div
    style={{
      background: "var(--white)",
      border: "1px solid var(--border)",
      borderRadius: 12,
      padding: "1rem 1.1rem",
      borderTop: `3px solid ${accent}`,
    }}
  >
    <p style={smallLabelStyle}>{label}</p>
    <p style={metricValueStyle}>{value}</p>
  </div>
);

const AssignmentFormModal: React.FC<{
  currentClass: Class;
  subject: Subject;
  teachers: Teacher[];
  onClose: () => void;
  onSave: (teacherId: string) => Promise<void>;
}> = ({ currentClass, subject, teachers, onClose, onSave }) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [saving, setSaving] = useState(false);

  return (
    <div>
      <div style={modalHeaderStyle}>
        <h3 style={modalTitleStyle}>Assign {subject.name} Teacher</h3>
        <button onClick={onClose} style={closeButtonStyle}>
          x
        </button>
      </div>

      <div style={{ padding: "18px 22px 22px" }}>
        <p style={{ fontSize: 13, color: "var(--textM)", marginBottom: 15 }}>
          Assigning a teacher for <strong>{subject.name}</strong> in <strong>{currentClass.name}</strong>.
        </p>

        <div style={{ marginBottom: "1.2rem" }}>
          <label style={labelStyle}>Select teacher</label>
          <select
            value={selectedTeacherId}
            onChange={(event) => setSelectedTeacherId(event.target.value)}
            style={inputStyle}
          >
            <option value="">-- Choose a teacher --</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name} ({teacher.roleLabel})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: "1.5rem" }}>
          <button onClick={onClose} style={secondaryButtonStyle}>
            Cancel
          </button>
          <button
            onClick={async () => {
              if (!selectedTeacherId) return;
              setSaving(true);
              try {
                await onSave(selectedTeacherId);
              } finally {
                setSaving(false);
              }
            }}
            style={primaryButtonStyle}
            disabled={saving}
          >
            {saving ? "Assigning..." : "Confirm Assignment"}
          </button>
        </div>
      </div>
    </div>
  );
};

const SubjectConfigurationModal: React.FC<{
  currentClass: Class;
  subject: Subject;
  onClose: () => void;
  onSave: (
    isOffered: boolean,
    enrollmentMode: SubjectEnrollmentMode,
    sharedSlotId: string | null,
  ) => Promise<void>;
}> = ({ currentClass, subject, onClose, onSave }) => {
  const currentSetting = currentClass.subjectSettings[subject.id];
  const [enrollmentMode, setEnrollmentMode] = useState<SubjectEnrollmentMode>(
    currentSetting?.enrollmentMode || "compulsory",
  );
  const [sharedSlotId, setSharedSlotId] = useState(currentSetting?.sharedSlotId || "");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (enrollmentMode === "elective" && !sharedSlotId.trim()) {
      setSharedSlotId(generateElectivePairId());
    }
  }, [enrollmentMode, sharedSlotId]);

  return (
    <div>
      <div style={modalHeaderStyle}>
        <h3 style={modalTitleStyle}>Configure {subject.name}</h3>
        <button onClick={onClose} style={closeButtonStyle}>
          x
        </button>
      </div>

      <div style={{ padding: "18px 22px 22px", display: "grid", gap: 14 }}>
        <p style={{ margin: 0, fontSize: 13, color: "var(--textM)" }}>
          Set how <strong>{subject.name}</strong> behaves for <strong>{currentClass.name}</strong>.
        </p>

        <div>
          <label style={labelStyle}>Enrollment mode</label>
          <select
            value={enrollmentMode}
            onChange={(event) => setEnrollmentMode(event.target.value as SubjectEnrollmentMode)}
            style={inputStyle}
          >
            <option value="compulsory">Compulsory</option>
            <option value="elective">Elective</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Elective pair ID</label>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto auto", gap: 8 }}>
            <input
              value={sharedSlotId}
              onChange={(event) => {
                setSharedSlotId(event.target.value);
                setCopied(false);
              }}
              style={inputStyle}
              placeholder={enrollmentMode === "elective" ? "Generated automatically for linked electives" : "Only used for electives"}
              disabled={enrollmentMode !== "elective"}
            />
            <button
              type="button"
              onClick={() => {
                setSharedSlotId(generateElectivePairId());
                setCopied(false);
              }}
              style={{ ...secondaryButtonStyle, whiteSpace: "nowrap" }}
              disabled={enrollmentMode !== "elective"}
            >
              Generate
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!sharedSlotId.trim()) return;
                try {
                  await navigator.clipboard.writeText(sharedSlotId.trim());
                  setCopied(true);
                } catch (error) {
                  setCopied(false);
                }
              }}
              style={{ ...secondaryButtonStyle, whiteSpace: "nowrap" }}
              disabled={enrollmentMode !== "elective" || !sharedSlotId.trim()}
            >
              {copied ? "Copied" : "Copy ID"}
            </button>
          </div>
          <p style={{ margin: "6px 0 0", fontSize: 11.5, color: "var(--textMut)", lineHeight: 1.5 }}>
            Use the same pair ID on the other elective subject so learners choose one subject from the pair.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={secondaryButtonStyle}>
            Cancel
          </button>
          <button
            onClick={async () => {
              setSaving(true);
              try {
                await onSave(
                  true,
                  enrollmentMode,
                  enrollmentMode === "elective" ? (sharedSlotId.trim() || null) : null,
                );
              } finally {
                setSaving(false);
              }
            }}
            style={primaryButtonStyle}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save settings"}
          </button>
        </div>
      </div>
    </div>
  );
};

interface AssignmentsTabProps {
  classes: Class[];
  teachers: Teacher[];
  subjects: Subject[];
  students: Student[];
  onSaveAssignment: (payload: any) => Promise<void>;
  onUnassignTeacher: (classGrade: string, classStream: string, subjectId: string) => Promise<void>;
  onToggleSubjectOffering: (
    subjectId: string,
    classGrade: string,
    classStream: string,
    isOffered: boolean,
    enrollmentMode?: SubjectEnrollmentMode,
    sharedSlotId?: string | null,
  ) => Promise<void>;
  avatar: (name: string, size: number) => string;
  pill: (text: string, color: string) => string;
  showModal: (content: React.ReactNode) => void;
  closeModal: () => void;
  showConfirm: (msg: string, onOk: () => void, danger?: boolean) => void;
}

export const AssignmentsTab: React.FC<AssignmentsTabProps> = ({
  classes,
  teachers,
  subjects,
  students,
  onSaveAssignment,
  onUnassignTeacher,
  onToggleSubjectOffering,
  avatar,
  pill,
  showModal,
  closeModal,
  showConfirm,
}) => {
  const [search, setSearch] = useState("");

  const openAssignmentModal = (currentClass: Class, subject: Subject) => {
    showModal(
      <AssignmentFormModal
        currentClass={currentClass}
        subject={subject}
        teachers={teachers}
        onClose={closeModal}
        onSave={async (teacherId) => {
          await onSaveAssignment({
            subjectId: subject.id,
            teacherId,
            classGrade: currentClass.grade,
            classStream: currentClass.stream,
          });
        }}
      />,
    );
  };

  const openConfigurationModal = (currentClass: Class, subject: Subject) => {
    showModal(
      <SubjectConfigurationModal
        currentClass={currentClass}
        subject={subject}
        onClose={closeModal}
        onSave={async (isOffered, enrollmentMode, sharedSlotId) => {
          await onToggleSubjectOffering(
            subject.id,
            currentClass.grade,
            currentClass.stream || "",
            isOffered,
            enrollmentMode,
            sharedSlotId,
          );
          closeModal();
        }}
      />,
    );
  };

  const handleUnassign = (currentClass: Class, subject: Subject, teacher: Teacher) => {
    showConfirm(
      `Unassign <strong>${teacher.name}</strong> from teaching <strong>${subject.name}</strong> in <strong>${currentClass.name}</strong>?`,
      async () => {
        await onUnassignTeacher(currentClass.grade, currentClass.stream || "", subject.id);
      },
      true
    );
  };

  const teacherLookup = useMemo(
    () =>
      teachers.reduce<Record<string, Teacher>>((acc, teacher) => {
        acc[teacher.id] = teacher;
        return acc;
      }, {}),
    [teachers],
  );

  const subjectLookup = useMemo(
    () =>
      subjects.reduce<Record<string, Subject>>((acc, subject) => {
        acc[subject.id] = subject;
        return acc;
      }, {}),
    [subjects],
  );

  const filteredClasses = classes.filter((currentClass) => {
    const query = search.toLowerCase();
    if (!query) {
      return true;
    }

    const availableSubjects = subjects.filter((subject) =>
      currentClass.offeredSubjectIds.includes(subject.id),
    );
    const droppedSubjects = subjects.filter((subject) =>
      currentClass.droppedSubjectIds.includes(subject.id),
    );

    const assignmentText = Object.entries(currentClass.subjectAssignments || {})
      .map(([subjectId, teacherId]) => {
        const subject = subjectLookup[subjectId];
        const teacher = teacherLookup[teacherId];
        return `${subject?.name || ""} ${teacher?.name || ""} ${teacher?.department || ""}`;
      })
      .join(" ")
      .toLowerCase();
    const subjectText = [...availableSubjects, ...droppedSubjects]
      .map((subject) => `${subject.name} ${subject.department}`)
      .join(" ")
      .toLowerCase();

    return (
      currentClass.name.toLowerCase().includes(query) ||
      currentClass.grade.toLowerCase().includes(query) ||
      (currentClass.stream || "").toLowerCase().includes(query) ||
      assignmentText.includes(query) ||
      subjectText.includes(query)
    );
  });

  const totalAssignments = classes.reduce(
    (count, currentClass) =>
      count + Object.keys(currentClass.subjectAssignments || {}).length,
    0,
  );
  const totalDroppedSubjects = classes.reduce(
    (count, currentClass) => count + currentClass.droppedSubjectIds.length,
    0,
  );
  const totalElectiveSubjects = classes.reduce(
    (count, currentClass) => count + currentClass.electiveSubjectIds.length,
    0,
  );

  return (
    <div className="anim">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.3rem",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <p style={eyebrowStyle}>Assignments</p>
          <h2 style={pageTitleStyle}>Subject assignments</h2>
        </div>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search class, subject, or teacher"
          style={{ ...inputStyle, width: 260 }}
        />
      </div>

      <div style={noticeStyle}>
        These assignments are read from the live subject-owner data on staff records.
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <StatCard label="Classes" value={classes.length} />
        <StatCard label="Subjects" value={subjects.length} accent="#1a4a99" />
        <StatCard label="Live assignments" value={totalAssignments} accent="var(--sText)" />
        <StatCard label="Elective setups" value={totalElectiveSubjects} accent="#7b5cff" />
        <StatCard label="Dropped subjects" value={totalDroppedSubjects} accent="var(--dText)" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
        {filteredClasses.map((currentClass) => {
          const availableSubjects = subjects.filter((subject) =>
            currentClass.offeredSubjectIds.includes(subject.id),
          );
          const droppedSubjects = subjects.filter((subject) =>
            currentClass.droppedSubjectIds.includes(subject.id),
          );
          const assignedCount = Object.keys(currentClass.subjectAssignments || {}).length;
          const statusText =
            availableSubjects.length === 0
              ? "No active subjects"
              : assignedCount === availableSubjects.length
                ? "Complete"
                : "In progress";
          const statusColor =
            availableSubjects.length === 0
              ? "gray"
              : assignedCount === availableSubjects.length
                ? "green"
                : "amber";

          return (
            <div
              key={currentClass.id}
              style={{
                background: "var(--white)",
                border: "1px solid var(--border)",
                borderRadius: 13,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "14px 16px",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div>
                  <p style={cardTitleStyle}>{currentClass.name}</p>
                  <p style={rowMetaTextStyle}>
                    {currentClass.stream
                      ? `Grade ${currentClass.grade} - Stream ${currentClass.stream}`
                      : `Grade ${currentClass.grade}`}
                  </p>
                </div>
                <span
                  dangerouslySetInnerHTML={{
                    __html: pill(statusText, statusColor),
                  }}
                />
              </div>

              <div style={{ padding: "14px 16px" }}>
                {availableSubjects.map((subject) => {
                const assignedTeacherId = currentClass.subjectAssignments?.[subject.id] || "";
                const assignedTeacher = assignedTeacherId
                  ? teacherLookup[assignedTeacherId]
                  : undefined;
                const subjectSetting = currentClass.subjectSettings[subject.id];
                const eligibleStudentCount =
                  (subjectSetting?.enrollmentMode || "compulsory") === "elective"
                    ? students.filter(
                        (student) =>
                          student.classId === currentClass.id &&
                          (student.enrolledSubjects || []).some(
                            (entry) =>
                              entry.isActive !== false &&
                              entry.subjectId === subject.id &&
                              entry.classGrade === currentClass.grade &&
                              (entry.classStream || "") === (currentClass.stream || ""),
                          ),
                      ).length
                    : currentClass.students;

                return (
                  <div
                    key={`${currentClass.id}-${subject.id}`}
                    style={{
                      padding: "10px 0",
                      borderTop: availableSubjects[0]?.id === subject.id ? "none" : "1px solid var(--borderL)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ minWidth: 0, flex: "1 1 180px" }}>
                        <p style={rowPrimaryTextStyle}>{subject.name}</p>
                        <p style={rowMetaTextStyle}>
                          {subject.department} | {formatSubjectOfferingTag(subjectSetting?.enrollmentMode, subjectSetting?.sharedSlotId)} | {eligibleStudentCount} learner{eligibleStudentCount === 1 ? "" : "s"}
                        </p>
                      </div>
                      {assignedTeacher ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 12,
                            minWidth: 0,
                            flex: "1 1 280px",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: "1 1 180px" }}>
                            <div dangerouslySetInnerHTML={{ __html: avatar(assignedTeacher.name, 26) }} />
                            <div style={{ minWidth: 0 }}>
                              <p style={rowPrimaryTextStyle}>{assignedTeacher.name}</p>
                              <p style={rowMetaTextStyle}>{assignedTeacher.department}</p>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end", flex: "1 1 260px" }}>
                            <button 
                              onClick={() => openAssignmentModal(currentClass, subject)}
                              style={{ ...miniButtonStyle, background: "var(--cream)", color: "var(--textM)", border: "1px solid var(--border)" }}
                            >
                              Change
                            </button>
                            <button
                              onClick={() => openConfigurationModal(currentClass, subject)}
                              style={{ ...miniButtonStyle, background: "#f4f0ff", color: "#5a35b4", border: "1px solid #c9b9ff" }}
                            >
                              Configure
                            </button>
                            <button 
                              onClick={() => handleUnassign(currentClass, subject, assignedTeacher)}
                              style={{ ...miniButtonStyle, background: "var(--dBg)", color: "var(--dText)", border: "1px solid var(--dText)" }}
                            >
                              Unassign
                            </button>
                            <button
                              onClick={() =>
                                showConfirm(
                                  `Drop <strong>${subject.name}</strong> for <strong>${currentClass.name}</strong>? Teacher assignment for this class subject will be removed until the subject is added back.`,
                                  async () => {
                                    await onToggleSubjectOffering(
                                      subject.id,
                                      currentClass.grade,
                                      currentClass.stream || "",
                                      false,
                                      subjectSetting?.enrollmentMode || "compulsory",
                                      subjectSetting?.sharedSlotId || null,
                                    );
                                  },
                                  true,
                                )
                              }
                              style={{ ...miniButtonStyle, background: "#fff8ef", color: "var(--gold)", border: "1px solid var(--gold)" }}
                            >
                              Drop subject
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end", flex: "1 1 220px" }}>
                          <button 
                            onClick={() => openAssignmentModal(currentClass, subject)}
                            style={miniButtonStyle}
                          >
                            Assign teacher
                          </button>
                          <button
                            onClick={() => openConfigurationModal(currentClass, subject)}
                            style={{ ...miniButtonStyle, background: "#f4f0ff", color: "#5a35b4", border: "1px solid #c9b9ff" }}
                          >
                            Configure
                          </button>
                          <button
                            onClick={() =>
                              showConfirm(
                                `Drop <strong>${subject.name}</strong> for <strong>${currentClass.name}</strong>?`,
                                async () => {
                                  await onToggleSubjectOffering(
                                    subject.id,
                                    currentClass.grade,
                                    currentClass.stream || "",
                                    false,
                                    subjectSetting?.enrollmentMode || "compulsory",
                                    subjectSetting?.sharedSlotId || null,
                                  );
                                },
                                true,
                              )
                            }
                            style={{ ...miniButtonStyle, background: "#fff8ef", color: "var(--gold)", border: "1px solid var(--gold)" }}
                          >
                            Drop subject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

                {availableSubjects.length === 0 && (
                  <div style={{ ...noticeStyle, marginTop: 0 }}>
                    No subjects are currently active for this class. Add one back below to resume assignments and marks entry.
                  </div>
                )}

                {droppedSubjects.length > 0 && (
                  <div
                    style={{
                      marginTop: 14,
                      paddingTop: 14,
                      borderTop: "1px dashed var(--border)",
                      display: "grid",
                      gap: 10,
                    }}
                  >
                    <div>
                      <p style={smallLabelStyle}>Dropped for this class</p>
                      <p style={rowMetaTextStyle}>
                        These subjects stay hidden from assignments and marks entry until they are added back.
                      </p>
                    </div>
                    <div style={{ display: "grid", gap: 8 }}>
                      {droppedSubjects.map((subject) => (
                        <div
                          key={`${currentClass.id}-${subject.id}-dropped`}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 10,
                            background: "var(--sand)",
                            border: "1px solid var(--border)",
                            borderRadius: 10,
                            padding: "10px 12px",
                          }}
                        >
                            <div>
                              <p style={rowPrimaryTextStyle}>{subject.name}</p>
                              <p style={rowMetaTextStyle}>
                                {subject.department} | {formatSubjectOfferingTag(
                                  currentClass.subjectSettings[subject.id]?.enrollmentMode,
                                  currentClass.subjectSettings[subject.id]?.sharedSlotId,
                                )}
                              </p>
                            </div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <button
                              onClick={() => openConfigurationModal(currentClass, subject)}
                              style={{ ...miniButtonStyle, background: "#f4f0ff", color: "#5a35b4", border: "1px solid #c9b9ff" }}
                            >
                              Configure
                            </button>
                            <button
                              onClick={() =>
                                showConfirm(
                                  `Add <strong>${subject.name}</strong> back to <strong>${currentClass.name}</strong>?`,
                                  async () => {
                                    const subjectSetting = currentClass.subjectSettings[subject.id];
                                    await onToggleSubjectOffering(
                                      subject.id,
                                      currentClass.grade,
                                      currentClass.stream || "",
                                      true,
                                      subjectSetting?.enrollmentMode || "compulsory",
                                      subjectSetting?.sharedSlotId || null,
                                    );
                                  },
                                )
                              }
                              style={{ ...miniButtonStyle, background: "var(--sBg)", color: "var(--sText)", border: "1px solid var(--sText)" }}
                            >
                              Add back
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredClasses.length === 0 && (
        <div style={emptyCardStyle}>No classes match this assignment search.</div>
      )}
    </div>
  );
};
