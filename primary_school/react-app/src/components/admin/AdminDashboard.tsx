import React, { useEffect, useMemo, useState } from "react";
import styles from "./AdminDashboard.module.css";
import { AssignmentsTab } from "./AssignmentsTab";
import { ClassesTab } from "./ClassesTab";
import { OverviewTab } from "./OverviewTab";
import { Sidebar } from "./Sidebar";
import { StudentsTab } from "./StudentsTab";
import { SubjectsTab } from "./SubjectsTab";
import { TeachersTab } from "./TeachersTab";
import { TopBar } from "./TopBar";
import { CycleTab } from "./CycleTab";
import {
  ApiStudent,
  ApiTeacher,
  Teacher,
  UsersDashboardResponse,
  ApiAssignment,
  NavItem,
  Class,
  Subject,
  Student,
} from "./types";
import { useDashboardTheme } from "../../lib/useDashboardTheme";
import { api } from "../../lib/api";

const navItems: NavItem[] = [
  { id: "overview", label: "Overview", svg: "<path d='M3 13h8V3H3v10z'/><path d='M13 21h8V11h-8v10z'/><path d='M13 3h8v6h-8V3z'/><path d='M3 17h8v4H3v-4z'/>" },
  { id: "classes", label: "Classes", svg: "<path d='M4 19.5V8.5a2 2 0 0 1 1.2-1.83l6-2.67a2 2 0 0 1 1.6 0l6 2.67A2 2 0 0 1 20 8.5v11'/><path d='M8 10h8'/><path d='M8 14h8'/><path d='M10 19.5v-3h4v3'/>" },
  { id: "students", label: "Students", svg: "<path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'/><circle cx='9' cy='7' r='4'/><path d='M22 21v-2a4 4 0 0 0-3-3.87'/><path d='M16 3.13a4 4 0 0 1 0 7.75'/>" },
  { id: "subjects", label: "Subjects", svg: "<path d='M4 19.5A2.5 2.5 0 0 1 6.5 17H20'/><path d='M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'/>" },
  { id: "teachers", label: "Staff", svg: "<path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'/><circle cx='9' cy='7' r='4'/><path d='M23 21v-2a4 4 0 0 0-3-3.87'/><path d='M16 3.13a4 4 0 0 1 0 7.75'/>" },
  { id: "assignments", label: "Assignments", svg: "<path d='M9 11l3 3L22 4'/><path d='M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11'/>" },
  { id: "cycle", label: "Academic Cycle", svg: "<circle cx='12' cy='12' r='10'/><path d='M12 6v6l4 2'/>" },
];

const teacherInitials = "AU";
const teacherAvatarColor = "#c9963d";

const buildClassId = (grade: string, stream?: string) =>
  `${grade.trim()}::${(stream || "").trim()}`;

const normalizeStatus = (value?: string) =>
  value?.toLowerCase() === "inactive" ? "Inactive" : "Active";

const mapStaffToTeachers = (staff: ApiTeacher[]): Teacher[] =>
  staff.map((member) => ({
    ...member,
    status: normalizeStatus(member.status),
    subjects: member.subjects || [],
  }));

const mapStudentsFromApi = (students: ApiStudent[]): Student[] =>
  students.map((student) => ({
    id: student.id,
    admissionNo: student.admissionNo,
    name: student.name,
    gender: student.gender,
    guardianName: student.guardianName,
    guardianPhone: student.guardianPhone,
    classId: buildClassId(student.classGrade, student.classStream),
    status: normalizeStatus(student.status),
  }));

