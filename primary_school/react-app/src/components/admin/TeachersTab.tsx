// components/admin/TeachersTab.tsx
import React, { useState } from "react";
import { Teacher, Class } from "./types";

interface TeachersTabProps {
  teachers: Teacher[];
  classes: Class[];
  onUpdateTeachers: (teachers: Teacher[]) => void;
  onUpdateSidebarStats: () => void;
  avatar: (name: string, size: number) => string;
  pill: (text: string, color: string) => string;
  showModal: (content: React.ReactNode) => void;
  closeModal: () => void;
}

export const TeachersTab: React.FC<TeachersTabProps> = ({
  teachers,
  classes,
  onUpdateTeachers,
  onUpdateSidebarStats,
  avatar,
  pill,
  showModal,
  closeModal,
}) => {
  const [search, setSearch] = useState("");

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.department.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()),
  );

  const getTeacherClasses = (teacherId: string): string[] => {
    const classNames: string[] = [];
    classes.forEach((c) => {
      if (c.classTeacherId === teacherId) {
        classNames.push(`${c.name} (CT)`);
      }
      if (c.subjectAssignments) {
        Object.entries(c.subjectAssignments).forEach(([subjectId, tId]) => {
          if (tId === teacherId) {
            const subject = subjectId; // Would need subject lookup in real app
            classNames.push(`${c.name} (${subject.slice(0, 4)})`);
          }
        });
      }
    });
    return classNames.slice(0, 4);
  };

  const openAddTeacher = (editId?: string) => {
    const teacher = editId ? teachers.find((t) => t.id === editId) : null;

    showModal(
      <div>
        <div
          style={{
            padding: "18px 22px 14px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--serif)",
              fontSize: "1.3rem",
              fontWeight: 600,
              color: "var(--text)",
            }}
          >
            {teacher ? "Edit teacher" : "Add new teacher"}
          </h3>
          <button
            onClick={closeModal}
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: "var(--sand)",
              border: "none",
              cursor: "pointer",
              fontSize: 16,
              fontWeight: 700,
              color: "var(--textMut)",
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: "18px 22px 22px" }}>
          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                fontSize: 11.5,
                fontWeight: 700,
                color: "var(--textM)",
                letterSpacing: ".03em",
                marginBottom: 5,
              }}
            >
              Full name <span style={{ color: "var(--dText)" }}>*</span>
            </label>
            <input
              id="tName"
              type="text"
              defaultValue={teacher?.name || ""}
              placeholder="e.g. Peter Otieno"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1.5px solid var(--border)",
                borderRadius: 8,
                fontSize: 13.5,
                color: "var(--text)",
                background: "var(--cream)",
              }}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                fontSize: 11.5,
                fontWeight: 700,
                color: "var(--textM)",
                letterSpacing: ".03em",
                marginBottom: 5,
              }}
            >
              Email address <span style={{ color: "var(--dText)" }}>*</span>
            </label>
            <input
              id="tEmail"
              type="email"
              defaultValue={teacher?.email || ""}
              placeholder="teacher@school.com"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1.5px solid var(--border)",
                borderRadius: 8,
                fontSize: 13.5,
                color: "var(--text)",
                background: "var(--cream)",
              }}
            />
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: "var(--textM)",
                  letterSpacing: ".03em",
                  marginBottom: 5,
                }}
              >
                Phone
              </label>
              <input
                id="tPhone"
                type="text"
                defaultValue={teacher?.phone || ""}
                placeholder="+254..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1.5px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 13.5,
                  color: "var(--text)",
                  background: "var(--cream)",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: "var(--textM)",
                  letterSpacing: ".03em",
                  marginBottom: 5,
                }}
              >
                Status
              </label>
              <select
                id="tStatus"
                defaultValue={teacher?.status || "Active"}
                style={{
                  width: "100%",
                  padding: "10px 34px 10px 12px",
                  border: "1.5px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "var(--text)",
                  background: "var(--cream)",
                  cursor: "pointer",
                }}
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: "1rem" }}>
            <label
              style={{
                display: "block",
                fontSize: 11.5,
                fontWeight: 700,
                color: "var(--textM)",
                letterSpacing: ".03em",
                marginBottom: 5,
              }}
            >
              Department
            </label>
            <select
              id="tDept"
              defaultValue={teacher?.department || ""}
              style={{
                width: "100%",
                padding: "10px 34px 10px 12px",
                border: "1.5px solid var(--border)",
                borderRadius: 8,
                fontSize: 13,
                color: "var(--text)",
                background: "var(--cream)",
                cursor: "pointer",
              }}
            >
              <option value="">— Select department —</option>
              {[
                "Sciences",
                "Languages",
                "Humanities",
                "Arts",
                "Sports",
                "Technology",
                "Mathematics",
              ].map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
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
            <button
              onClick={closeModal}
              style={{
                padding: "8px 16px",
                background: "var(--sand)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                color: "var(--textM)",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const name = (
                  document.getElementById("tName") as HTMLInputElement
                )?.value;
                const email = (
                  document.getElementById("tEmail") as HTMLInputElement
                )?.value;
                const phone = (
                  document.getElementById("tPhone") as HTMLInputElement
                )?.value;
                const department = (
                  document.getElementById("tDept") as HTMLSelectElement
                )?.value;
                const status = (
                  document.getElementById("tStatus") as HTMLSelectElement
                )?.value;

                if (!name || !email) {
                  alert("Name and email are required.");
                  return;
                }

                if (teacher) {
                  const updatedTeachers = teachers.map((t) =>
                    t.id === teacher.id
                      ? { ...t, name, email, phone, department, status }
                      : t,
                  );
                  onUpdateTeachers(updatedTeachers);
                } else {
                  const newTeacher: Teacher = {
                    id:
                      "T" +
                      Math.random().toString(36).slice(2, 7).toUpperCase(),
                    name,
                    email,
                    phone: phone || "",
                    department: department || "General",
                    status: status || "Active",
                    joinDate: new Date().toISOString().slice(0, 10),
                  };
                  onUpdateTeachers([...teachers, newTeacher]);
                }
                closeModal();
                onUpdateSidebarStats();
              }}
              style={{
                padding: "8px 16px",
                background: "var(--gold)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {teacher ? "Save changes" : "Add teacher"}
            </button>
          </div>
        </div>
      </div>,
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
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--gold)",
              textTransform: "uppercase",
              letterSpacing: ".09em",
              margin: "0 0 3px",
            }}
          >
            Staff
          </p>
          <h2
            style={{
              fontFamily: "var(--serif)",
              fontSize: "1.8rem",
              fontWeight: 600,
              color: "var(--text)",
              margin: 0,
            }}
          >
            Teacher directory
          </h2>
        </div>
        <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, department…"
            style={{
              padding: "8px 13px",
              border: "1.5px solid var(--border)",
              borderRadius: 8,
              fontSize: 12.5,
              color: "var(--text)",
              background: "var(--cream)",
              width: 200,
            }}
          />
          <button
            onClick={() => openAddTeacher()}
            style={{
              padding: "8px 15px",
              background: "var(--gold)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            + Add teacher
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
              {[
                "Teacher",
                "Department",
                "Contact",
                "Classes",
                "Status",
                "",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "9px 13px",
                    textAlign: "left",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--textMut)",
                    letterSpacing: ".06em",
                    textTransform: "uppercase",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.map((teacher) => {
              const teacherClasses = getTeacherClasses(teacher.id);
              return (
                <tr
                  key={teacher.id}
                  style={{ borderTop: "1px solid var(--borderL)" }}
                >
                  <td style={{ padding: "10px 13px" }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 9 }}
                    >
                      <div
                        dangerouslySetInnerHTML={{
                          __html: avatar(teacher.name, 30),
                        }}
                      />
                      <div>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "var(--text)",
                            margin: 0,
                          }}
                        >
                          {teacher.name}
                        </p>
                        <p
                          style={{
                            fontSize: 10.5,
                            color: "var(--textMut)",
                            margin: 0,
                          }}
                        >
                          {teacher.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "10px 13px",
                      fontSize: 12.5,
                      color: "var(--textM)",
                    }}
                  >
                    {teacher.department}
                  </td>
                  <td
                    style={{
                      padding: "10px 13px",
                      fontSize: 12,
                      color: "var(--textMut)",
                    }}
                  >
                    {teacher.phone}
                  </td>
                  <td style={{ padding: "10px 13px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {teacherClasses.slice(0, 3).map((c) => (
                        <span
                          key={c}
                          style={{
                            padding: "2px 7px",
                            background: "var(--sand)",
                            borderRadius: 7,
                            fontSize: 10.5,
                            color: "var(--textM)",
                            fontWeight: 600,
                          }}
                        >
                          {c}
                        </span>
                      ))}
                      {teacherClasses.length > 3 && (
                        <span
                          style={{
                            padding: "2px 7px",
                            background: "var(--goldL)",
                            borderRadius: 7,
                            fontSize: 10.5,
                            color: "var(--gold)",
                            fontWeight: 700,
                          }}
                        >
                          +{teacherClasses.length - 3}
                        </span>
                      )}
                      {teacherClasses.length === 0 && (
                        <span style={{ fontSize: 11.5, color: "var(--textF)" }}>
                          No classes
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "10px 13px" }}>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: pill(
                          teacher.status,
                          teacher.status === "Active"
                            ? "green"
                            : teacher.status === "On Leave"
                              ? "amber"
                              : "gray",
                        ),
                      }}
                    />
                  </td>
                  <td style={{ padding: "10px 13px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => openAddTeacher(teacher.id)}
                        style={{
                          width: 27,
                          height: 27,
                          borderRadius: 6,
                          background: "var(--sand)",
                          border: "1px solid var(--border)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--textMut)",
                        }}
                      >
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.9"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredTeachers.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: "2.5rem",
                    textAlign: "center",
                    fontSize: "1.2rem",
                    color: "var(--textF)",
                  }}
                >
                  No teachers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
