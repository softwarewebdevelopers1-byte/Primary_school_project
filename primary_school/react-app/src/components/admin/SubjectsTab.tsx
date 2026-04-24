// components/admin/SubjectsTab.tsx
import React, { useState } from "react";
import { Subject } from "./types";

interface SubjectsTabProps {
  subjects: Subject[];
  classes: any[];
  onUpdateSubjects: (subjects: Subject[]) => void;
  onUpdateClasses: (classes: any[]) => void;
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
  Mathematics: "#C9963D",
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
  onUpdateSubjects,
  onUpdateClasses,
  onUpdateSidebarStats,
  pill,
  showModal,
  closeModal,
  showConfirm,
}) => {
  const [search, setSearch] = useState("");

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase()),
  );

  const getUsageCount = (subjectId: string): number => {
    return classes.reduce((count, c) => {
      return (
        count +
        (c.subjectAssignments && c.subjectAssignments[subjectId] ? 1 : 0)
      );
    }, 0);
  };

  const openAddSubject = (editId?: string) => {
    const subject = editId ? subjects.find((s) => s.id === editId) : null;

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
            {subject ? "Edit subject" : "Add new subject"}
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
              Subject name <span style={{ color: "var(--dText)" }}>*</span>
            </label>
            <input
              id="sName"
              type="text"
              defaultValue={subject?.name || ""}
              placeholder="e.g. Mathematics"
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
                Subject code
              </label>
              <input
                id="sCode"
                type="text"
                defaultValue={subject?.code || ""}
                placeholder="e.g. MATH"
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
                Periods/week
              </label>
              <input
                id="sPeriods"
                type="number"
                defaultValue={subject?.periods || 4}
                placeholder="4"
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
              id="sDept"
              defaultValue={subject?.department || ""}
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
                  document.getElementById("sName") as HTMLInputElement
                )?.value;
                const code = (
                  document.getElementById("sCode") as HTMLInputElement
                )?.value.toUpperCase();
                const department = (
                  document.getElementById("sDept") as HTMLSelectElement
                )?.value;
                const periods = parseInt(
                  (document.getElementById("sPeriods") as HTMLInputElement)
                    ?.value || "4",
                );

                if (!name) {
                  alert("Subject name is required.");
                  return;
                }

                if (subject) {
                  // Edit existing subject
                  const updatedSubjects = subjects.map((s) =>
                    s.id === subject.id
                      ? { ...s, name, code, department, periods }
                      : s,
                  );
                  onUpdateSubjects(updatedSubjects);
                } else {
                  // Add new subject
                  const newSubject: Subject = {
                    id:
                      "SUB" +
                      Math.random().toString(36).slice(2, 7).toUpperCase(),
                    name,
                    code: code || name.slice(0, 4).toUpperCase(),
                    department: department || "General",
                    periods,
                  };
                  onUpdateSubjects([...subjects, newSubject]);
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
              {subject ? "Save changes" : "Add subject"}
            </button>
          </div>
        </div>
      </div>,
    );
  };

  const confirmDeleteSubject = (id: string, name: string) => {
    showConfirm(
      `Remove "<strong>${name}</strong>" from the subject list? Its class assignments will also be cleared.`,
      () => {
        // Remove subject assignments from all classes
        const updatedClasses = classes.map((c) => {
          const newAssignments = { ...c.subjectAssignments };
          delete newAssignments[id];
          return { ...c, subjectAssignments: newAssignments };
        });
        onUpdateClasses(updatedClasses);
        onUpdateSubjects(subjects.filter((s) => s.id !== id));
        closeModal();
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
            Subjects
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
            Subject management
          </h2>
        </div>
        <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subjects…"
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
            onClick={() => openAddSubject()}
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
            + Add subject
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: 13,
        }}
      >
        {filteredSubjects.map((subject) => {
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
                transition: "box-shadow 0.2s, transform 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(-2px)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 4px 16px rgba(11,32,24,.09)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "";
                (e.currentTarget as HTMLElement).style.boxShadow = "";
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 10,
                }}
              >
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--serif)",
                      fontSize: "1.2rem",
                      fontWeight: 600,
                      color: "var(--text)",
                      margin: "0 0 4px",
                    }}
                  >
                    {subject.name}
                  </h3>
                  <div
                    style={{ display: "flex", gap: 6, alignItems: "center" }}
                  >
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
                      {subject.department || "General"}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--textF)" }}>
                      Code:{" "}
                      <strong style={{ color: "var(--textM)" }}>
                        {subject.code}
                      </strong>
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                  <button
                    onClick={() => openAddSubject(subject.id)}
                    style={{
                      width: 27,
                      height: 27,
                      borderRadius: 7,
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
                  <button
                    onClick={() =>
                      confirmDeleteSubject(subject.id, subject.name)
                    }
                    style={{
                      width: 27,
                      height: 27,
                      borderRadius: 7,
                      background: "var(--dBg)",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--dText)",
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
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                    </svg>
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", gap: 9 }}>
                <div
                  style={{
                    flex: 1,
                    background: "var(--sand)",
                    borderRadius: 7,
                    padding: "7px 9px",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: 9.5,
                      fontWeight: 700,
                      color: "var(--textF)",
                      textTransform: "uppercase",
                      letterSpacing: ".04em",
                      margin: "0 0 1px",
                    }}
                  >
                    Periods/wk
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--serif)",
                      fontSize: "1.5rem",
                      fontWeight: 600,
                      color: "var(--text)",
                      margin: 0,
                    }}
                  >
                    {subject.periods}
                  </p>
                </div>
                <div
                  style={{
                    flex: 1,
                    background: "var(--sand)",
                    borderRadius: 7,
                    padding: "7px 9px",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: 9.5,
                      fontWeight: 700,
                      color: "var(--textF)",
                      textTransform: "uppercase",
                      letterSpacing: ".04em",
                      margin: "0 0 1px",
                    }}
                  >
                    Classes
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--serif)",
                      fontSize: "1.5rem",
                      fontWeight: 600,
                      color: usageCount > 0 ? "var(--sText)" : "var(--textF)",
                      margin: 0,
                    }}
                  >
                    {usageCount}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