const deriveClasses = (
  students: Student[],
  teachers: Teacher[],
  subjects: Subject[],
  assignments: ApiAssignment[],
): Class[] => {
  const classMap = new Map<string, Class>();

  const getAssignmentsForClass = (grade: string, stream: string) => {
    const res: Record<string, string> = {};
    assignments.forEach((a) => {
      if (a.classGrade === grade && a.classStream === stream) {
        res[a.subjectId] = a.teacherId;
      }
    });
    return res;
  };

  students.forEach((student) => {
    const [grade, stream = ""] = student.classId.split("::");
    const classTeacher = teachers.find(
      (teacher) =>
        (teacher.classGrade || "").trim() === grade &&
        (teacher.classStream || "").trim() === stream,
    );

    classMap.set(student.classId, {
      id: student.classId,
      name: `Grade ${grade}${stream ? ` ${stream}` : ""}`,
      grade,
      stream,
      students: students.filter((current) => current.classId === student.classId).length,
      classTeacherId: classTeacher?.id || "",
      subjectAssignments: getAssignmentsForClass(grade, stream),
      term: classTeacher?.term,
      year: classTeacher?.year,
    });
  });

  teachers
    .filter((teacher) => teacher.classGrade)
    .forEach((teacher) => {
      const grade = teacher.classGrade || "";
      const stream = teacher.classStream || "";
      const classId = buildClassId(grade, stream);

      if (classMap.has(classId)) {
        return;
      }

      classMap.set(classId, {
        id: classId,
        name: `Grade ${grade}${stream ? ` ${stream}` : ""}`,
        grade,
        stream,
        students: 0,
        classTeacherId: teacher.id,
        subjectAssignments: getAssignmentsForClass(grade, stream),
        term: teacher.term,
        year: teacher.year,
      });
    });

  return Array.from(classMap.values()).sort((first, second) =>
    first.name.localeCompare(second.name),
  );
};

