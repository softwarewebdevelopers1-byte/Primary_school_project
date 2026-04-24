import React, { useMemo, useState } from "react";
import { Class, Student } from "./types";

interface StudentsTabProps {
  students: Student[];
  classes: Class[];
  onUpdateStudents: (students: Student[]) => void;
  onUpdateSidebarStats: () => void;
  pill: (text: string, color: string) => string;
  showModal: (content: React.ReactNode) => void;
  closeModal: () => void;
  showConfirm: (msg: string, onOk: () => void, danger?: boolean) => void;
}

export const StudentsTab: React.FC<StudentsTabProps> = ({
  students,
  classes,
  onUpdateStudents,
  onUpdateSidebarStats,
  pill,
  showModal,
  closeModal,
  showConfirm,
}) => {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");

  const classLookup = useMemo(
    () =>
      classes.reduce<Record<string, Class>>((acc, current) => {
        acc[current.id] = current;
        return acc;
      }, {}),
    [classes],
  );

  const gradeOptions = useMemo(
    () => Array.from(new Set(classes.map((currentClass) => currentClass.grade))),
    [classes],
  );

  const filteredStudents = students.filter((student) => {
    const query = search.toLowerCase();
    const matchesSearch =
      student.name.toLowerCase().includes(query) ||
      student.admissionNo.toLowerCase().includes(query) ||
      student.guardianName.toLowerCase().includes(query);
    const matchesClass =
      classFilter === "all" || student.classId === classFilter;
    return matchesSearch && matchesClass;
  });

  const openStudentModal = (studentId?: string) => {
    const student = studentId
      ? students.find((current) => current.id === studentId) || null
      : null;

    showModal(
      <StudentFormModal
        student={student}
        classes={classes}
        gradeOptions={gradeOptions}
        onClose={closeModal}
        onSave={(nextStudent) => {
          const updatedStudents = student
            ? students.map((current) =>
                current.id === student.id ? nextStudent : current,
              )
            : [...students, nextStudent];

          onUpdateStudents(updatedStudents);
          closeModal();
          onUpdateSidebarStats();
        }}
      />,
    );
  };

  const confirmDeleteStudent = (studentId: string, name: string) => {
    showConfirm(
      `Delete <strong>${name}</strong> from the enrolled students list?`,
      () => {
        onUpdateStudents(students.filter((student) => student.id !== studentId));
        closeModal();
        onUpdateSidebarStats();
      },
      true,
    );
  };

  const totalActive = students.filter((student) => student.status === "Active")
    .length;

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
            Students
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
            Student management
          </h2>
        </div>

        <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name or admission no."
            style={{ ...inputStyle, width: 220 }}
          />
          <select
            value={classFilter}
            onChange={(event) => setClassFilter(event.target.value)}
            style={{ ...inputStyle, width: 170 }}
          >
            <option value="all">All classes</option>
            {classes.map((currentClass) => (
              <option key={currentClass.id} value={currentClass.id}>
                {currentClass.name}
              </option>
            ))}
          </select>
          <button onClick={() => openStudentModal()} style={primaryButtonStyle}>
            + Add student
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <StatCard label="Enrolled students" value={students.length} />
        <StatCard label="Active students" value={totalActive} accent="var(--sText)" />
        <StatCard
          label="Classes with learners"
          value={classes.filter((currentClass) => currentClass.students > 0).length}
          accent="#1a4a99"
        />
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
                "Student",
                "Admission no.",
                "Class",
                "Guardian",
                "Status",
                "Actions",
              ].map((heading) => (
                <th
                  key={heading}
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
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => {
              const currentClass = classLookup[student.classId];
              return (
                <tr
                  key={student.id}
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
                      {student.name}
                    </p>
                    <p
                      style={{
                        fontSize: 10.5,
                        color: "var(--textMut)",
                        margin: 0,
                      }}
                    >
                      {student.gender}
                    </p>
                  </td>
                  <td style={{ padding: "10px 13px", fontSize: 12.5, color: "var(--textM)" }}>
                    {student.admissionNo}
                  </td>
                  <td style={{ padding: "10px 13px" }}>
                    <p style={{ margin: 0, fontSize: 12.5, color: "var(--text)" }}>
                      {currentClass?.name || "Not assigned"}
                    </p>
                    <p style={{ margin: 0, fontSize: 10.5, color: "var(--textMut)" }}>
                      Grade {currentClass?.grade || "-"}
                      {currentClass?.stream ? ` - Stream ${currentClass.stream}` : ""}
                    </p>
                  </td>
                  <td style={{ padding: "10px 13px" }}>
                    <p style={{ margin: 0, fontSize: 12.5, color: "var(--text)" }}>
                      {student.guardianName}
                    </p>
                    <p style={{ margin: 0, fontSize: 10.5, color: "var(--textMut)" }}>
                      {student.guardianPhone}
                    </p>
                  </td>
                  <td style={{ padding: "10px 13px" }}>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: pill(
                          student.status || "Active",
                          student.status === "Transferred"
                            ? "amber"
                            : student.status === "Pending"
                              ? "gray"
                              : "green",
                        ),
                      }}
                    />
                  </td>
                  <td style={{ padding: "10px 13px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => openStudentModal(student.id)}
                        style={iconButtonStyle}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          confirmDeleteStudent(student.id, student.name)
                        }
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
                  </td>
                </tr>
              );
            })}

            {filteredStudents.length === 0 && (
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
                  No enrolled students match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StudentFormModal: React.FC<{
  student: Student | null;
  classes: Class[];
  gradeOptions: string[];
  onClose: () => void;
  onSave: (student: Student) => void;
}> = ({ student, classes, gradeOptions, onClose, onSave }) => {
  const currentClass = student
    ? classes.find((current) => current.id === student.classId) || null
    : null;

  const [name, setName] = useState(student?.name || "");
  const [admissionNo, setAdmissionNo] = useState(student?.admissionNo || "");
  const [grade, setGrade] = useState(currentClass?.grade || gradeOptions[0] || "");
  const [gender, setGender] = useState(student?.gender || "Female");
  const [status, setStatus] = useState(student?.status || "Active");
  const [guardianName, setGuardianName] = useState(student?.guardianName || "");
  const [guardianPhone, setGuardianPhone] = useState(student?.guardianPhone || "");

  const streamOptions = useMemo(() => {
    const options = classes
      .filter((currentClassItem) => currentClassItem.grade === grade)
      .map((currentClassItem) => currentClassItem.stream || "");
    return Array.from(new Set(options));
  }, [classes, grade]);

  const [stream, setStream] = useState(currentClass?.stream || streamOptions[0] || "");

  return (
    <div>
      <div style={modalHeaderStyle}>
        <h3 style={modalTitleStyle}>{student ? "Update student" : "Add student"}</h3>
        <button onClick={onClose} style={closeButtonStyle}>
          x
        </button>
      </div>

      <div style={{ padding: "18px 22px 22px" }}>
        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>
            Student name <span style={{ color: "var(--dText)" }}>*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Amina Wanjiru"
            style={inputStyle}
          />
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <div>
            <label style={labelStyle}>
              Admission no. <span style={{ color: "var(--dText)" }}>*</span>
            </label>
            <input
              type="text"
              value={admissionNo}
              onChange={(event) => setAdmissionNo(event.target.value)}
              placeholder="e.g. ADM-1042"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>
              Grade <span style={{ color: "var(--dText)" }}>*</span>
            </label>
            <select
              value={grade}
              onChange={(event) => {
                const nextGrade = event.target.value;
                const nextStreams = Array.from(
                  new Set(
                    classes
                      .filter((currentClassItem) => currentClassItem.grade === nextGrade)
                      .map((currentClassItem) => currentClassItem.stream || ""),
                  ),
                );
                setGrade(nextGrade);
                setStream(nextStreams[0] || "");
              }}
              style={inputStyle}
            >
              {gradeOptions.map((currentGrade) => (
                <option key={currentGrade} value={currentGrade}>
                  Grade {currentGrade}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginTop: "1rem",
          }}
        >
          <div>
            <label style={labelStyle}>
              Stream <span style={{ color: "var(--dText)" }}>*</span>
            </label>
            <select
              value={stream}
              onChange={(event) => setStream(event.target.value)}
              style={inputStyle}
            >
              {streamOptions.map((currentStream) => (
                <option key={currentStream || "no-stream"} value={currentStream}>
                  {currentStream || "No stream"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Gender</label>
            <select
              value={gender}
              onChange={(event) => setGender(event.target.value)}
              style={inputStyle}
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </div>
        </div>

        {student && (
          <div style={{ marginTop: "1rem" }}>
            <label style={labelStyle}>Status</label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              style={inputStyle}
            >
              <option value="Active">Active</option>
              <option value="Transferred">Transferred</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        )}

        <div style={{ marginTop: "1rem" }}>
          <label style={labelStyle}>
            Guardian name <span style={{ color: "var(--dText)" }}>*</span>
          </label>
          <input
            type="text"
            value={guardianName}
            onChange={(event) => setGuardianName(event.target.value)}
            placeholder="e.g. Mary Wanjiru"
            style={inputStyle}
          />
        </div>

        <div style={{ marginTop: "1rem" }}>
          <label style={labelStyle}>
            Guardian phone <span style={{ color: "var(--dText)" }}>*</span>
          </label>
          <input
            type="text"
            value={guardianPhone}
            onChange={(event) => setGuardianPhone(event.target.value)}
            placeholder="+254..."
            style={inputStyle}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
            marginTop: "1.5rem",
          }}
        >
          <button onClick={onClose} style={secondaryButtonStyle}>
            Cancel
          </button>
          <button
            onClick={() => {
              const trimmedName = name.trim();
              const trimmedAdmissionNo = admissionNo.trim();
              const trimmedGuardianName = guardianName.trim();
              const trimmedGuardianPhone = guardianPhone.trim();
              const matchedClass = classes.find(
                (currentClassItem) =>
                  currentClassItem.grade === grade &&
                  (currentClassItem.stream || "") === stream,
              );

              if (
                !trimmedName ||
                !trimmedAdmissionNo ||
                !grade ||
                !trimmedGuardianName ||
                !trimmedGuardianPhone
              ) {
                alert("Fill in the required student details.");
                return;
              }

              if (!matchedClass) {
                alert("Select a valid grade and stream combination.");
                return;
              }

              const nextStudent: Student = student
                ? {
                    ...student,
                    name: trimmedName,
                    admissionNo: trimmedAdmissionNo,
                    classId: matchedClass.id,
                    gender,
                    status,
                    guardianName: trimmedGuardianName,
                    guardianPhone: trimmedGuardianPhone,
                  }
                : {
                    id:
                      "STU" +
                      Math.random().toString(36).slice(2, 7).toUpperCase(),
                    name: trimmedName,
                    admissionNo: trimmedAdmissionNo,
                    classId: matchedClass.id,
                    gender,
                    status: "Active",
                    guardianName: trimmedGuardianName,
                    guardianPhone: trimmedGuardianPhone,
                  };

              onSave(nextStudent);
            }}
            style={primaryButtonStyle}
          >
            {student ? "Save changes" : "Enroll student"}
          </button>
        </div>
      </div>
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
    <p
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: "var(--textF)",
        textTransform: "uppercase",
        letterSpacing: ".05em",
        margin: "0 0 5px",
      }}
    >
      {label}
    </p>
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

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11.5,
  fontWeight: 700,
  color: "var(--textM)",
  letterSpacing: ".03em",
  marginBottom: 5,
};

const modalHeaderStyle: React.CSSProperties = {
  padding: "18px 22px 14px",
  borderBottom: "1px solid var(--border)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const modalTitleStyle: React.CSSProperties = {
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
