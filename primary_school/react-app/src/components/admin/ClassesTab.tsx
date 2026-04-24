// components/admin/ClassesTab.tsx
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

  const filteredClasses = classes.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.grade.toLowerCase().includes(search.toLowerCase()),
  );

  const openAddClass = () => {
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
            Add new class
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
              Class name <span style={{ color: "var(--dText)" }}>*</span>
            </label>
            <input
              id="clsName"
              type="text"
              placeholder="e.g. Grade 7A"
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
              Grade / Year <span style={{ color: "var(--dText)" }}>*</span>
            </label>
            <input
              id="clsGrade"
              type="text"
              placeholder="e.g. Grade 7"
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
                Stream
              </label>
              <input
                id="clsStream"
                type="text"
                placeholder="e.g. A, B, C"
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
                Capacity
              </label>
              <input
                id="clsCap"
                type="number"
                placeholder="40"
                defaultValue="40"
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
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
              marginTop: 6,
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
                  document.getElementById("clsName") as HTMLInputElement
                )?.value;
                const grade = (
                  document.getElementById("clsGrade") as HTMLInputElement
                )?.value;
                const stream = (
                  document.getElementById("clsStream") as HTMLInputElement
                )?.value;
                const capacity = parseInt(
                  (document.getElementById("clsCap") as HTMLInputElement)
                    ?.value || "40",
                );
                if (!name || !grade) {
                  alert("Class name and grade are required.");
                  return;
                }
                const newClass: Class = {
                  id:
                    "CL" + Math.random().toString(36).slice(2, 7).toUpperCase(),
                  name,
                  grade,
                  stream,
                  capacity,
                  students: 0,
                  classTeacherId: "",
                  subjectAssignments: {},
                };
                onUpdateClasses([...classes, newClass]);
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
              Create class
            </button>
          </div>
        </div>
      </div>,
    );
  };

  const openAssignCT = (classId: string) => {
    const cls = classes.find((c) => c.id === classId);
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
            Class teacher · {cls?.name}
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
          <p
            style={{
              fontSize: 13,
              color: "var(--textMut)",
              lineHeight: 1.6,
              marginBottom: "1.1rem",
            }}
          >
            Select the teacher responsible for pastoral care and admin oversight
            of <strong style={{ color: "var(--text)" }}>{cls?.name}</strong>.
          </p>
          <select
            id="ctSel"
            style={{
              width: "100%",
              padding: "10px 34px 10px 12px",
              border: "1.5px solid var(--border)",
              borderRadius: 8,
              fontSize: 13,
              color: "var(--text)",
              background: "var(--cream)",
              cursor: "pointer",
              marginBottom: "1rem",
            }}
          >
            <option value="">— Select teacher —</option>
            {teachers
              .filter((t) => t.status === "Active")
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.department})
                </option>
              ))}
          </select>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
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
                const tid = (
                  document.getElementById("ctSel") as HTMLSelectElement
                )?.value;
                if (!tid) return;
                const updatedClasses = classes.map((c) =>
                  c.id === classId ? { ...c, classTeacherId: tid } : c,
                );
                onUpdateClasses(updatedClasses);
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
              Confirm assignment
            </button>
          </div>
        </div>
      </div>,
    );
  };

  const confirmRemoveCT = (
    classId: string,
    ctName: string,
    className: string,
  ) => {
    showConfirm(
      `Remove <strong>${ctName}</strong> as class teacher of <strong>${className}</strong>?`,
      () => {
        const updatedClasses = classes.map((c) =>
          c.id === classId ? { ...c, classTeacherId: "" } : c,
        );
        onUpdateClasses(updatedClasses);
        closeModal();
        onUpdateSidebarStats();
      },
    );
  };

  const confirmDeleteClass = (classId: string, className: string) => {
    showConfirm(
      `Permanently delete <strong>${className}</strong>? All subject assignments will also be removed.`,
      () => {
        onUpdateClasses(classes.filter((c) => c.id !== classId));
        closeModal();
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
            Classes
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
            Class management
          </h2>
        </div>
        <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search classes…"
            style={{
              padding: "8px 13px",
              border: "1.5px solid var(--border)",
              borderRadius: 8,
              fontSize: 12.5,
              color: "var(--text)",
              background: "var(--cream)",
              width: 190,
            }}
          />
          <button
            onClick={openAddClass}
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
              {[
                "Class",
                "Grade",
                "Students / Cap.",
                "Class Teacher",
                "Subjects",
                "Actions",
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
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredClasses.map((cls) => {
              const ct = teachers.find((t) => t.id === cls.classTeacherId);
              const filled = Object.keys(cls.subjectAssignments || {}).length;
              return (
                <tr
                  key={cls.id}
                  style={{ borderTop: "1px solid var(--borderL)" }}
                >
                  <td style={{ padding: "10px 13px" }}>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--text)",
                        margin: 0,
                      }}
                    >
                      {cls.name}
                    </p>
                    {cls.stream && (
                      <p
                        style={{
                          fontSize: 10.5,
                          color: "var(--textMut)",
                          margin: 0,
                        }}
                      >
                        Stream {cls.stream}
                      </p>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "10px 13px",
                      fontSize: 12.5,
                      color: "var(--textM)",
                    }}
                  >
                    {cls.grade}
                  </td>
                  <td
                    style={{
                      padding: "10px 13px",
                      fontSize: 15,
                      fontWeight: 600,
                      color: "var(--text)",
                    }}
                  >
                    {cls.students} / {cls.capacity}
                  </td>
                  <td style={{ padding: "10px 13px" }}>
                    {ct ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          dangerouslySetInnerHTML={{
                            __html: avatar(ct.name, 26),
                          }}
                        />
                        <div>
                          <p
                            style={{
                              fontSize: 12.5,
                              fontWeight: 600,
                              color: "var(--text)",
                              margin: 0,
                            }}
                          >
                            {ct.name}
                          </p>
                          <p
                            style={{
                              fontSize: 10.5,
                              color: "var(--textMut)",
                              margin: 0,
                            }}
                          >
                            {ct.department}
                          </p>
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
                  <td style={{ padding: "10px 13px" }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 7 }}
                    >
                      <div
                        style={{
                          width: 65,
                          height: 6,
                          background: "var(--sand)",
                          borderRadius: 3,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(100, (filled / Math.max(subjects.length, 1)) * 100)}%`,
                            height: "100%",
                            background: "var(--gold)",
                            borderRadius: 3,
                          }}
                        />
                      </div>
                      <span style={{ fontSize: 11.5, color: "var(--textMut)" }}>
                        {filled}/{subjects.length}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 13px" }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button
                        onClick={() => openAssignCT(cls.id)}
                        style={{
                          padding: "3px 11px",
                          background: "transparent",
                          border: "1px solid var(--border)",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--textMut)",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {ct ? "Change CT" : "Assign CT"}
                      </button>
                      {ct && (
                        <button
                          onClick={() =>
                            confirmRemoveCT(cls.id, ct.name, cls.name)
                          }
                          style={{
                            padding: "3px 10px",
                            background: "var(--dBg)",
                            border: "none",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            color: "var(--dText)",
                            cursor: "pointer",
                          }}
                        >
                          Remove CT
                        </button>
                      )}
                      <button
                        onClick={() => confirmDeleteClass(cls.id, cls.name)}
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 6,
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--textF)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.9"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                        </svg>
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
                    fontSize: "1.2rem",
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
