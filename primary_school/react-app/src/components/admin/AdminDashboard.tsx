import React, { useMemo, useState } from "react";
import styles from "./AdminDashboard.module.css";
import { AssignmentsTab } from "./AssignmentsTab";
import { ClassesTab } from "./ClassesTab";
import { OverviewTab } from "./OverviewTab";
import { Sidebar } from "./Sidebar";
import { StudentsTab } from "./StudentsTab";
import { SubjectsTab } from "./SubjectsTab";
import { TeachersTab } from "./TeachersTab";
import { TopBar } from "./TopBar";
import { Class, NavItem, Student, Subject, Teacher } from "./types";
import { useDashboardTheme } from "../../lib/useDashboardTheme";

const initialTeachers: Teacher[] = [
  {
    id: "T001",
    name: "Grace Njeri",
    email: "grace.njeri@greenfield.ac.ke",
    phone: "+254 711 203 111",
    status: "Active",
    department: "Languages",
    joinDate: "2024-01-08",
  },
  {
    id: "T002",
    name: "Samuel Otieno",
    email: "samuel.otieno@greenfield.ac.ke",
    phone: "+254 722 884 521",
    status: "Active",
    department: "Mathematics",
    joinDate: "2023-05-14",
  },
  {
    id: "T003",
    name: "Faith Achieng",
    email: "faith.achieng@greenfield.ac.ke",
    phone: "+254 733 415 002",
    status: "Active",
    department: "Sciences",
    joinDate: "2022-09-01",
  },
  {
    id: "T004",
    name: "David Mwangi",
    email: "david.mwangi@greenfield.ac.ke",
    phone: "+254 700 552 118",
    status: "Active",
    department: "Humanities",
    joinDate: "2021-02-11",
  },
];

const initialClasses: Class[] = [
  {
    id: "CL001",
    name: "Grade 7 South",
    grade: "7",
    stream: "South",
    students: 0,
    classTeacherId: "T002",
    subjectAssignments: {
      SUB001: "T002",
      SUB002: "T003",
      SUB003: "T001",
    },
  },
  {
    id: "CL002",
    name: "Grade 8",
    grade: "8",
    students: 0,
    classTeacherId: "T004",
    subjectAssignments: {
      SUB001: "T002",
      SUB004: "T004",
    },
  },
  {
    id: "CL003",
    name: "Grade 9 North",
    grade: "9",
    stream: "North",
    students: 0,
    classTeacherId: "",
    subjectAssignments: {
      SUB002: "T003",
      SUB003: "T001",
    },
  },
];

const initialSubjects: Subject[] = [
  {
    id: "SUB001",
    name: "Mathematics",
    department: "Mathematics",
    assignedTeacherId: "T002",
  },
  {
    id: "SUB002",
    name: "Integrated Science",
    department: "Sciences",
    assignedTeacherId: "T003",
  },
  {
    id: "SUB003",
    name: "English",
    department: "Languages",
    assignedTeacherId: "T001",
  },
  {
    id: "SUB004",
    name: "Social Studies",
    department: "Humanities",
    assignedTeacherId: "T004",
  },
];

const initialStudents: Student[] = [
  {
    id: "STU001",
    admissionNo: "ADM-7001",
    name: "Amina Wanjiru",
    gender: "Female",
    guardianName: "Mary Wanjiru",
    guardianPhone: "+254 711 100 001",
    classId: "CL001",
    status: "Active",
  },
  {
    id: "STU002",
    admissionNo: "ADM-7002",
    name: "Brian Kiptoo",
    gender: "Male",
    guardianName: "Esther Kiptoo",
    guardianPhone: "+254 711 100 002",
    classId: "CL001",
    status: "Active",
  },
  {
    id: "STU003",
    admissionNo: "ADM-8001",
    name: "Mercy Achieng",
    gender: "Female",
    guardianName: "Rose Achieng",
    guardianPhone: "+254 711 100 003",
    classId: "CL002",
    status: "Active",
  },
  {
    id: "STU004",
    admissionNo: "ADM-9001",
    name: "Kevin Mwangi",
    gender: "Male",
    guardianName: "Joseph Mwangi",
    guardianPhone: "+254 711 100 004",
    classId: "CL003",
    status: "Pending",
  },
];

