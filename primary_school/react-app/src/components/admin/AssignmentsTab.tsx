import React, { useMemo, useState } from "react";
import { Class, Subject, Teacher } from "./types";

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
      background: "#fff",
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

interface AssignmentsTabProps {
  classes: Class[];
  teachers: Teacher[];
  subjects: Subject[];
  onSaveAssignment: (payload: any) => Promise<void>;
  onUnassignTeacher: (classGrade: string, classStream: string, subjectId: string) => Promise<void>;
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
  onSaveAssignment,
  onUnassignTeacher,
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

  const handleUnassign = (currentClass: Class, subject: Subject, teacher: Teacher) => {
    showConfirm(
      `Unassign <strong>${teacher.name}</strong> from teaching <strong>${subject.name}</strong> in <strong>${currentClass.name}</strong>?`,
      async () => {
        await onUnassignTeacher(currentClass.grade, currentClass.stream, subject.id);
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

    const assignmentText = Object.entries(currentClass.subjectAssignments || {})
      .map(([subjectId, teacherId]) => {
        const subject = subjectLookup[subjectId];
        const teacher = teacherLookup[teacherId];
        return `${subject?.name || ""} ${teacher?.name || ""} ${teacher?.department || ""}`;
      })
      .join(" ")
      .toLowerCase();

    return (
      currentClass.name.toLowerCase().includes(query) ||
      currentClass.grade.toLowerCase().includes(query) ||
      (currentClass.stream || "").toLowerCase().includes(query) ||
      assignmentText.includes(query)
    );
  });

  const totalAssignments = classes.reduce(
    (count, currentClass) =>
      count + Object.keys(currentClass.subjectAssignments || {}).length,
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
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
        {filteredClasses.map((currentClass) => (
          <div
            key={currentClass.id}
            style={{
              background: "#fff",
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
                  __html: pill(
                    Object.keys(currentClass.subjectAssignments || {}).length === subjects.length
                      ? "Complete"
                      : "In progress",
                    Object.keys(currentClass.subjectAssignments || {}).length === subjects.length
                      ? "green"
                      : "amber",
                  ),
                }}
              />
            </div>

            <div style={{ padding: "14px 16px" }}>
              {subjects.map((subject) => {
                const assignedTeacherId = currentClass.subjectAssignments?.[subject.id] || "";
                const assignedTeacher = assignedTeacherId
                  ? teacherLookup[assignedTeacherId]
                  : undefined;

                return (
                  <div
                    key={`${currentClass.id}-${subject.id}`}
                    style={{
                      padding: "10px 0",
                      borderTop: subject.id === subjects[0]?.id ? "none" : "1px solid var(--borderL)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                      <div>
                        <p style={rowPrimaryTextStyle}>{subject.name}</p>
                        <p style={rowMetaTextStyle}>{subject.department}</p>
                      </div>
                      {assignedTeacher ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                            <div dangerouslySetInnerHTML={{ __html: avatar(assignedTeacher.name, 26) }} />
                            <div style={{ minWidth: 0 }}>
                              <p style={rowPrimaryTextStyle}>{assignedTeacher.name}</p>
                              <p style={rowMetaTextStyle}>{assignedTeacher.department}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => openAssignmentModal(currentClass, subject)}
                            style={{ ...miniButtonStyle, background: "var(--cream)", color: "var(--textM)", border: "1px solid var(--border)" }}
                          >
                            Change
                          </button>
                          <button 
                            onClick={() => handleUnassign(currentClass, subject, assignedTeacher)}
                            style={{ ...miniButtonStyle, background: "var(--dBg)", color: "var(--dText)", border: "1px solid var(--dText)" }}
                          >
                            Unassign
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => openAssignmentModal(currentClass, subject)}
                          style={miniButtonStyle}
                        >
                          Assign teacher
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {filteredClasses.length === 0 && (
        <div style={emptyCardStyle}>No classes match this assignment search.</div>
      )}
    </div>
  );
};
