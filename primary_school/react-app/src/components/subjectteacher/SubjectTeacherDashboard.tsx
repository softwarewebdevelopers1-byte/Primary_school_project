import React, { useState } from "react";
import styles from "./SubjectTeacherDashboard.module.css";
import MySubjects from "./MySubjects";
import MarksEntry from "./MarksEntry";
import MyAssessments from "./MyAssessments";
import StudentProgress from "./StudentProgress";
import MyResources from "./MyResources";
import { Teacher, Subject, Student, Assessment } from "./types";

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

const menuItems: Array<{
  id: Tab;
  label: string;
  shortLabel: string;
  description: string;
}> = [
  {
    id: "subjects",
    label: "My subjects",
    shortLabel: "SB",
    description: "Review assigned streams and jump into classroom work.",
  },
  {
    id: "marks",
    label: "Marks entry",
    shortLabel: "ME",
    description: "Capture and revise student marks without extra friction.",
  },
  {
    id: "assessments",
    label: "Assessments",
    shortLabel: "AS",
    description: "Create tests, monitor status, and keep tasks aligned.",
  },
  {
    id: "progress",
    label: "Student progress",
    shortLabel: "PR",
    description: "Track performance patterns across classes and streams.",
  },
  {
    id: "resources",
    label: "Resources",
    shortLabel: "RS",
    description: "Organize lesson files and learning materials quickly.",
  },
];

const SubjectTeacherDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("subjects");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [teacher] = useState<Teacher>(dummyTeacher);
  const [subjects] = useState<Subject[]>(dummySubjects);
  const [students] = useState<Student[]>(dummyStudents);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [assessments] = useState<Assessment[]>([]);

  const handleSelectTab = (tab: Tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const handleSelectSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setActiveTab("marks");
  };

  const totalLearners = subjects.reduce((sum, subject) => sum + subject.students, 0);
  const activeMenuItem = menuItems.find((item) => item.id === activeTab) ?? menuItems[0];

  const quickActions = [
    {
      title: "Open marks entry",
      detail: "Start grading from the most recent assigned stream.",
      onClick: () => {
        setSelectedSubject(subjects[0] ?? null);
        handleSelectTab("marks");
      },
    },
    {
      title: "Review progress",
      detail: "Compare class trends and quickly spot learning gaps.",
      onClick: () => handleSelectTab("progress"),
    },
    {
      title: "Prepare resources",
      detail: "Upload or organize learning materials for the week.",
      onClick: () => handleSelectTab("resources"),
    },
  ];

  const teachingHighlights = [
    `${subjects.length} streams are active in your teaching load this term.`,
    `${totalLearners} learner seats are covered across your classes.`,
    `2 assessment actions are waiting for review before publishing.`,
  ];

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

  return (
    <div className={styles.dashboard}>
      {mobileMenuOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ""} ${mobileMenuOpen ? styles.mobileOpen : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            {!sidebarCollapsed ? (
              <>
                <span className={styles.logoIcon}>TP</span>
                <span className={styles.logoText}>Subject Teacher Hub</span>
              </>
            ) : (
              <span className={styles.logoIcon}>TP</span>
            )}
          </div>
          <button
            className={styles.collapseBtn}
            type="button"
            onClick={() => setSidebarCollapsed((value) => !value)}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? ">" : "<"}
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
              <p className={styles.profileDept}>{teacher.department} Department</p>
            </div>
          )}
        </div>

        <nav className={styles.sidebarNav}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.navItem} ${activeTab === item.id ? styles.active : ""}`}
              onClick={() => handleSelectTab(item.id)}
            >
              <span className={styles.navIcon}>{item.shortLabel}</span>
              {!sidebarCollapsed && (
                <div className={styles.navText}>
                  <span className={styles.navLabel}>{item.label}</span>
                  <span className={styles.navDescription}>{item.description}</span>
                </div>
              )}
            </button>
          ))}
        </nav>

        {!sidebarCollapsed && (
          <div className={styles.sidebarPanel}>
            <p className={styles.sidebarPanelLabel}>Teaching pulse</p>
            <div className={styles.sidebarPanelStat}>
              <strong>{subjects.length}</strong>
              <span>Streams currently assigned</span>
            </div>
            <div className={styles.sidebarPanelStat}>
              <strong>{totalLearners}</strong>
              <span>Learner seats covered this term</span>
            </div>
          </div>
        )}

        <div className={styles.sidebarFooter}>
          {!sidebarCollapsed ? (
            <>
              <button className={styles.footerBtn} type="button">
                <span className={styles.footerBtnTag}>2</span>
                <span>Notifications</span>
              </button>
              <button className={styles.footerBtn} type="button">
                <span className={styles.footerBtnTag}>Cfg</span>
                <span>Settings</span>
              </button>
              <button className={styles.footerBtn} type="button">
                <span className={styles.footerBtnTag}>Out</span>
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <button className={styles.footerBtnIcon} type="button">
                2
              </button>
              <button className={styles.footerBtnIcon} type="button">
                C
              </button>
              <button className={styles.footerBtnIcon} type="button">
                O
              </button>
            </>
          )}
        </div>
      </aside>

      <main
        className={`${styles.mainContent} ${sidebarCollapsed ? styles.expanded : ""}`}
      >
        <div className={styles.topBar}>
          <button
            className={styles.mobileMenuBtn}
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            Menu
          </button>
          <div className={styles.topBarTitle}>
            <span className={styles.topBarEyebrow}>Subject teacher dashboard</span>
            <h2>{activeMenuItem.label}</h2>
            <p>{activeMenuItem.description}</p>
          </div>
          <div className={styles.topBarActions}>
            <div className={styles.notificationBadge} role="status">
              <span className={styles.notificationLabel}>Alerts</span>
              <span className={styles.badge}>2</span>
            </div>
            <div className={styles.topBarMeta}>
              <span>Department</span>
              <strong>{teacher.department}</strong>
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

        <section className={styles.overviewPanel}>
          <div className={styles.heroCard}>
            <div className={styles.heroCopy}>
              <span className={styles.heroEyebrow}>Teaching overview</span>
              <h1>
                Guide every {teacher.subject.toLowerCase()} lesson with faster
                access to grading, assessment, and progress tracking.
              </h1>
              <p>
                The updated layout keeps your main workflows visible and reduces
                the effort needed to move between class streams during the day.
              </p>
              <div className={styles.heroActions}>
                {quickActions.map((action) => (
                  <button
                    key={action.title}
                    type="button"
                    className={styles.heroActionBtn}
                    onClick={action.onClick}
                  >
                    <strong>{action.title}</strong>
                    <span>{action.detail}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.heroAside}>
              <div className={styles.heroInsight}>
                <span>Coverage this term</span>
                <strong>{totalLearners}</strong>
                <p>Learner records are ready across your assigned streams.</p>
              </div>
              <div className={styles.heroList}>
                {teachingHighlights.map((item) => (
                  <div key={item} className={styles.heroListItem}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.metricGrid}>
            <article className={styles.metricCard}>
              <span className={styles.metricLabel}>Streams assigned</span>
              <strong>{subjects.length}</strong>
              <p>Your teaching load is clearly grouped by class and stream.</p>
            </article>
            <article className={styles.metricCard}>
              <span className={styles.metricLabel}>Learners reached</span>
              <strong>{totalLearners}</strong>
              <p>Total seats covered across all active subject allocations.</p>
            </article>
            <article className={styles.metricCard}>
              <span className={styles.metricLabel}>Marks pending</span>
              <strong>14</strong>
              <p>Remaining entries are easy to find before report deadlines.</p>
            </article>
            <article className={styles.metricCard}>
              <span className={styles.metricLabel}>Assessment rhythm</span>
              <strong>Weekly</strong>
              <p>Regular checkpoints make follow-up more predictable.</p>
            </article>
          </div>
        </section>

        <div className={styles.contentArea}>{renderContent()}</div>
      </main>
    </div>
  );
};

export default SubjectTeacherDashboard;