const navItems: NavItem[] = [
  { id: "overview", label: "Overview", svg: "<path d='M3 13h8V3H3v10z'/><path d='M13 21h8V11h-8v10z'/><path d='M13 3h8v6h-8V3z'/><path d='M3 17h8v4H3v-4z'/>" },
  { id: "classes", label: "Classes", svg: "<path d='M4 19.5V8.5a2 2 0 0 1 1.2-1.83l6-2.67a2 2 0 0 1 1.6 0l6 2.67A2 2 0 0 1 20 8.5v11'/><path d='M8 10h8'/><path d='M8 14h8'/><path d='M10 19.5v-3h4v3'/>" },
  { id: "students", label: "Students", svg: "<path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'/><circle cx='9' cy='7' r='4'/><path d='M22 21v-2a4 4 0 0 0-3-3.87'/><path d='M16 3.13a4 4 0 0 1 0 7.75'/>" },
  { id: "subjects", label: "Subjects", svg: "<path d='M4 19.5A2.5 2.5 0 0 1 6.5 17H20'/><path d='M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'/>" },
  { id: "teachers", label: "Teachers", svg: "<path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'/><circle cx='9' cy='7' r='4'/><path d='M23 21v-2a4 4 0 0 0-3-3.87'/><path d='M16 3.13a4 4 0 0 1 0 7.75'/>" },
  { id: "assignments", label: "Assignments", svg: "<path d='M9 11l3 3L22 4'/><path d='M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11'/>" },
];

const syncClassCounts = (classes: Class[], students: Student[]) =>
  classes.map((currentClass) => ({
    ...currentClass,
    students: students.filter((student) => student.classId === currentClass.id)
      .length,
  }));

const teacherInitials = "AU";
const teacherAvatarColor = "#c9963d";

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [classes, setClasses] = useState<Class[]>(
    syncClassCounts(initialClasses, initialStudents),
  );
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);
  const { theme, toggleTheme } = useDashboardTheme();

  const updateClassesWithCounts = (nextClasses: Class[]) => {
    setClasses(syncClassCounts(nextClasses, students));
  };

  const updateStudentsAndCounts = (nextStudents: Student[]) => {
    setStudents(nextStudents);
    setClasses((currentClasses) => syncClassCounts(currentClasses, nextStudents));
  };

  const updateSidebarStats = () => {
    setClasses((currentClasses) => syncClassCounts(currentClasses, students));
  };

  const closeModal = () => setModalContent(null);
  const showModal = (content: React.ReactNode) => setModalContent(content);

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
                closeModal();
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

  const unassignedCount = classes.filter((currentClass) => !currentClass.classTeacherId).length;
  const assignedCT = classes.filter((currentClass) => currentClass.classTeacherId).length;
  const tabTitle = useMemo(() => {
    const titles: Record<string, string> = {
      overview: "School overview",
      classes: "Class management",
      students: "Student management",
      subjects: "Subject management",
      teachers: "Teacher directory",
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

  const sharedProps = {
    closeModal,
    showModal,
    showConfirm,
    onUpdateSidebarStats: updateSidebarStats,
    pill,
    avatar,
  };

  const renderActiveTab = () => {
    if (activeTab === "classes") {
      return (
        <ClassesTab
          classes={classes}
          teachers={teachers}
          subjects={subjects}
          onUpdateClasses={updateClassesWithCounts}
          {...sharedProps}
        />
      );
    }

    if (activeTab === "students") {
      return (
        <StudentsTab
          students={students}
          classes={classes}
          onUpdateStudents={updateStudentsAndCounts}
          {...sharedProps}
        />
      );
    }

    if (activeTab === "subjects") {
      return (
        <SubjectsTab
          subjects={subjects}
          classes={classes}
          teachers={teachers}
          onUpdateSubjects={setSubjects}
          onUpdateClasses={updateClassesWithCounts}
          {...sharedProps}
        />
      );
    }

    if (activeTab === "teachers") {
      return (
        <TeachersTab
          teachers={teachers}
          classes={classes}
          onUpdateTeachers={setTeachers}
          onUpdateSidebarStats={updateSidebarStats}
          avatar={avatar}
          pill={pill}
          showModal={showModal}
          closeModal={closeModal}
        />
      );
    }

    if (activeTab === "assignments") {
      return (
        <AssignmentsTab
          classes={classes}
          teachers={teachers}
          subjects={subjects}
          onUpdateClasses={updateClassesWithCounts}
          avatar={avatar}
          pill={pill}
        />
      );
    }

    return (
      <OverviewTab
        classes={classes}
        subjects={subjects}
        teachers={teachers}
        students={students}
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
        />

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "18px 20px 24px",
            background: "var(--panelBg)",
          }}
        >
          {renderActiveTab()}
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

export default AdminDashboard;
