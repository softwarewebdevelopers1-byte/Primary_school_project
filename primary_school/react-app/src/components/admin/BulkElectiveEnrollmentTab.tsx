import React, { useMemo, useState } from "react";
import { Class, Student, Subject } from "./types";

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

const rowMetaTextStyle: React.CSSProperties = {
  fontSize: 10.5,
  color: "var(--textMut)",
  margin: 0,
};

interface BulkElectiveEnrollmentTabProps {
  classes: Class[];
  students: Student[];
  subjects: Subject[];
  onBulkEnrollElective: (
    studentIds: string[],
    subjectId: string,
    classGrade: string,
    classStream: string,
    action: "enroll" | "unenroll",
  ) => Promise<void>;
}

export const BulkElectiveEnrollmentTab: React.FC<BulkElectiveEnrollmentTabProps> = ({
  classes,
  students,
  subjects,
  onBulkEnrollElective,
}) => {
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());

  const classLookup = useMemo(
    () =>
      classes.reduce<Record<string, Class>>((acc, current) => {
        acc[current.id] = current;
        return acc;
      }, {}),
    [classes],
  );

  const classesWithElectives = classes.filter((currentClass) => currentClass.electiveSubjectIds.length > 0);
  const selectedClass = classLookup[classId] || classesWithElectives[0] || null;
  const selectedClassId = selectedClass?.id || "";
  const electiveSubjects = selectedClass
    ? subjects.filter((subject) => selectedClass.electiveSubjectIds.includes(subject.id))
    : [];
  const selectedSubject = electiveSubjects.find((subject) => subject.id === subjectId) || electiveSubjects[0] || null;
  const selectedSubjectId = selectedSubject?.id || "";
  const selectedSetting =
    selectedClass && selectedSubjectId ? selectedClass.subjectSettings[selectedSubjectId] : undefined;
  const linkedSubjectIds =
    selectedClass && selectedSetting?.sharedSlotId
      ? electiveSubjects
          .filter((subject) => selectedClass.subjectSettings[subject.id]?.sharedSlotId === selectedSetting.sharedSlotId)
          .map((subject) => subject.id)
      : selectedSubjectId
        ? [selectedSubjectId]
        : [];
  const classStudents = selectedClass
    ? students.filter((student) => student.classId === selectedClass.id && student.status !== "Inactive")
    : [];

  const setSelectedClass = (nextClassId: string) => {
    const nextClass = classLookup[nextClassId] || null;
    const firstElective = nextClass
      ? subjects.find((subject) => nextClass.electiveSubjectIds.includes(subject.id))
      : null;
    setClassId(nextClassId);
    setSubjectId(firstElective?.id || "");
    setSelectedStudentIds(new Set());
  };

  const toggleStudent = (studentId: string) => {
    const next = new Set(selectedStudentIds);
    if (next.has(studentId)) {
      next.delete(studentId);
    } else {
      next.add(studentId);
    }
    setSelectedStudentIds(next);
  };

  const handleAction = async (action: "enroll" | "unenroll") => {
    if (!selectedClass || !selectedSubjectId || selectedStudentIds.size === 0) return;

    await onBulkEnrollElective(
      Array.from(selectedStudentIds),
      selectedSubjectId,
      selectedClass.grade,
      selectedClass.stream || "",
      action,
    );
    setSelectedStudentIds(new Set());
  };

  return (
    <div className="anim">
      <div style={{ marginBottom: "1.3rem" }}>
        <p style={eyebrowStyle}>Electives</p>
        <h2 style={pageTitleStyle}>Bulk elective enrollment</h2>
        <p style={{ ...rowMetaTextStyle, marginTop: 6 }}>
          Enroll or unassign active learners from elective subjects in one place.
        </p>
      </div>

      <div
        style={{
          background: "var(--white)",
          border: "1px solid var(--border)",
          borderRadius: 13,
          padding: "16px",
          display: "grid",
          gap: 14,
        }}
      >
        {classesWithElectives.length === 0 ? (
          <p style={{ margin: 0, color: "var(--textMut)", fontSize: 13 }}>
            No classes have elective subjects configured yet.
          </p>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                gap: 10,
                alignItems: "end",
              }}
            >
              <div>
                <label style={labelStyle}>Class</label>
                <select value={selectedClassId} onChange={(event) => setSelectedClass(event.target.value)} style={inputStyle}>
                  {classesWithElectives.map((currentClass) => (
                    <option key={currentClass.id} value={currentClass.id}>
                      {currentClass.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Elective subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={(event) => {
                    setSubjectId(event.target.value);
                    setSelectedStudentIds(new Set());
                  }}
                  style={inputStyle}
                >
                  {electiveSubjects.map((subject) => {
                    const setting = selectedClass?.subjectSettings[subject.id];
                    return (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                        {setting?.sharedSlotId ? ` (Pair ${setting.sharedSlotId})` : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudentIds(new Set(classStudents.map((student) => student.id)))}
                style={secondaryButtonStyle}
              >
                Select all
              </button>
              <button type="button" onClick={() => setSelectedStudentIds(new Set())} style={secondaryButtonStyle}>
                Clear
              </button>
            </div>

            <div style={{ border: "1px solid var(--borderL)", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ maxHeight: 430, overflowY: "auto" }}>
                {classStudents.map((student) => {
                  const isEnrolled = (student.enrolledSubjects || []).some(
                    (entry) =>
                      entry.isActive !== false &&
                      entry.subjectId === selectedSubjectId &&
                      entry.classGrade === selectedClass?.grade &&
                      (entry.classStream || "") === (selectedClass?.stream || ""),
                  );
                  const enrolledInPair = (student.enrolledSubjects || []).some(
                    (entry) =>
                      entry.isActive !== false &&
                      linkedSubjectIds.includes(entry.subjectId) &&
                      entry.subjectId !== selectedSubjectId &&
                      entry.classGrade === selectedClass?.grade &&
                      (entry.classStream || "") === (selectedClass?.stream || ""),
                  );

                  return (
                    <label
                      key={`${selectedClassId}-${selectedSubjectId}-${student.id}`}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "auto minmax(0, 1fr) auto",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 12px",
                        borderTop: "1px solid var(--borderL)",
                        fontSize: 12.5,
                        color: "var(--textM)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.has(student.id)}
                        onChange={() => toggleStudent(student.id)}
                      />
                      <span style={{ minWidth: 0 }}>{student.name}</span>
                      <span style={{ fontSize: 11, color: isEnrolled ? "var(--sText)" : "var(--textMut)", fontWeight: 700 }}>
                        {isEnrolled ? "Enrolled" : enrolledInPair ? "Will switch" : "Available"}
                      </span>
                    </label>
                  );
                })}
                {classStudents.length === 0 && (
                  <p style={{ padding: "24px 12px", margin: 0, textAlign: "center", color: "var(--textMut)", fontSize: 13 }}>
                    No active learners are available for this class.
                  </p>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "10px 12px", background: "var(--sand)", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => void handleAction("enroll")}
                  disabled={selectedStudentIds.size === 0}
                  style={{ ...primaryButtonStyle, opacity: selectedStudentIds.size === 0 ? 0.55 : 1 }}
                >
                  Enroll selected
                </button>
                <button
                  type="button"
                  onClick={() => void handleAction("unenroll")}
                  disabled={selectedStudentIds.size === 0}
                  style={{ ...primaryButtonStyle, background: "var(--dText)", opacity: selectedStudentIds.size === 0 ? 0.55 : 1 }}
                >
                  Unassign selected
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
