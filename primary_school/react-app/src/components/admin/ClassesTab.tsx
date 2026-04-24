import React, { useState } from "react";
import styles from "./AdminDashboard.module.css";
import { Class, Teacher, Subject } from "./types";

interface ClassesTabProps {
  classes: Class[];
  teachers: Teacher[];
  subjects: Subject[];
  onUpdateClasses: (classes: Class[]) => void;
  onUpdateSidebarStats: () => void;
  pill: (text: string, color: string) => string;
  avatar: (name: string, size: number) => string;
  showModal: (content: React.ReactNode) => void;
  closeModal: () => void;
  showConfirm: (msg: string, onOk: () => void, danger?: boolean) => void;
}

export const ClassesTab: React.FC<ClassesTabProps> = ({
  classes,
  teachers,
  subjects,
  onUpdateClasses,
  onUpdateSidebarStats,
  pill,
  avatar,
  showModal,
  closeModal,
  showConfirm,
}) => {
  const [search, setSearch] = useState("");

  const filteredClasses = classes.filter((currentClass) => {
    const query = search.toLowerCase();
    return (
      currentClass.name.toLowerCase().includes(query) ||
      currentClass.grade.toLowerCase().includes(query) ||
      (currentClass.stream || "").toLowerCase().includes(query)
    );
  });

  const openClassModal = (classId?: string) => {
    const currentClass = classId
      ? classes.find((item) => item.id === classId)
      : null;

    showModal(
      <div>
        <div style={headerStyle}>
          <h3 style={titleStyle}>
            {currentClass ? "Update class" : "Add new class"}
          </h3>
          <button onClick={closeModal} style={closeButtonStyle}>
            ×
          </button>
        </div>

        <div style={{ padding: "18px 22px 22px" }}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>
              Grade <span style={{ color: "var(--dText)" }}>*</span>
            </label>
            <input
              id="classGrade"
              type="text"
              defaultValue={currentClass?.grade || ""}
              placeholder="e.g. 7"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Stream</label>
            <input
              id="classStream"
              type="text"
              defaultValue={currentClass?.stream || ""}
              placeholder="e.g. South"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Class teacher</label>
            <select
              id="classTeacher"
              defaultValue={currentClass?.classTeacherId || ""}
              style={inputStyle}
            >
              <option value="">No class teacher yet</option>
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
                const grade = (
                  document.getElementById("classGrade") as HTMLInputElement
                )?.value.trim();
                const stream = (
                  document.getElementById("classStream") as HTMLInputElement
                )?.value.trim();
                const classTeacherId = (
                  document.getElementById("classTeacher") as HTMLSelectElement
                )?.value;

                if (!grade) {
                  alert("Grade is required.");
                  return;
                }

                const name = `Grade ${grade}${stream ? ` ${stream}` : ""}`;
                const nextClass: Class = currentClass
                  ? {
                      ...currentClass,
                      grade,
                      stream,
                      name,
                      classTeacherId,
                    }
                  : {
                      id:
                        "CL" +
                        Math.random().toString(36).slice(2, 7).toUpperCase(),
                      grade,
                      stream,
                      name,
                      students: 0,
                      classTeacherId,
                      subjectAssignments: {},
                    };

                const updatedClasses = currentClass
                  ? classes.map((item) =>
                      item.id === currentClass.id ? nextClass : item,
                    )
                  : [...classes, nextClass];

                onUpdateClasses(updatedClasses);
                closeModal();
                onUpdateSidebarStats();
              }}
              style={primaryButtonStyle}
            >
              {currentClass ? "Save changes" : "Create class"}
            </button>
          </div>
        </div>
      </div>,
    );
  };

  const openAssignCT = (classId: string) => openClassModal(classId);

  const confirmRemoveCT = (
    classId: string,
    teacherName: string,
    className: string,
  ) => {
    showConfirm(
      `Remove <strong>${teacherName}</strong> as class teacher of <strong>${className}</strong>?`,
      () => {
        onUpdateClasses(
          classes.map((currentClass) =>
            currentClass.id === classId
              ? { ...currentClass, classTeacherId: "" }
              : currentClass,
          ),
        );
        onUpdateSidebarStats();
      },
    );
  };

  const confirmDeleteClass = (classId: string, className: string) => {
    showConfirm(
      `Delete <strong>${className}</strong>? Students currently enrolled in this dummy frontend will lose the class link.`,
      () => {
        onUpdateClasses(classes.filter((currentClass) => currentClass.id !== classId));
        onUpdateSidebarStats();
      },
      true,
    );
  };

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
        <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by grade or stream"
            style={{ ...inputStyle, width: 210 }}
          />
          <button onClick={() => openClassModal()} style={primaryButtonStyle}>
            + Add class
          </button>
        </div>
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
              {["Class", "Grade", "Students", "Class Teacher", "Subjects", "Actions"].map(
                (heading) => (
                  <th key={heading} style={tableHeadingStyle}>
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {filteredClasses.map((currentClass) => {
              const classTeacher = teachers.find(
                (teacher) => teacher.id === currentClass.classTeacherId,
              );
              const assignedSubjects = Object.keys(
                currentClass.subjectAssignments || {},
              ).length;

              return (
                <tr
                  key={currentClass.id}
                  style={{ borderTop: "1px solid var(--borderL)" }}
                >
                  <td style={{ padding: "10px 13px" }}>
                    <p style={rowPrimaryTextStyle}>{currentClass.name}</p>
                    <p style={rowMetaTextStyle}>
                      {currentClass.stream
                        ? `Stream ${currentClass.stream}`
                        : "No stream added"}
                    </p>
                  </td>
                  <td style={bodyTextStyle}>{currentClass.grade}</td>
                  <td style={{ ...bodyTextStyle, fontWeight: 700, color: "var(--text)" }}>
                    {currentClass.students}
                  </td>
                  <td style={{ padding: "10px 13px" }}>
                    {classTeacher ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: avatar(classTeacher.name, 26),
                          }}
                        />
                        <div>
                          <p style={rowPrimaryTextStyle}>{classTeacher.name}</p>
                          <p style={rowMetaTextStyle}>{classTeacher.department}</p>
                        </div>
                      </div>
                    ) : (
                      <span
                        dangerouslySetInnerHTML={{
                          __html: pill("Unassigned", "red"),
                        }}
                      />
                    )}
                  </td>
                  <td style={bodyTextStyle}>
                    {assignedSubjects}/{subjects.length}
                  </td>
                  <td style={{ padding: "10px 13px" }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button
                        onClick={() => openAssignCT(currentClass.id)}
                        style={chipButtonStyle}
                      >
                        {classTeacher ? "Change CT" : "Assign CT"}
                      </button>
                      <button
                        onClick={() => openClassModal(currentClass.id)}
                        style={chipButtonStyle}
                      >
                        Edit
                      </button>
                      {classTeacher && (
                        <button
                          onClick={() =>
                            confirmRemoveCT(
                              currentClass.id,
                              classTeacher.name,
                              currentClass.name,
                            )
                          }
                          style={{
                            ...chipButtonStyle,
                            background: "var(--dBg)",
                            border: "none",
                            color: "var(--dText)",
                          }}
                        >
                          Remove CT
                        </button>
                      )}
                      <button
                        onClick={() =>
                          confirmDeleteClass(currentClass.id, currentClass.name)
                        }
                        style={{
                          ...chipButtonStyle,
                          background: "transparent",
                          color: "var(--dText)",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredClasses.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: "2.5rem",
                    textAlign: "center",
                    fontSize: "1.1rem",
                    color: "var(--textF)",
                  }}
                >
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

const chipButtonStyle: React.CSSProperties = {
  padding: "3px 11px",
  background: "var(--sand)",
  border: "1px solid var(--border)",
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 700,
  color: "var(--textMut)",
  cursor: "pointer",
  whiteSpace: "nowrap",
};
