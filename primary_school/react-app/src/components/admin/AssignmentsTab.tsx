import React, { useMemo, useState } from "react";
import { Class, Subject, Teacher } from "./types";

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
  const [search, setSearch] = useState("");

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

  const updateAssignment = (
    classId: string,
    subjectId: string,
    teacherId: string,
  ) => {
    const updatedClasses = classes.map((currentClass) => {
      if (currentClass.id !== classId) {
        return currentClass;
      }

      const nextAssignments = { ...(currentClass.subjectAssignments || {}) };

      if (teacherId) {
        nextAssignments[subjectId] = teacherId;
      } else {
        delete nextAssignments[subjectId];
      }

      return {
        ...currentClass,
        subjectAssignments: nextAssignments,
      };
    });

    onUpdateClasses(updatedClasses);
  };

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
        <StatCard
          label="Live assignments"
          value={totalAssignments}
          accent="var(--sText)"
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 14,
        }}
      >
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
                    ? `Grade ${currentClass.grade} • Stream ${currentClass.stream}`
                    : `Grade ${currentClass.grade}`}
                </p>
              </div>
              <span
                dangerouslySetInnerHTML={{
                  __html: pill(
                    Object.keys(currentClass.subjectAssignments || {}).length ===
                      subjects.length
                      ? "Complete"
                      : "In progress",
                    Object.keys(currentClass.subjectAssignments || {}).length ===
                      subjects.length
                      ? "green"
                      : "amber",
                  ),
                }}
              />
            </div>

            <div style={{ padding: "14px 16px" }}>
              {subjects.map((subject) => {
                const assignedTeacherId =
                  currentClass.subjectAssignments?.[subject.id] || "";
                const assignedTeacher = assignedTeacherId
                  ? teacherLookup[assignedTeacherId]
                  : undefined;

                return (
                  <div
                    key={`${currentClass.id}-${subject.id}`}
                    style={{
                      padding: "10px 0",
                      borderTop:
                        subject.id === subjects[0]?.id
                          ? "none"
                          : "1px solid var(--borderL)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 8,
                      }}
                    >
                      <div>
                        <p style={rowPrimaryTextStyle}>{subject.name}</p>
                        <p style={rowMetaTextStyle}>{subject.department}</p>
                      </div>
                      {assignedTeacher ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            minWidth: 0,
                          }}
                        >
                          <div
                            dangerouslySetInnerHTML={{
                              __html: avatar(assignedTeacher.name, 26),
                            }}
                          />
                          <div style={{ minWidth: 0 }}>
                            <p style={rowPrimaryTextStyle}>
                              {assignedTeacher.name}
                            </p>
                            <p style={rowMetaTextStyle}>
                              {assignedTeacher.department}
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
                    </div>

                    <select
                      value={assignedTeacherId}
                      onChange={(event) =>
                        updateAssignment(
                          currentClass.id,
                          subject.id,
                          event.target.value,
                        )
                      }
                      style={inputStyle}
                    >
                      <option value="">No teacher assigned</option>
                      {teachers
                        .filter(
                          (teacher) =>
                            teacher.status === "Active" &&
                            teacher.department === subject.department,
                        )
                        .map((teacher) => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </option>
                        ))}
                      {teachers
                        .filter(
                          (teacher) =>
                            teacher.status === "Active" &&
                            teacher.department !== subject.department,
                        )
                        .map((teacher) => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.name} ({teacher.department})
                          </option>
                        ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {filteredClasses.length === 0 && (
        <div
          style={{
            background: "#fff",
            border: "1px solid var(--border)",
            borderRadius: 13,
            padding: "2.5rem",
            textAlign: "center",
            fontSize: "1.05rem",
            color: "var(--textF)",
            marginTop: 8,
          }}
        >
          No classes match this assignment search.
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{
  label: string;
  value: number;
  accent?: string;
}> = ({ label, value, accent = "var(--gold)" }) => (
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
    <p
      style={{
        fontFamily: "var(--serif)",
        fontSize: "1.9rem",
        fontWeight: 600,
        color: "var(--text)",
        margin: 0,
      }}
    >
      {value}
    </p>
  </div>
);

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

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1.5px solid var(--border)",
  borderRadius: 8,
  fontSize: 13.5,
  color: "var(--text)",
  background: "var(--cream)",
};
