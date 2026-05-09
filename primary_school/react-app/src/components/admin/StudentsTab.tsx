import React, { useMemo, useState } from "react";
import { Class, ClassSubjectSetting, Student, Subject } from "./types";
import {
  buildElectiveSubjectGroups,
  buildEnrolledSubjectsPayload,
  formatSubjectOfferingTag,
  getClassSubjectSetting,
  getElectiveSubjectIdsForClass,
} from "../../lib/subjectEnrollment";

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

const smallLabelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: "var(--textF)",
  textTransform: "uppercase",
  letterSpacing: ".05em",
  margin: "0 0 5px",
};

const metricValueStyle: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontSize: "1.9rem",
  fontWeight: 600,
  color: "var(--text)",
  margin: 0,
};

const emptyCellStyle: React.CSSProperties = {
  padding: "2.5rem",
  textAlign: "center",
  fontSize: "1.1rem",
  color: "var(--textF)",
};

const StatCard: React.FC<{
  label: string;
  value: number;
  accent?: string;
}> = ({ label, value, accent = "var(--gold)" }) => (
  <div
    style={{
      background: "var(--white)",
      border: "1px solid var(--border)",
      borderRadius: 12,
      padding: "1rem 1.1rem",
      borderTop: `3px solid ${accent}`,
    }}
  >
    <p style={smallLabelStyle}>{label}</p>
    <p style={metricValueStyle}>{value}</p>
  </div>
);

