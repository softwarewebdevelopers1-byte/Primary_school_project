import React, { useState } from "react";
import styles from "./AdminDashboard.module.css";
import { Class, Subject, Teacher } from "./types";

const miniButtonStyle: React.CSSProperties = {
  padding: "5px 10px",
  background: "var(--goldL)",
  border: "1px solid var(--gold)",
  borderRadius: 6,
  fontSize: 11,
  fontWeight: 700,
  color: "var(--gold)",
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

const tableHeadingStyle: React.CSSProperties = {
  padding: "9px 13px",
  textAlign: "left",
  fontSize: 10,
  fontWeight: 700,
  color: "var(--textMut)",
  letterSpacing: ".06em",
  textTransform: "uppercase",
};

const rowPrimaryTextStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "var(--text)",
  margin: 0,
};

const rowMetaTextStyle: React.CSSProperties = {
  fontSize: 10.5,
  color: "var(--textMut)",
  margin: 0,
};

const bodyTextStyle: React.CSSProperties = {
  padding: "10px 13px",
  fontSize: 12.5,
  color: "var(--textM)",
};

const emptyStateStyle: React.CSSProperties = {
  padding: "2.5rem",
  textAlign: "center",
  fontSize: "1.1rem",
  color: "var(--textF)",
};

const ClassTeacherModal: React.FC<{
  currentClass: Class;
  teachers: Teacher[];
  onClose: () => void;
  onSave: (teacherId: string) => Promise<void>;
}> = ({ currentClass, teachers, onClose, onSave }) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [saving, setSaving] = useState(false);

  return (
    <div>
      <div style={modalHeaderStyle}>
        <h3 style={modalTitleStyle}>Assign Class Teacher</h3>
        <button onClick={onClose} style={closeButtonStyle}>
          x
        </button>
      </div>

      <div style={{ padding: "18px 22px 22px" }}>
        <p style={{ fontSize: 13, color: "var(--textM)", marginBottom: 15 }}>
          Assigning a teacher to <strong>{currentClass.name}</strong>.
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

interface ClassesTabProps {
  classes: Class[];
  teachers: Teacher[];
  subjects: Subject[];
  onSaveClassTeacher: (payload: any, teacherId?: string) => Promise<void>;
  onUnassignClassTeacher: (teacherId: string) => Promise<void>;
  avatar: (name: string, size: number) => string;
  showModal: (content: React.ReactNode) => void;
  closeModal: () => void;
  showConfirm: (msg: string, onOk: () => void, danger?: boolean) => void;
  onBulkTermUpdate?: (term: number, year: number, examType: string) => Promise<void>;
  onSwitchTab?: (tab: string) => void;
}

export const ClassesTab: React.FC<ClassesTabProps> = ({
  classes,
  teachers,
  subjects,
  onSaveClassTeacher,
  onUnassignClassTeacher,
  avatar,
  showModal,
  closeModal,
  showConfirm,
  onSwitchTab,
}) => {
  const [search, setSearch] = useState("");

  const openAssignModal = (currentClass: Class) => {
    showModal(
      <ClassTeacherModal
        currentClass={currentClass}
        teachers={teachers.filter(t => t.roles.includes("classteacher") || t.roles.includes("subjectteacher") || t.roles.includes("admin"))}
        onClose={closeModal}
        onSave={async (teacherId) => {
          const teacher = teachers.find(t => t.id === teacherId);
          if (teacher) {
            await onSaveClassTeacher({
              ...teacher,
              role: "classteacher",
              classGrade: currentClass.grade,
              classStream: currentClass.stream,
            }, teacher.id);
          }
        }}
      />,
    );
  };

  const handleUnassign = (teacher: Teacher) => {
    showConfirm(
      `Unassign <strong>${teacher.name}</strong> from this class?`,
      async () => {
        await onUnassignClassTeacher(teacher.id);
      },
      true
    );
  };

  const filteredClasses = classes.filter((currentClass) => {
    const query = search.toLowerCase();
    return (
      currentClass.name.toLowerCase().includes(query) ||
      currentClass.grade.toLowerCase().includes(query) ||
      (currentClass.stream || "").toLowerCase().includes(query)
    );
  });

  return (
    <div className={styles.anim}>
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
          <p style={eyebrowStyle}>Classes</p>
          <h2 style={pageTitleStyle}>Class management</h2>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button 
            onClick={() => onSwitchTab?.("cycle")}
            style={{ ...primaryButtonStyle, background: "var(--gold)" }}
          >
            Manage Academic Cycle
          </button>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by grade or stream"
            style={{ ...inputStyle, width: 210 }}
          />
        </div>
      </div>

      <div style={noticeStyle}>
        Classes in this view are generated from real enrolled students and any class teachers assigned through the staff form.
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid var(--border)",
          borderRadius: 13,
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--sand)" }}>
              {["Class", "Grade", "Term", "Students", "Class Teacher", "Subjects"].map((heading) => (
                <th key={heading} style={tableHeadingStyle}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredClasses.map((currentClass) => {
              const classTeacher = teachers.find(
                (teacher) => teacher.id === currentClass.classTeacherId,
              );

              return (
                <tr key={currentClass.id} style={{ borderTop: "1px solid var(--borderL)" }}>
                  <td style={{ padding: "10px 13px" }}>
                    <p style={rowPrimaryTextStyle}>{currentClass.name}</p>
                    <p style={rowMetaTextStyle}>
                      {currentClass.stream ? `Stream ${currentClass.stream}` : "No stream added"}
                    </p>
                  </td>
                  <td style={bodyTextStyle}>{currentClass.grade}</td>
                  <td style={bodyTextStyle}>
                    <span style={{ fontWeight: 600, color: "var(--gold)" }}>
                      T{currentClass.term || 1}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--textMut)", marginLeft: 4 }}>
                      {currentClass.year || 2024}
                    </span>
                  </td>
                  <td style={{ ...bodyTextStyle, fontWeight: 700, color: "var(--text)" }}>
                    {currentClass.students}
                  </td>
                  <td style={{ padding: "10px 13px" }}>
                    {classTeacher ? (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div dangerouslySetInnerHTML={{ __html: avatar(classTeacher.name, 26) }} />
                          <div>
                            <p style={rowPrimaryTextStyle}>{classTeacher.name}</p>
                            <p style={rowMetaTextStyle}>{classTeacher.roleLabel}</p>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 5 }}>
                          <button 
                            onClick={() => openAssignModal(currentClass)}
                            style={{ ...miniButtonStyle, background: "var(--cream)", color: "var(--textM)", border: "1px solid var(--border)" }}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleUnassign(classTeacher)}
                            style={{ ...miniButtonStyle, background: "var(--dBg)", color: "var(--dText)", border: "1px solid var(--dText)" }}
                          >
                            Unassign
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => openAssignModal(currentClass)}
                        style={miniButtonStyle}
                      >
                        Assign teacher
                      </button>
                    )}
                  </td>
                  <td style={bodyTextStyle}>{subjects.length}</td>
                </tr>
              );
            })}

            {filteredClasses.length === 0 && (
              <tr>
                <td colSpan={5} style={emptyStateStyle}>
                  No classes found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
