// components/admin/AssignmentsTab.tsx
import React, { useState } from "react";
import { Class, Teacher, Subject } from "./types";

interface AssignmentsTabProps {
  classes: Class[];
  teachers: Teacher[];
  subjects: Subject[];
  onUpdateClasses: (classes: Class[]) => void;
  avatar: (name: string, size: number) => string;
  pill: (text: string, color: string) => string;
}

export const AssignmentsTab: React.FC<AssignmentsTabProps> = ({
  classes,
  teachers,
  subjects,
  onUpdateClasses,
  avatar,
  pill,
}) => {
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || "");
  const [pendingAssignments, setPendingAssignments] = useState<
    Record<string, string>
  >({});

  const currentClass = classes.find((c) => c.id === selectedClassId);
  const ct = teachers.find((t) => t.id === currentClass?.classTeacherId);
  const filledCount = currentClass
    ? Object.keys(currentClass.subjectAssignments || {}).length
    : 0;

  const handleAssignmentChange = (subjectId: string, teacherId: string) => {
    setPendingAssignments((prev) => ({ ...prev, [subjectId]: teacherId }));
  };

  const handleClearAssignment = (subjectId: string) => {
    const newAssignments = { ...currentClass?.subjectAssignments };
    delete newAssignments[subjectId];
    const updatedClasses = classes.map((c) =>
      c.id === selectedClassId
        ? { ...c, subjectAssignments: newAssignments }
        : c,
    );
    onUpdateClasses(updatedClasses);
    const newPending = { ...pendingAssignments };
    delete newPending[subjectId];
    setPendingAssignments(newPending);
  };

  const handleSaveAssignments = () => {
    const updatedSubjects = {
      ...currentClass?.subjectAssignments,
      ...pendingAssignments,
    };
    const updatedClasses = classes.map((c) =>
      c.id === selectedClassId
        ? { ...c, subjectAssignments: updatedSubjects }
        : c,
    );
    onUpdateClasses(updatedClasses);
    setPendingAssignments({});
    alert("Assignments saved successfully!");
  };

  const handleDiscard = () => {
    setPendingAssignments({});
  };

  const hasChanges = Object.keys(pendingAssignments).length > 0;

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
            Assignments
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
            Subject assignments
          </h2>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 15,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <select
          value={selectedClassId}
          onChange={(e) => {
            setSelectedClassId(e.target.value);
            setPendingAssignments({});
          }}
          style={{
            padding: "9px 34px 9px 12px",
            border: "1.5px solid var(--border)",
            borderRadius: 8,
            fontSize: 13,
            color: "var(--text)",
            background: "var(--cream)",
            cursor: "pointer",
            minWidth: 180,
          }}
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div
            style={{
              background: "var(--sand)",
              borderRadius: 8,
              padding: "7px 13px",
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 11.5, color: "var(--textMut)" }}>
              Class teacher:
            </span>
            {ct ? (
              <>
                <div
                  dangerouslySetInnerHTML={{ __html: avatar(ct.name, 22) }}
                />
                <span
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: "var(--text)",
                  }}
                >
                  {ct.name}
                </span>
              </>
            ) : (
              <span
                dangerouslySetInnerHTML={{ __html: pill("Unassigned", "red") }}
              />
            )}
          </div>
          <div
            style={{
              background: "var(--sand)",
              borderRadius: 8,
              padding: "7px 13px",
            }}
          >
            <span style={{ fontSize: 11.5, color: "var(--textMut)" }}>
              Coverage:{" "}
            </span>
            <span
              style={{
                fontFamily: "var(--serif)",
                fontSize: 15,
                fontWeight: 600,
                color:
                  filledCount === subjects.length
                    ? "var(--sText)"
                    : "var(--wText)",
              }}
            >
              {filledCount}/{subjects.length}
            </span>
          </div>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {hasChanges && (
            <button
              onClick={handleDiscard}
              style={{
                padding: "8px 14px",
                background: "var(--sand)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 600,
                color: "var(--textM)",
                cursor: "pointer",
              }}
            >
              Discard
            </button>
          )}
          <button
            onClick={handleSaveAssignments}
            style={{
              padding: "8px 17px",
              background: "var(--gold)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 700,
              cursor: "pointer",
              minWidth: 130,
            }}
          >
            Save assignments
          </button>
        </div>
      </div>

      {currentClass && (
        <div
          style={{
            background: "#fff",
            border: "1px solid var(--border)",
            borderRadius: 13,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "10px 15px",
              background: "var(--cg)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p
              style={{
                fontFamily: "var(--serif)",
                fontSize: "1.1rem",
                fontWeight: 600,
                color: "#fdf9f2",
                margin: 0,
              }}
            >
              {currentClass.name} — Subject Assignments
            </p>
            <p
              style={{
                fontSize: 11,
                color: "#9eb8aa",
                margin: 0,
              }}
            >
              {currentClass.students} students · Term 1, 2024
            </p>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--sand)" }}>
                {[
                  "Subject",
                  "Dept.",
                  "Periods",
                  "Assigned teacher",
                  "Status",
                  "Clear",
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
              {subjects.map((subject) => {
                const currentAssignment =
                  currentClass.subjectAssignments?.[subject.id];
                const pendingAssignment = pendingAssignments[subject.id];
                const assignedTeacherId =
                  pendingAssignment !== undefined
                    ? pendingAssignment
                    : currentAssignment;
                const assignedTeacher = teachers.find(
                  (t) => t.id === assignedTeacherId,
                );
                const hasChange =
                  pendingAssignment !== undefined &&
                  pendingAssignment !== currentAssignment;

                return (
                  <tr
                    key={subject.id}
                    style={{
                      borderTop: "1px solid var(--borderL)",
                      background: hasChange ? "var(--goldP)" : "transparent",
                    }}
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
                        {subject.name}
                      </p>
                      <p
                        style={{
                          fontSize: 10.5,
                          color: "var(--textMut)",
                          margin: 0,
                        }}
                      >
                        {subject.code}
                      </p>
                    </td>
                    <td
                      style={{
                        padding: "10px 13px",
                        fontSize: 12,
                        color: "var(--textMut)",
                      }}
                    >
                      {subject.department}
                    </td>
                    <td
                      style={{
                        padding: "10px 13px",
                        fontSize: 15,
                        fontWeight: 600,
                        color: "var(--text)",
                      }}
                    >
                      {subject.periods}
                    </td>
                    <td style={{ padding: "10px 13px", minWidth: 210 }}>
                      <select
                        value={assignedTeacherId || ""}
                        onChange={(e) =>
                          handleAssignmentChange(subject.id, e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "7px 30px 7px 10px",
                          border: `1.5px solid ${hasChange ? "var(--gold)" : "var(--border)"}`,
                          borderRadius: 7,
                          fontSize: 12.5,
                          color: assignedTeacherId
                            ? "var(--text)"
                            : "var(--textF)",
                          background: "var(--cream)",
                          cursor: "pointer",
                        }}
                      >
                        <option value="">— Unassigned —</option>
                        {teachers
                          .filter((t) => t.status === "Active")
                          .map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name} ({t.department})
                            </option>
                          ))}
                      </select>
                      {hasChange && (
                        <p
                          style={{
                            fontSize: 9.5,
                            color: "var(--gold)",
                            margin: "2px 0 0",
                            fontWeight: 700,
                          }}
                        >
                          Unsaved change
                        </p>
                      )}
                    </td>
                    <td style={{ padding: "10px 13px" }}>
                      {assignedTeacher ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 7,
                          }}
                        >
                          <div
                            dangerouslySetInnerHTML={{
                              __html: avatar(assignedTeacher.name, 22),
                            }}
                          />
                          <span
                            style={{
                              display: "inline-block",
                              padding: "2px 9px",
                              borderRadius: 12,
                              fontSize: 10,
                              fontWeight: 700,
                              background: "var(--sBg)",
                              color: "var(--sText)",
                            }}
                          >
                            Assigned
                          </span>
                        </div>
                      ) : (
                        <span
                          dangerouslySetInnerHTML={{
                            __html: pill("Vacant", "red"),
                          }}
                        />
                      )}
                    </td>
                    <td style={{ padding: "10px 13px" }}>
                      {assignedTeacherId && (
                        <button
                          onClick={() => handleClearAssignment(subject.id)}
                          style={{
                            width: 25,
                            height: 25,
                            borderRadius: 6,
                            background: "var(--dBg)",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--dText)",
                          }}
                        >
                          ×
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
