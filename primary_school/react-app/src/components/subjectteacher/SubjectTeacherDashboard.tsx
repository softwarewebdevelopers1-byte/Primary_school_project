// components/subjectteacher/SubjectTeacherDashboard.tsx

import React, { useState } from "react";
import styles from "./SubjectTeacherDashboard.module.css";
import MySubjects from "./MySubjects";
import MarksEntry from "./MarksEntry";
import MyAssessments from "./MyAssessments";
import StudentProgress from "./StudentProgress";
import MyResources from "./MyResources";
import { Teacher, Subject, Student, Assessment } from "./types";

// Dummy Data
const dummyTeacher: Teacher = {
  id: "TCH001",
  name: "Mr. Peter Otieno",
  email: "peter.otieno@school.com",
  phone: "+254712345678",
  subject: "Mathematics",
  department: "Science",
  avatar:
    "https://ui-avatars.com/api/?name=Peter+Otieno&background=4F46E5&color=fff",
  joinDate: "2022-01-10",
};

const dummySubjects: Subject[] = [
  {
    id: "SUB001",
    name: "Mathematics",
    code: "MATH101",
    class: "Grade 7",
    stream: "7A",
    students: 35,
    sessionsPerWeek: 5,
    teacherId: "TCH001",
  },
  {
    id: "SUB002",
    name: "Mathematics",
    code: "MATH101",
    class: "Grade 7",
    stream: "7B",
    students: 32,
    sessionsPerWeek: 5,
    teacherId: "TCH001",
  },
  {
    id: "SUB003",
    name: "Mathematics",
    code: "MATH101",
    class: "Grade 8",
    stream: "8A",
    students: 38,
    sessionsPerWeek: 4,
    teacherId: "TCH001",
  },
];

const dummyStudents: Student[] = [
  {
    id: "STU001",
    admissionNumber: "2024/001",
    name: "Emma Mwangi",
    className: "Grade 7",
    stream: "7A",
    gender: "Female",
    avatar:
      "https://ui-avatars.com/api/?name=Emma+Wanjiku&background=4F46E5&color=fff",
  },
  {
    id: "STU002",
    admissionNumber: "2024/002",
    name: "James Otieno",
    className: "Grade 7",
    stream: "7A",
    gender: "Male",
    avatar:
      "https://ui-avatars.com/api/?name=James+Otieno&background=10B981&color=fff",
  },
  {
    id: "STU003",
    admissionNumber: "2024/003",
    name: "Aisha Hassan",
    className: "Grade 7",
    stream: "7A",
    gender: "Female",
    avatar:
      "https://ui-avatars.com/api/?name=Aisha+Hassan&background=F59E0B&color=fff",
  },
  {
    id: "STU004",
    admissionNumber: "2024/004",
    name: "Brian Kipchoge",
    className: "Grade 7",
    stream: "7B",
    gender: "Male",
    avatar:
      "https://ui-avatars.com/api/?name=Brian+Kipchoge&background=EF4444&color=fff",
  },
  {
    id: "STU005",
    admissionNumber: "2024/005",
    name: "Cynthia Achieng",
    className: "Grade 7",
    stream: "7B",
    gender: "Female",
    avatar:
      "https://ui-avatars.com/api/?name=Cynthia+Achieng&background=8B5CF6&color=fff",
  },
  {
    id: "STU006",
    admissionNumber: "2024/006",
    name: "Daniel Mwangi",
    className: "Grade 8",
    stream: "8A",
    gender: "Male",
    avatar:
      "https://ui-avatars.com/api/?name=Daniel+Kimani&background=EC4899&color=fff",
  },
];

type Tab = "subjects" | "marks" | "assessments" | "progress" | "resources";

const SubjectTeacherDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("subjects");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [teacher] = useState<Teacher>(dummyTeacher);
  const [subjects] = useState<Subject[]>(dummySubjects);
  const [students] = useState<Student[]>(dummyStudents);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [assessments] = useState<Assessment[]>([]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleSelectSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setActiveTab("marks");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "subjects":
        return (
          <MySubjects
            subjects={subjects}
            teacher={teacher}
            onSelectSubject={handleSelectSubject}
          />
        );
      case "marks":
        return (
          <MarksEntry
            selectedSubject={selectedSubject}
            students={students}
            onBack={() => setActiveTab("subjects")}
          />
        );
      case "assessments":
        return <MyAssessments subjects={subjects} assessments={assessments} />;
      case "progress":
        return <StudentProgress subjects={subjects} students={students} />;
      case "resources":
        return <MyResources subjects={subjects} />;
      default:
        return null;
    }
  };

  const menuItems = [
    {
      id: "subjects" as Tab,
      label: "My Subjects",
      icon: "📚",
      description: "View assigned subjects",
    },
    {
      id: "marks",
      label: "Marks Entry",
      icon: "✏️",
      description: "Enter student marks",
    },
    {
      id: "assessments",
      label: "Assessments",
      icon: "📝",
      description: "Create and manage assessments",
    },
    {
      id: "progress",
      label: "Student Progress",
      icon: "📈",
      description: "Track performance",
    },
    {
      id: "resources",
      label: "Resources",
      icon: "📁",
      description: "Upload learning materials",
    },
  ];

  return (
    <div className={styles.dashboard}>
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ""} ${mobileMenuOpen ? styles.mobileOpen : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            {!sidebarCollapsed ? (
              <>
                <span className={styles.logoIcon}>📖</span>
                <span className={styles.logoText}>Teacher Portal</span>
              </>
            ) : (
              <span className={styles.logoIcon}>📖</span>
            )}
          </div>
          <button className={styles.collapseBtn} onClick={toggleSidebar}>
            {sidebarCollapsed ? "→" : "←"}
          </button>
        </div>

        <div className={styles.teacherProfile}>
          <div className={styles.profileAvatar}>
            <img src={teacher.avatar} alt={teacher.name} />
          </div>
          {!sidebarCollapsed && (
            <div className={styles.profileInfo}>
              <p className={styles.profileName}>{teacher.name}</p>
              <p className={styles.profileRole}>{teacher.subject} Teacher</p>
              <p className={styles.profileDept}>{teacher.department}</p>
            </div>
          )}
        </div>

        <nav className={styles.sidebarNav}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`${styles.navItem} ${activeTab === item.id ? styles.active : ""}`}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {!sidebarCollapsed && (
                <div className={styles.navText}>
                  <span className={styles.navLabel}>{item.label}</span>
                  <span className={styles.navDescription}>
                    {item.description}
                  </span>
                </div>
              )}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          {!sidebarCollapsed ? (
            <>
              <button className={styles.footerBtn}>
                <span>🔔</span>
                <span>Notifications</span>
              </button>
              <button className={styles.footerBtn}>
                <span>⚙️</span>
                <span>Settings</span>
              </button>
              <button className={styles.footerBtn}>
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <button className={styles.footerBtnIcon}>🔔</button>
              <button className={styles.footerBtnIcon}>⚙️</button>
              <button className={styles.footerBtnIcon}>🚪</button>
            </>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`${styles.mainContent} ${sidebarCollapsed ? styles.expanded : ""}`}
      >
        {/* Top Bar */}
        <div className={styles.topBar}>
          <button
            className={styles.mobileMenuBtn}
            onClick={() => setMobileMenuOpen(true)}
          >
            ☰
          </button>
          <div className={styles.topBarTitle}>
            <h2>
              {menuItems.find((item) => item.id === activeTab)?.label ||
                "Dashboard"}
            </h2>
            <p>
              {menuItems.find((item) => item.id === activeTab)?.description ||
                "Overview"}
            </p>
          </div>
          <div className={styles.topBarActions}>
            <div className={styles.notificationBadge}>
              <span>🔔</span>
              <span className={styles.badge}>2</span>
            </div>
            <div className={styles.topBarTeacher}>
              <img src={teacher.avatar} alt={teacher.name} />
              <div>
                <p className={styles.topBarName}>{teacher.name}</p>
                <p className={styles.topBarRole}>{teacher.subject} Teacher</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className={styles.contentArea}>{renderContent()}</div>
      </main>
    </div>
  );
};

export default SubjectTeacherDashboard;