const StudentFormModal: React.FC<{
  student: Student | null;
  currentClass: Class | null;
  gradeOptions: string[];
  streamOptions: string[];
  subjects: Subject[];
  classSubjectSettings: ClassSubjectSetting[];
  onClose: () => void;
  onSave: (payload: {
    name: string;
    admissionNo: string;
    gender: string;
    guardianName: string;
    guardianPhone: string;
    classGrade: string;
    classStream: string;
    status: string;
    enrolledSubjects: Student["enrolledSubjects"];
  }) => Promise<void>;
}> = ({
  student,
  currentClass,
  gradeOptions,
  streamOptions,
  subjects,
  classSubjectSettings,
  onClose,
  onSave,
}) => {
  const [isCompact, setIsCompact] = React.useState(
    () => typeof window !== "undefined" && window.innerWidth <= 640,
  );
  const [name, setName] = useState(student?.name || "");
  const [admissionNo, setAdmissionNo] = useState(student?.admissionNo || "");
  const [grade, setGrade] = useState(currentClass?.grade || "");
  const [stream, setStream] = useState(currentClass?.stream || "");
  const [gender, setGender] = useState(student?.gender || "Female");
  const [status, setStatus] = useState(student?.status || "Active");
  const [guardianName, setGuardianName] = useState(student?.guardianName || "");
  const [guardianPhone, setGuardianPhone] = useState(student?.guardianPhone || "");
  const [selectedElectiveIds, setSelectedElectiveIds] = useState<string[]>(
    (student?.enrolledSubjects || []).filter((item) => item.isActive !== false).map((item) => item.subjectId),
  );
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const electiveSubjectIds = useMemo(
    () => getElectiveSubjectIdsForClass(classSubjectSettings, grade, stream),
    [classSubjectSettings, grade, stream],
  );
  const electiveSubjects = useMemo(
    () =>
      subjects
        .filter((subject) => electiveSubjectIds.includes(subject.id))
        .map((subject) => {
          const setting = getClassSubjectSetting(classSubjectSettings, subject.id, grade, stream);
          return {
            ...subject,
            isOffered: setting.isOffered,
            enrollmentMode: setting.enrollmentMode,
            sharedSlotId: setting.sharedSlotId,
          };
        }),
    [classSubjectSettings, electiveSubjectIds, grade, stream, subjects],
  );
  const electiveGroups = useMemo(
    () => buildElectiveSubjectGroups(electiveSubjects),
    [electiveSubjects],
  );
  const linkedElectiveGroups = useMemo(
    () => electiveGroups.filter((group) => group.isLinkedGroup),
    [electiveGroups],
  );
  const standaloneElectives = useMemo(
    () => electiveGroups.filter((group) => !group.isLinkedGroup).flatMap((group) => group.subjects),
    [electiveGroups],
  );
  const compulsorySubjects = useMemo(
    () =>
      subjects.filter((subject) => {
        const setting = getClassSubjectSetting(classSubjectSettings, subject.id, grade, stream);
        return setting.isOffered !== false && (setting.enrollmentMode || "compulsory") === "compulsory";
      }),
    [classSubjectSettings, grade, stream, subjects],
  );

  React.useEffect(() => {
    const handleResize = () => setIsCompact(window.innerWidth <= 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(() => {
    setSelectedElectiveIds((current) =>
      current.filter((subjectId) => electiveSubjectIds.includes(subjectId)),
    );
  }, [electiveSubjectIds]);

  React.useEffect(() => {
    const validSubjectIds = new Set(electiveSubjects.map((subject) => subject.id));

    setSelectedElectiveIds((current) => {
      let next = current.filter((subjectId) => validSubjectIds.has(subjectId));

      linkedElectiveGroups.forEach((group) => {
        const groupSubjectIds = new Set(group.subjects.map((subject) => subject.id));
        const selectedWithinGroup = next.filter((subjectId) => groupSubjectIds.has(subjectId));

        if (selectedWithinGroup.length > 1) {
          const [keepSubjectId] = selectedWithinGroup;
          next = next.filter(
            (subjectId) => !groupSubjectIds.has(subjectId) || subjectId === keepSubjectId,
          );
        }
      });

      return next;
    });
  }, [electiveSubjects, linkedElectiveGroups]);

  return (
    <div>
      <div style={modalHeaderStyle}>
        <h3 style={modalTitleStyle}>{student ? "Update student" : "Add student"}</h3>
        <button onClick={onClose} style={closeButtonStyle}>
          x
        </button>
      </div>

      <div style={{ padding: isCompact ? "14px 14px 18px" : "18px 22px 22px" }}>
        {errorMsg && (
          <div style={{ padding: "10px", marginBottom: "15px", background: "#fdeaea", color: "#a32d2d", borderRadius: "8px", fontSize: "13px", fontWeight: 600 }}>
            {errorMsg}
          </div>
        )}
        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Student name</label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Amina Wanjiru"
            style={inputStyle}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isCompact ? "1fr" : "1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelStyle}>Admission no.</label>
            <input
              type="text"
              value={admissionNo}
              onChange={(event) => setAdmissionNo(event.target.value)}
              placeholder="e.g. ADM-1042"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Gender</label>
            <select value={gender} onChange={(event) => setGender(event.target.value)} style={inputStyle}>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isCompact ? "1fr" : "1fr 1fr", gap: 12, marginTop: "1rem" }}>
          <div>
            <label style={labelStyle}>Grade</label>
            <input
              list="student-grade-options"
              value={grade}
              onChange={(event) => setGrade(event.target.value)}
              placeholder="e.g. 7"
              style={inputStyle}
            />
            <datalist id="student-grade-options">
              {gradeOptions.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </div>
          <div>
            <label style={labelStyle}>Stream</label>
            <input
              list="student-stream-options"
              value={stream}
              onChange={(event) => setStream(event.target.value)}
              placeholder="e.g. North"
              style={inputStyle}
            />
            <datalist id="student-stream-options">
              {streamOptions.filter(Boolean).map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </div>
        </div>

        {student && (
          <div style={{ marginTop: "1rem" }}>
            <label style={labelStyle}>Status</label>
            <select value={status} onChange={(event) => setStatus(event.target.value)} style={inputStyle}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        )}

        <div style={{ marginTop: "1rem" }}>
          <label style={labelStyle}>Guardian name</label>
          <input
            type="text"
            value={guardianName}
            onChange={(event) => setGuardianName(event.target.value)}
            placeholder="e.g. Mary Wanjiru"
            style={inputStyle}
          />
        </div>

        <div style={{ marginTop: "1rem" }}>
          <label style={labelStyle}>Guardian phone</label>
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
            marginTop: "1rem",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "12px 14px",
            background: "var(--sand)",
            display: "grid",
            gap: 10,
          }}
        >
          <div>
            <p style={{ ...labelStyle, marginBottom: 4 }}>Subject enrollment</p>
            <p style={{ margin: 0, fontSize: 12, color: "var(--textMut)", lineHeight: 1.5 }}>
              Compulsory subjects apply to the whole class automatically. Elective subjects must be selected per student.
            </p>
          </div>

          <div>
            <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color: "var(--text)" }}>
              Compulsory subjects ({compulsorySubjects.length})
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "var(--textMut)", lineHeight: 1.5 }}>
              {compulsorySubjects.length > 0
                ? compulsorySubjects.map((subject) => subject.name).join(", ")
                : "No compulsory subjects are active for this class yet."}
            </p>
          </div>

          <div>
            <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: "var(--text)" }}>
              Electives ({electiveSubjects.length})
            </p>
            {electiveSubjects.length === 0 ? (
              <p style={{ margin: 0, fontSize: 12, color: "var(--textMut)" }}>
                No elective subjects are configured for Grade {grade || "-"} {stream || ""}.
              </p>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {linkedElectiveGroups.map((group) => {
                  const selectedSubjectId =
                    group.subjects.find((subject) => selectedElectiveIds.includes(subject.id))?.id || "";

                  return (
                    <div
                      key={group.key}
                      style={{
                        border: "1px solid var(--border)",
                        borderRadius: 10,
                        background: "var(--white)",
                        padding: "10px 12px",
                        display: "grid",
                        gap: 8,
                      }}
                    >
                      <div>
                        <p style={{ margin: "0 0 3px", fontSize: 12.5, fontWeight: 700, color: "var(--text)" }}>
                          {group.label}
                        </p>
                        <p style={{ margin: 0, fontSize: 11, color: "var(--textMut)" }}>
                          Linked elective pair{group.sharedSlotId ? ` | Block ${group.sharedSlotId}` : ""}
                        </p>
                      </div>

                      <div style={{ display: "grid", gap: 8 }}>
                        {group.subjects.map((subject) => (
                          <label
                            key={subject.id}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 10,
                              padding: "8px 10px",
                              borderRadius: 8,
                              border: "1px solid var(--border)",
                              background:
                                selectedSubjectId === subject.id ? "rgba(201,150,61,0.10)" : "var(--sand)",
                              cursor: "pointer",
                            }}
                          >
                            <input
                              type="radio"
                              name={`elective-group-${group.key}`}
                              checked={selectedSubjectId === subject.id}
                              onChange={() =>
                                setSelectedElectiveIds((current) => {
                                  const groupSubjectIds = new Set(
                                    group.subjects.map((groupSubject) => groupSubject.id),
                                  );
                                  const withoutGroup = current.filter(
                                    (value) => !groupSubjectIds.has(value),
                                  );
                                  return [...withoutGroup, subject.id];
                                })
                              }
                            />
                            <span style={{ display: "grid", gap: 2 }}>
                              <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text)" }}>
                                {subject.name}
                              </span>
                              <span style={{ fontSize: 11, color: "var(--textMut)" }}>
                                {formatSubjectOfferingTag(subject.enrollmentMode, subject.sharedSlotId)}
                              </span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {standaloneElectives.map((subject) => {
                  const checked = selectedElectiveIds.includes(subject.id);

                  return (
                    <label
                      key={subject.id}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                        background: "var(--white)",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) =>
                          setSelectedElectiveIds((current) =>
                            event.target.checked
                              ? [...current, subject.id]
                              : current.filter((value) => value !== subject.id),
                          )
                        }
                      />
                      <span style={{ display: "grid", gap: 2 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text)" }}>
                          {subject.name}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--textMut)" }}>
                          {formatSubjectOfferingTag(subject.enrollmentMode, subject.sharedSlotId)}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
            marginTop: "1.5rem",
            flexDirection: isCompact ? "column-reverse" : "row",
          }}
        >
          <button onClick={onClose} style={secondaryButtonStyle}>
            Cancel
          </button>
          <button
            onClick={async () => {
              if (
                !name.trim() ||
                !admissionNo.trim() ||
                !grade.trim() ||
                !guardianName.trim() ||
                !guardianPhone.trim()
              ) {
                setErrorMsg("Fill in the required student details.");
                return;
              }
              setErrorMsg("");

              setSaving(true);
              try {
                await onSave({
                  name: name.trim(),
                  admissionNo: admissionNo.trim(),
                  gender,
                  guardianName: guardianName.trim(),
                  guardianPhone: guardianPhone.trim(),
                  classGrade: grade.trim(),
                  classStream: stream.trim(),
                  status,
                  enrolledSubjects: buildEnrolledSubjectsPayload(selectedElectiveIds, grade.trim(), stream.trim()),
                });
              } finally {
                setSaving(false);
              }
            }}
            style={primaryButtonStyle}
            disabled={saving}
          >
            {saving ? "Saving..." : student ? "Save changes" : "Enroll student"}
          </button>
        </div>
      </div>
    </div>
  );
};

interface StudentsTabProps {
  students: Student[];
  classes: Class[];
  subjects: Subject[];
  classSubjectSettings: ClassSubjectSetting[];
  onSaveStudent: (
    payload: {
      name: string;
      admissionNo: string;
      gender: string;
      guardianName: string;
      guardianPhone: string;
      classGrade: string;
      classStream: string;
      status: string;
      enrolledSubjects: Student["enrolledSubjects"];
    },
    studentId?: string,
  ) => Promise<void>;
  onDeleteStudent: (studentId: string) => Promise<void>;
  pill: (text: string, color: string) => string;
  showModal: (content: React.ReactNode) => void;
  closeModal: () => void;
  showConfirm: (msg: string, onOk: () => void, danger?: boolean) => void;
}

export const StudentsTab: React.FC<StudentsTabProps> = ({
  students,
  classes,
  subjects,
  classSubjectSettings,
  onSaveStudent,
  onDeleteStudent,
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
  const subjectLookup = useMemo(
    () =>
      subjects.reduce<Record<string, Subject>>((acc, subject) => {
        acc[subject.id] = subject;
        return acc;
      }, {}),
    [subjects],
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
    const currentClass = student ? classLookup[student.classId] : null;

    showModal(
      <StudentFormModal
        student={student}
        currentClass={currentClass}
        gradeOptions={Array.from(new Set(classes.map((current) => current.grade)))}
        streamOptions={Array.from(new Set(classes.map((current) => current.stream || "")))}
        subjects={subjects}
        classSubjectSettings={classSubjectSettings}
        onClose={closeModal}
        onSave={async (payload) => {
          await onSaveStudent(payload, student?.id);
        }}
      />,
    );
  };

  const confirmDeleteStudent = (studentId: string, name: string) => {
    showConfirm(
      `Delete <strong>${name}</strong> from the enrolled students list?`,
      () => {
        void onDeleteStudent(studentId);
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
          <p style={eyebrowStyle}>Students</p>
          <h2 style={pageTitleStyle}>Student management</h2>
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
          background: "var(--white)",
          border: "1px solid var(--border)",
          borderRadius: 13,
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <table style={{ width: "100%", minWidth: 860, borderCollapse: "collapse" }}>
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
                    ...tableHeadingStyle,
                    ...(heading === "Student"
                      ? { position: "sticky", left: 0, zIndex: 2, background: "var(--sand)", minWidth: 210 }
                      : heading === "Admission no."
                        ? { position: "sticky", left: 210, zIndex: 2, background: "var(--sand)", minWidth: 130 }
                        : {}),
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
              const classElectives = (student.enrolledSubjects || [])
                .filter(
                  (entry) =>
                    entry.isActive !== false &&
                    entry.classGrade === student.classGrade &&
                    (entry.classStream || "") === (student.classStream || ""),
                )
                .map((entry) => subjectLookup[entry.subjectId]?.name || "Unknown subject");

              return (
                <tr key={student.id} style={{ borderTop: "1px solid var(--borderL)" }}>
                  <td style={{ padding: "10px 13px", position: "sticky", left: 0, zIndex: 1, background: "var(--white)", minWidth: 210, boxShadow: "1px 0 0 var(--borderL)" }}>
                    <p style={rowPrimaryTextStyle}>{student.name}</p>
                    <p style={rowMetaTextStyle}>{student.gender}</p>
                  </td>
                  <td style={{ ...bodyTextStyle, position: "sticky", left: 210, zIndex: 1, background: "var(--white)", minWidth: 130, boxShadow: "1px 0 0 var(--borderL)" }}>{student.admissionNo}</td>
                  <td style={{ padding: "10px 13px" }}>
                    <p style={{ ...rowPrimaryTextStyle, fontWeight: 600 }}>
                      {currentClass?.name || "Not assigned"}
                    </p>
                    <p style={rowMetaTextStyle}>
                      Grade {currentClass?.grade || "-"}
                      {currentClass?.stream ? ` - Stream ${currentClass.stream}` : ""}
                    </p>
                    <p style={rowMetaTextStyle}>
                      {classElectives.length > 0
                        ? `Electives: ${classElectives.join(", ")}`
                        : "Electives: Compulsory only"}
                    </p>
                  </td>
                  <td style={{ padding: "10px 13px" }}>
                    <p style={{ ...rowPrimaryTextStyle, fontWeight: 600 }}>
                      {student.guardianName}
                    </p>
                    <p style={rowMetaTextStyle}>{student.guardianPhone}</p>
                  </td>
                  <td style={{ padding: "10px 13px" }}>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: pill(
                          student.status || "Active",
                          student.status === "Active"
                            ? "green"
                            : student.status === "Completed"
                              ? "gold"
                              : "gray",
                        ),
                      }}
                    />
                  </td>
                  <td style={{ padding: "10px 13px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => openStudentModal(student.id)} style={iconButtonStyle}>
                        Edit
                      </button>
                      <button
                        onClick={() => confirmDeleteStudent(student.id, student.name)}
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
                <td colSpan={6} style={emptyCellStyle}>
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