const emptyStateStyle: React.CSSProperties = {
  minHeight: 220,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  textAlign: "center",
  color: "var(--textMut)",
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

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<ApiAssignment[]>([]);
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { theme, toggleTheme } = useDashboardTheme();

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const classes = useMemo(
    () => deriveClasses(students, teachers, subjects, assignments),
    [students, teachers, subjects, assignments],
  );

  const loadDashboardUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get<UsersDashboardResponse>("/users");
      setTeachers(mapStaffToTeachers(response.staff));
      setStudents(mapStudentsFromApi(response.students));
      setSubjects(response.subjects || []);
      setAssignments(response.assignments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboardUsers();
  }, []);

  const closeModal = () => setModalContent(null);
  const showModal = (content: React.ReactNode) => setModalContent(content);

  const saveStudent = async (
    payload: {
      name: string;
      admissionNo: string;
      gender: string;
      guardianName: string;
      guardianPhone: string;
      classGrade: string;
      classStream: string;
      status: string;
    },
    studentId?: string,
  ) => {
    const body = {
      role: "student",
      ...payload,
      status: payload.status.toLowerCase(),
    };

    try {
      if (studentId) {
        await api.put(`/users/${studentId}`, body);
      } else {
        await api.post("/users", body);
      }

      await loadDashboardUsers();
      showSuccess(`Student ${studentId ? "updated" : "enrolled"} successfully.`);
      closeModal();
    } catch (err) {
      showError("Failed to save student.");
    }
  };

  const deleteStudent = async (studentId: string) => {
    try {
      await api.delete(`/users/${studentId}`);
      await loadDashboardUsers();
      showSuccess("Student record deleted.");
    } catch (err) {
      showError("Failed to delete student.");
    }
  };

  const saveTeacher = async (
    payload: {
      roles: string[];
      name: string;
      email: string;
      phone: string;
      department: string;
      status: string;
      classGrade?: string;
      classStream?: string;
      subjects?: string[];
    },
    teacherId?: string,
  ) => {
    const body = {
      ...payload,
      status: payload.status.toLowerCase(),
    };

    try {
      if (teacherId) {
        await api.put(`/users/${teacherId}`, body);
      } else {
        await api.post("/users", body);
      }

      await loadDashboardUsers();
      showSuccess(`Staff member ${teacherId ? "updated" : "added"} successfully.`);
      closeModal();
    } catch (err) {
      showError("Failed to save staff member.");
    }
  };

  const deleteTeacher = async (teacherId: string) => {
    try {
      await api.delete(`/users/${teacherId}`);
      await loadDashboardUsers();
      showSuccess("Staff record deleted.");
    } catch (err) {
      showError("Failed to delete staff member.");
    }
  };

  const showConfirm = (
    message: string,
    onOk: () => void,
    danger = false,
  ) => {
    showModal(
      <div className={styles.scalein}>
        <div
          style={{
            padding: "20px 22px 16px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontFamily: "var(--serif)",
              fontSize: "1.25rem",
              color: "var(--text)",
            }}
          >
            Confirm action
          </h3>
        </div>
        <div style={{ padding: "18px 22px 22px" }}>
          <p
            style={{
              margin: "0 0 16px",
              fontSize: 13,
              color: "var(--textMut)",
              lineHeight: 1.6,
            }}
            dangerouslySetInnerHTML={{ __html: message }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button onClick={closeModal} style={secondaryButtonStyle}>
              Cancel
            </button>
            <button
              onClick={() => {
                onOk();
                // Note: we don't close modal here because onOk might show a success modal
              }}
              style={{
                ...primaryButtonStyle,
                background: danger ? "var(--dText)" : "var(--gold)",
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>,
    );
  };

  const saveSubject = async (name: string, department: string, subjectId?: string) => {
    try {
      if (subjectId) {
        await api.put(`/school/subjects/${subjectId}`, { name, department });
      } else {
        await api.post("/school/subjects", { name, department });
      }
      await loadDashboardUsers();
      showSuccess(`Subject ${subjectId ? "updated" : "created"} successfully.`);
      closeModal();
    } catch (err) {
      showError("Failed to save subject.");
    }
  };

  const deleteSubject = async (subjectId: string) => {
    try {
      await api.delete(`/school/subjects/${subjectId}`);
      await loadDashboardUsers();
      showSuccess("Subject deleted successfully.");
    } catch (err) {
      showError("Failed to delete subject.");
    }
  };

  const saveAssignment = async (payload: {
    subjectId: string;
    teacherId: string;
    classGrade: string;
    classStream: string;
  }) => {
    try {
      await api.post("/school/assignments", payload);
      await loadDashboardUsers();
      showSuccess("Assignment updated successfully.");
      closeModal();
    } catch (err) {
      showError("Failed to update assignment.");
    }
  };

  const unassignSubjectTeacher = async (classGrade: string, classStream: string, subjectId: string) => {
    const assignment = assignments.find(
      (a) => a.classGrade === classGrade && a.classStream === classStream && a.subjectId === subjectId
    );
    if (assignment) {
      try {
        await api.delete(`/school/assignments/${assignment.id}`);
        await loadDashboardUsers();
        showSuccess("Teacher unassigned successfully.");
      } catch (err) {
        showError("Failed to unassign teacher.");
      }
    }
  };

  const unassignClassTeacher = async (teacherId: string) => {
    try {
      const teacher = teachers.find(t => t.id === teacherId);
      if (teacher) {
        await api.put(`/users/${teacherId}`, {
          ...teacher,
          classGrade: null,
          classStream: null,
          role: "subjectteacher", // Default back to subject teacher
        });
        await loadDashboardUsers();
        showSuccess("Class teacher unassigned successfully.");
      }
    } catch (err) {
      showError("Failed to unassign class teacher.");
    }
  };
  
  const handleBulkTermUpdate = async (term: number, year: number) => {
    try {
      await api.put("/users/bulk-update-term", { term, year });
      await loadDashboardUsers();
      showSuccess(`All classes have been updated to Term ${term}, ${year}.`);
    } catch (err) {
      showError("Failed to update all classes.");
    }
  };

  const showSuccess = (msg: string) => {
    showModal(
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
        <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", marginBottom: "0.5rem" }}>Success!</h3>
        <p style={{ color: "var(--textMut)", marginBottom: "1.5rem" }}>{msg}</p>
        <button onClick={closeModal} style={primaryButtonStyle}>Dismiss</button>
      </div>
    );
  };

  const showError = (msg: string) => {
    showModal(
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>❌</div>
        <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", marginBottom: "0.5rem" }}>Error</h3>
        <p style={{ color: "var(--textMut)", marginBottom: "1.5rem" }}>{msg}</p>
        <button onClick={closeModal} style={{ ...primaryButtonStyle, background: "var(--dText)" }}>Dismiss</button>
      </div>
    );
  };

  const unassignedCount = classes.filter((currentClass) => !currentClass.classTeacherId).length;
  const assignedCT = classes.filter((currentClass) => currentClass.classTeacherId).length;
  const tabTitle = useMemo(() => {
    const titles: Record<string, string> = {
      overview: "School overview",
      classes: "Class management",
      students: "Student management",
      subjects: "Subject management",
      teachers: "Staff directory",
      assignments: "Subject assignments",
    };
    return titles[activeTab] || "Admin dashboard";
  }, [activeTab]);

  const pill = (text: string, color: string) => {
    const palette: Record<string, { bg: string; text: string }> = {
      green: { bg: "var(--sBg)", text: "var(--sText)" },
      amber: { bg: "var(--wBg)", text: "var(--wText)" },
      red: { bg: "var(--dBg)", text: "var(--dText)" },
      blue: { bg: "var(--iBg)", text: "var(--iText)" },
      gray: { bg: "var(--sand)", text: "var(--textMut)" },
    };
    const colors = palette[color] || palette.gray;
    return `<span style="display:inline-block;padding:3px 9px;border-radius:999px;font-size:10px;font-weight:700;background:${colors.bg};color:${colors.text};">${text}</span>`;
  };

  const avatar = (name: string, size: number) => {
    const initials = name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:#163325;color:#fff;display:flex;align-items:center;justify-content:center;font-size:${Math.max(
      10,
      size / 2.4,
    )}px;font-weight:700;">${initials}</div>`;
  };

  const renderActiveTab = () => {
    if (activeTab === "classes") {
      return (
        <ClassesTab
          classes={classes}
          teachers={teachers}
          subjects={subjects}
          onSaveClassTeacher={saveTeacher}
          onUnassignClassTeacher={unassignClassTeacher}
          onBulkTermUpdate={handleBulkTermUpdate}
          onSwitchTab={setActiveTab}
          pill={pill}
          avatar={avatar}
          showModal={showModal}
          closeModal={closeModal}
          showConfirm={showConfirm}
        />
      );
    }

    if (activeTab === "students") {
      return (
        <StudentsTab
          students={students}
          classes={classes}
          onSaveStudent={saveStudent}
          onDeleteStudent={deleteStudent}
          pill={pill}
          showModal={showModal}
          closeModal={closeModal}
          showConfirm={showConfirm}
        />
      );
    }

    if (activeTab === "subjects") {
      return (
        <SubjectsTab
          subjects={subjects}
          classes={classes}
          onSaveSubject={saveSubject}
          onDeleteSubject={deleteSubject}
          pill={pill}
          showModal={showModal}
          closeModal={closeModal}
          showConfirm={showConfirm}
        />
      );
    }

    if (activeTab === "teachers") {
      return (
        <TeachersTab
          teachers={teachers}
          classes={classes}
          onSaveTeacher={saveTeacher}
          onDeleteTeacher={deleteTeacher}
          avatar={avatar}
          pill={pill}
          showModal={showModal}
          closeModal={closeModal}
          showConfirm={showConfirm}
        />
      );
    }

    if (activeTab === "assignments") {
      return (
        <AssignmentsTab
          classes={classes}
          teachers={teachers}
          subjects={subjects}
          onSaveAssignment={saveAssignment}
          onUnassignTeacher={unassignSubjectTeacher}
          avatar={avatar}
          pill={pill}
          showModal={showModal}
          closeModal={closeModal}
          showConfirm={showConfirm}
        />
      );
    }

    if (activeTab === "cycle") {
      return <CycleTab onBulkTermUpdate={handleBulkTermUpdate} />;
    }

    return (
      <OverviewTab
        classes={classes}
        subjects={subjects}
        teachers={teachers}
        students={students}
        assignments={assignments}
        onSwitchTab={setActiveTab}
        pill={pill}
        avatar={avatar}
      />
    );
  };

  return (
    <div className={styles.dashboard} data-theme={theme}>
      <Sidebar
        collapsed={collapsed}
        activeTab={activeTab}
        navItems={navItems}
        classesCount={classes.length}
        subjectsCount={subjects.length}
        teachersCount={teachers.length}
        assignedCT={assignedCT}
        totalClasses={classes.length}
        unassignedCount={unassignedCount}
        onToggleCollapse={() => setCollapsed((current) => !current)}
        onSelectTab={setActiveTab}
        onLogout={handleLogout}
        teacherInitials={teacherInitials}
        teacherAvatarColor={teacherAvatarColor}
      />

      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <TopBar
          title={tabTitle}
          unassignedCount={unassignedCount}
          onSwitchTab={setActiveTab}
          teacherInitials={teacherInitials}
          teacherAvatarColor={teacherAvatarColor}
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogout={handleLogout}
        />

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "18px 20px 24px",
            background: "var(--panelBg)",
          }}
        >
          {loading ? (
            <div style={emptyStateStyle}>Loading live dashboard data...</div>
          ) : error ? (
            <div style={emptyStateStyle}>
              <p style={{ margin: 0 }}>{error}</p>
              <button onClick={() => void loadDashboardUsers()} style={primaryButtonStyle}>
                Retry
              </button>
            </div>
          ) : (
            renderActiveTab()
          )}
        </div>
      </main>

      {modalContent && (
        <div className={styles.modalBg} onClick={closeModal}>
          <div
            className={`${styles.modalBox} ${styles.scalein}`}
            onClick={(event) => event.stopPropagation()}
          >
            {modalContent}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
