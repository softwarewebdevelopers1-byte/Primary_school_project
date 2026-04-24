import React, { useState } from "react";
import { Class, Subject, Teacher } from "./types";

interface SubjectsTabProps {
  subjects: Subject[];
  classes: Class[];
  teachers: Teacher[];
  onUpdateSubjects: (subjects: Subject[]) => void;
  onUpdateClasses: (classes: Class[]) => void;
  onUpdateSidebarStats: () => void;
  pill: (text: string, color: string) => string;
  showModal: (content: React.ReactNode) => void;
  closeModal: () => void;
  showConfirm: (msg: string, onOk: () => void, danger?: boolean) => void;
}

const departmentColors: Record<string, string> = {
  Sciences: "#1a4a99",
  Languages: "#3b6d11",
  Humanities: "#854f0b",
  Arts: "#a32d2d",
  Sports: "#993556",
  Technology: "#4a6da8",
  Mathematics: "#c9963d",
};

const departmentBg: Record<string, string> = {
  Sciences: "#e8f0fb",
  Languages: "#eaf3de",
  Humanities: "#faeeda",
  Arts: "#fcebeb",
  Sports: "#fce8f4",
  Technology: "#e8f0fb",
  Mathematics: "#f5ead4",
};

export const SubjectsTab: React.FC<SubjectsTabProps> = ({
  subjects,
  classes,
  teachers,
  onUpdateSubjects,
  onUpdateClasses,
  onUpdateSidebarStats,
  pill,
  showModal,
  closeModal,
  showConfirm,
}) => {
  const [search, setSearch] = useState("");

  const filteredSubjects = subjects.filter((subject) => {
    const query = search.toLowerCase();
    const assignedTeacher = teachers.find(
      (teacher) => teacher.id === subject.assignedTeacherId,
    );
    return (
      subject.name.toLowerCase().includes(query) ||
      subject.department.toLowerCase().includes(query) ||
      (assignedTeacher?.name || "").toLowerCase().includes(query)
    );
  });

  const getUsageCount = (subjectId: string) =>
    classes.reduce(
      (count, currentClass) =>
        count + (currentClass.subjectAssignments?.[subjectId] ? 1 : 0),
      0,
    );

  const openSubjectModal = (subjectId?: string) => {
    const subject = subjectId
      ? subjects.find((current) => current.id === subjectId)
      : null;

    showModal(
      <div>
        <div style={headerStyle}>
          <h3 style={titleStyle}>
            {subject ? "Update subject" : "Add new subject"}
          </h3>
          <button onClick={closeModal} style={closeButtonStyle}>
            ×
          </button>
        </div>

        <div style={{ padding: "18px 22px 22px" }}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>
              Subject name <span style={{ color: "var(--dText)" }}>*</span>
            </label>
            <input
              id="subjectName"
              type="text"
              defaultValue={subject?.name || ""}
              placeholder="e.g. Mathematics"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>
              Department <span style={{ color: "var(--dText)" }}>*</span>
            </label>
            <select
              id="subjectDepartment"
              defaultValue={subject?.department || ""}
              style={inputStyle}
            >
              <option value="">Select department</option>
              {[
                "Sciences",
                "Languages",
                "Humanities",
                "Arts",
                "Sports",
                "Technology",
                "Mathematics",
              ].map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>
              Assigned teacher <span style={{ color: "var(--dText)" }}>*</span>
            </label>
            <select
              id="subjectTeacher"
              defaultValue={subject?.assignedTeacherId || ""}
              style={inputStyle}
            >
              <option value="">Select teacher</option>
              {teachers
                .filter((teacher) => teacher.status === "Active")
                .map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name} ({teacher.department})
                  </option>
                ))}
            </select>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
              marginTop: "1.5rem",
            }}
          >
            <button onClick={closeModal} style={secondaryButtonStyle}>
              Cancel
            </button>
            <button
              onClick={() => {
                const name = (
                  document.getElementById("subjectName") as HTMLInputElement
                )?.value.trim();
                const department = (
                  document.getElementById(
                    "subjectDepartment",
                  ) as HTMLSelectElement
                )?.value;
                const assignedTeacherId = (
                  document.getElementById("subjectTeacher") as HTMLSelectElement
                )?.value;

                if (!name || !department || !assignedTeacherId) {
                  alert("Subject name, department, and teacher are required.");
                  return;
                }

                const nextSubject: Subject = subject
                  ? { ...subject, name, department, assignedTeacherId }
                  : {
                      id:
                        "SUB" +
                        Math.random().toString(36).slice(2, 7).toUpperCase(),
                      name,
                      department,
                      assignedTeacherId,
                    };

                const updatedSubjects = subject
                  ? subjects.map((current) =>
                      current.id === subject.id ? nextSubject : current,
                    )
                  : [...subjects, nextSubject];

                onUpdateSubjects(updatedSubjects);
                closeModal();
                onUpdateSidebarStats();
              }}
              style={primaryButtonStyle}
            >
              {subject ? "Save changes" : "Add subject"}
            </button>
          </div>
        </div>
      </div>,
    );
  };

  const confirmDeleteSubject = (subjectId: string, name: string) => {
    showConfirm(
      `Delete <strong>${name}</strong> from the subject list? Its class assignments will also be removed.`,
      () => {
        onUpdateClasses(
          classes.map((currentClass) => {
            const nextAssignments = { ...currentClass.subjectAssignments };
            delete nextAssignments[subjectId];
            return { ...currentClass, subjectAssignments: nextAssignments };
          }),
        );
        onUpdateSubjects(
          subjects.filter((subject) => subject.id !== subjectId),
        );
        onUpdateSidebarStats();
      },
      true,
    );
  };

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
          <p style={eyebrowStyle}>Subjects</p>
          <h2 style={pageTitleStyle}>Subject management</h2>
        </div>
        <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search subjects or teacher"
            style={{ ...inputStyle, width: 220 }}
          />
          <button onClick={() => openSubjectModal()} style={primaryButtonStyle}>
            + Add subject
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 13,
        }}
      >
        {filteredSubjects.map((subject) => {
          const assignedTeacher = teachers.find(
            (teacher) => teacher.id === subject.assignedTeacherId,
          );
          const usageCount = getUsageCount(subject.id);
          return (
            <div
              key={subject.id}
              style={{
                background: "#fff",
                border: "1px solid var(--border)",
                borderRadius: 13,
                padding: "1.2rem",
                borderLeft: `4px solid ${departmentColors[subject.department] || "var(--gold)"}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 10,
                  gap: 10,
                }}
              >
                <div>
                  <h3 style={cardTitleStyle}>{subject.name}</h3>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 9,
                      fontSize: 10,
                      fontWeight: 700,
                      background:
                        departmentBg[subject.department] || "var(--goldL)",
                      color:
                        departmentColors[subject.department] || "var(--gold)",
                    }}
                  >
                    {subject.department}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 5 }}>
                  <button
                    onClick={() => openSubjectModal(subject.id)}
                    style={iconButtonStyle}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => confirmDeleteSubject(subject.id, subject.name)}
                    style={{
                      ...iconButtonStyle,
                      background: "var(--dBg)",
                      color: "var(--dText)",
                      border: "none",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div
                style={{
                  background: "var(--sand)",
                  borderRadius: 10,
                  padding: "9px 10px",
                  marginBottom: 10,
                }}
              >
                <p style={smallLabelStyle}>Assigned teacher</p>
                <p style={cardValueStyle}>{assignedTeacher?.name || "Not assigned"}</p>
              </div>

              <div style={{ display: "flex", gap: 9 }}>
                <div style={miniMetricStyle}>
                  <p style={smallLabelStyle}>Classes</p>
                  <p style={cardValueStyle}>{usageCount}</p>
                </div>
                <div style={miniMetricStyle}>
                  <p style={smallLabelStyle}>Status</p>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: pill(
                        assignedTeacher ? "Ready" : "Pending",
                        assignedTeacher ? "green" : "amber",
                      ),
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const headerStyle: React.CSSProperties = {
  padding: "18px 22px 14px",
  borderBottom: "1px solid var(--border)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const titleStyle: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontSize: "1.3rem",
  fontWeight: 600,
  color: "var(--text)",
};

const closeButtonStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 7,
  background: "var(--sand)",
  border: "none",
  cursor: "pointer",
  fontSize: 16,
  fontWeight: 700,
  color: "var(--textMut)",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11.5,
  fontWeight: 700,
  color: "var(--textM)",
  letterSpacing: ".03em",
  marginBottom: 5,
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

const primaryButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  background: "var(--gold)",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  background: "var(--sand)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  color: "var(--textM)",
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

const cardTitleStyle: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontSize: "1.2rem",
  fontWeight: 600,
  color: "var(--text)",
  margin: "0 0 6px",
};

const iconButtonStyle: React.CSSProperties = {
  padding: "4px 10px",
  borderRadius: 20,
  background: "var(--sand)",
  border: "1px solid var(--border)",
  cursor: "pointer",
  fontSize: 11,
  fontWeight: 700,
  color: "var(--textMut)",
};

const smallLabelStyle: React.CSSProperties = {
  fontSize: 9.5,
  fontWeight: 700,
  color: "var(--textF)",
  textTransform: "uppercase",
  letterSpacing: ".04em",
  margin: "0 0 4px",
};

const cardValueStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "var(--text)",
  margin: 0,
};

const miniMetricStyle: React.CSSProperties = {
  flex: 1,
  background: "var(--sand)",
  borderRadius: 10,
  padding: "9px 10px",
};
