import React, { useState } from "react";
import styles from "./ClassTeacherDashboard.module.css";
import StudentList from "./StudentList";
import StudentDetails from "./StudentDetails";
import MarksManagement from "./MarksManagement";
import ResultsDownload from "./ResultsDownload";
import { Student, StreamInfo, Subject } from "./types";

const dummyStreamInfo: StreamInfo = {
  id: "STR001",
  name: "7A",
  className: "Grade 7",
  classTeacher: "Mr. Peter Otieno",
  academicYear: "2024",
  term: 1,
  totalStudents: 35,
};

const dummySubjects: Subject[] = [
  { id: "SUB001", name: "Mathematics", code: "MATH101", teacher: "Mr. Peter Otieno" },
  { id: "SUB002", name: "English", code: "ENG101", teacher: "Mrs. Jane Wanjiku" },
  { id: "SUB003", name: "Kiswahili", code: "KSW101", teacher: "Mr. James Kamau" },
  { id: "SUB004", name: "Science", code: "SCI101", teacher: "Mrs. Mary Achieng" },
  { id: "SUB005", name: "Social Studies", code: "SST101", teacher: "Mr. John Mwangi" },
];

const dummyStudents: Student[] = [
  {
    id: "STU001",
    admissionNumber: "2024/001",
    name: "Emma Mwangi",
    className: "Grade 7",
    stream: "7A",
    gender: "Female",
    dateOfBirth: "2012-05-15",
    parentName: "John Mwangi",
    parentEmail: "john.mwangi@example.com",
    parentPhone: "+254712345678",
    address: "123 Nairobi Street",
    enrollmentDate: "2024-01-10",
    status: "Active",
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
    dateOfBirth: "2012-08-22",
    parentName: "Peter Otieno",
    parentEmail: "peter.otieno@example.com",
    parentPhone: "+254723456789",
    address: "456 Kisumu Road",
    enrollmentDate: "2024-01-10",
    status: "Active",
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
    dateOfBirth: "2012-03-10",
    parentName: "Hassan Ali",
    parentEmail: "hassan.ali@example.com",
    parentPhone: "+254734567890",
    address: "789 Mombasa Road",
    enrollmentDate: "2024-01-10",
    status: "Active",
    avatar:
      "https://ui-avatars.com/api/?name=Aisha+Hassan&background=F59E0B&color=fff",
  },
  {
    id: "STU004",
    admissionNumber: "2024/004",
    name: "Brian Kipchoge",
    className: "Grade 7",
    stream: "7A",
    gender: "Male",
    dateOfBirth: "2012-11-30",
    parentName: "Kipchoge Kimutai",
    parentEmail: "kipchoge@example.com",
    parentPhone: "+254745678901",
    address: "321 Eldoret Town",
    enrollmentDate: "2024-01-10",
    status: "Active",
    avatar:
      "https://ui-avatars.com/api/?name=Brian+Kipchoge&background=EF4444&color=fff",
  },
  {
    id: "STU005",
    admissionNumber: "2024/005",
    name: "Cynthia Achieng",
    className: "Grade 7",
    stream: "7A",
    gender: "Female",
    dateOfBirth: "2012-07-18",
    parentName: "Michael Achieng",
    parentEmail: "michael@example.com",
    parentPhone: "+254756789012",
    address: "567 Kisii Town",
    enrollmentDate: "2024-01-10",
    status: "Active",
    avatar:
      "https://ui-avatars.com/api/?name=Cynthia+Achieng&background=8B5CF6&color=fff",
  },
];

type Tab = "students" | "marks" | "results" | "analytics" | "settings";

const menuItems: Array<{
  id: Tab;
  label: string;
  shortLabel: string;
  description: string;
}> = [
  {
    id: "students",
    label: "Student records",
    shortLabel: "SR",
    description: "View rosters, contacts, and learner profiles.",
  },
  {
    id: "marks",
    label: "Marks management",
    shortLabel: "MM",
    description: "Capture marks and review class performance quickly.",
  },
  {
    id: "results",
    label: "Results and reports",
    shortLabel: "RR",
    description: "Prepare downloadable reports for this class stream.",
  },
  {
    id: "analytics",
    label: "Analytics",
    shortLabel: "AN",
    description: "Track readiness, averages, and class-level patterns.",
  },
  {
    id: "settings",
    label: "Settings",
    shortLabel: "ST",
    description: "Update class information and reporting preferences.",
  },
];

const teacherAvatar =
  "https://ui-avatars.com/api/?name=Peter+Otieno&background=4F46E5&color=fff";

const ClassTeacherDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("students");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [streamInfo] = useState<StreamInfo>(dummyStreamInfo);
  const [students] = useState<Student[]>(dummyStudents);
  const [subjects] = useState<Subject[]>(dummySubjects);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setMobileMenuOpen(false);
  };

  const handleBackToList = () => {
    setSelectedStudent(null);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    console.log("Updating student:", updatedStudent);
    alert(`Student ${updatedStudent.name} updated successfully!`);
  };

  const handleDeleteStudent = (studentId: string) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      console.log("Deleting student:", studentId);
      alert("Student deleted successfully!");
    }
  };

  const handleSelectTab = (tab: Tab) => {
    setActiveTab(tab);
    setSelectedStudent(null);
    setMobileMenuOpen(false);
  };

  const activeStudents = students.filter(
    (student) => student.status === "Active",
  ).length;
  const attendanceRate = Math.round((activeStudents / students.length) * 100);
  const activeMenuItem = menuItems.find((item) => item.id === activeTab) ?? menuItems[0];

  const quickActions = [
    {
      title: "Review marks",
      detail: "Open the current grading workflow for this stream.",
      onClick: () => handleSelectTab("marks"),
    },
    {
      title: "Generate reports",
      detail: "Move straight into result slips and summaries.",
      onClick: () => handleSelectTab("results"),
    },
    {
      title: "Check analytics",
      detail: "See class averages and readiness trends at a glance.",
      onClick: () => handleSelectTab("analytics"),
    },
  ];

  const focusItems = [
    `${students.length} learners are attached to ${streamInfo.className} ${streamInfo.name}.`,
    `${subjects.length} subject teachers are contributing to the class plan.`,
    `${attendanceRate}% active enrollment keeps reporting data clean this term.`,
  ];

  const renderContent = () => {
    if (selectedStudent && activeTab === "students") {
      return (
        <StudentDetails
          student={selectedStudent}
          onBack={handleBackToList}
          onUpdate={handleUpdateStudent}
          onDelete={handleDeleteStudent}
        />
      );
    }

    switch (activeTab) {
      case "students":
        return (
          <StudentList
            students={students}
            streamInfo={streamInfo}
            onViewStudent={handleViewStudent}
          />
        );
      case "marks":
        return (
          <MarksManagement
            students={students}
            subjects={subjects}
            streamInfo={streamInfo}
          />
        );
      case "results":
        return (
          <ResultsDownload
            students={students}
            subjects={subjects}
            streamInfo={streamInfo}
          />
        );
      case "analytics":
        return (
          <AnalyticsDashboard
            students={students}
            subjects={subjects}
            streamInfo={streamInfo}
          />
        );
      case "settings":
        return <SettingsPage streamInfo={streamInfo} />;
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
                <span className={styles.logoText}>Class Teacher Hub</span>
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
            <img src={teacherAvatar} alt="Teacher" />
          </div>
          {!sidebarCollapsed && (
            <div className={styles.profileInfo}>
              <p className={styles.profileName}>{streamInfo.classTeacher}</p>
              <p className={styles.profileRole}>Class Teacher</p>
              <p className={styles.profileStream}>
                {streamInfo.className} | Stream {streamInfo.name}
              </p>
            </div>
          )}
        </div>

        <div className={styles.streamInfo}>
          {!sidebarCollapsed ? (
            <>
              <div className={styles.streamDetail}>
                <span className={styles.streamLabel}>Academic year</span>
                <span className={styles.streamValue}>{streamInfo.academicYear}</span>
              </div>
              <div className={styles.streamDetail}>
                <span className={styles.streamLabel}>Term</span>
                <span className={styles.streamValue}>Term {streamInfo.term}</span>
              </div>
              <div className={styles.streamDetail}>
                <span className={styles.streamLabel}>Students</span>
                <span className={styles.streamValue}>{streamInfo.totalStudents}</span>
              </div>
            </>
          ) : (
            <div className={styles.streamBadge}>{streamInfo.name}</div>
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
            <p className={styles.sidebarPanelLabel}>Class pulse</p>
            <div className={styles.sidebarPanelStat}>
              <strong>{attendanceRate}%</strong>
              <span>Current active enrollment</span>
            </div>
            <div className={styles.sidebarPanelStat}>
              <strong>{subjects.length}</strong>
              <span>Teachers aligned to this stream</span>
            </div>
          </div>
        )}

        <div className={styles.sidebarFooter}>
          {!sidebarCollapsed ? (
            <>
              <button className={styles.footerBtn} type="button">
                <span className={styles.footerBtnTag}>3</span>
                <span>Notifications</span>
              </button>
              <button className={styles.footerBtn} type="button">
                <span className={styles.footerBtnTag}>Out</span>
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <button className={styles.footerBtnIcon} type="button">
                3
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
            <span className={styles.topBarEyebrow}>Class teacher dashboard</span>
            <h2>{activeMenuItem.label}</h2>
            <p>{activeMenuItem.description}</p>
          </div>
          <div className={styles.topBarActions}>
            <div className={styles.notificationBadge} role="status">
              <span className={styles.notificationLabel}>Alerts</span>
              <span className={styles.badge}>3</span>
            </div>
            <div className={styles.topBarMeta}>
              <span>Current term</span>
              <strong>
                Term {streamInfo.term}, {streamInfo.academicYear}
              </strong>
            </div>
            <div className={styles.topBarTeacher}>
              <img src={teacherAvatar} alt="Teacher" />
              <div>
                <p className={styles.topBarName}>{streamInfo.classTeacher}</p>
                <p className={styles.topBarRole}>Class Teacher</p>
              </div>
            </div>
          </div>
        </div>

        <section className={styles.overviewPanel}>
          <div className={styles.heroCard}>
            <div className={styles.heroCopy}>
              <span className={styles.heroEyebrow}>Today&apos;s focus</span>
              <h1>
                Keep {streamInfo.className} {streamInfo.name} organized,
                supported, and ready for the next reporting cycle.
              </h1>
              <p>
                The dashboard now surfaces the most important class actions
                first, so it is easier to move from learner follow-up to marks
                review and reporting without extra clicks.
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
                <span>Readiness score</span>
                <strong>{attendanceRate}%</strong>
                <p>Most class records are active and ready for term workflows.</p>
              </div>
              <div className={styles.heroList}>
                {focusItems.map((item) => (
                  <div key={item} className={styles.heroListItem}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.metricGrid}>
            <article className={styles.metricCard}>
              <span className={styles.metricLabel}>Students enrolled</span>
              <strong>{students.length}</strong>
              <p>Complete roster visibility for student support and outreach.</p>
            </article>
            <article className={styles.metricCard}>
              <span className={styles.metricLabel}>Subject coverage</span>
              <strong>{subjects.length}</strong>
              <p>All attached subject teachers are visible from one workspace.</p>
            </article>
            <article className={styles.metricCard}>
              <span className={styles.metricLabel}>Report readiness</span>
              <strong>85%</strong>
              <p>Most grading workflows are on track ahead of report download.</p>
            </article>
            <article className={styles.metricCard}>
              <span className={styles.metricLabel}>Family follow-up</span>
              <strong>6</strong>
              <p>Parent communication tasks remain easy to spot and act on.</p>
            </article>
          </div>
        </section>

        <div className={styles.contentArea}>{renderContent()}</div>
      </main>
    </div>
  );
};

const AnalyticsDashboard: React.FC<{
  students: Student[];
  subjects: Subject[];
  streamInfo: StreamInfo;
}> = ({ students, subjects, streamInfo }) => {
  return (
    <div className={styles.analyticsContainer}>
      <div className={styles.sectionHeader}>
        <div>
          <span className={styles.sectionEyebrow}>Insights</span>
          <h2>Performance analytics</h2>
        </div>
        <p>Track class trends and see where support is most urgent.</p>
      </div>

      <div className={styles.analyticsGrid}>
        <div className={styles.analyticsCard}>
          <h3>Class overview</h3>
          <div className={styles.statItem}>
            <span>Total students</span>
            <strong>{students.length}</strong>
          </div>
          <div className={styles.statItem}>
            <span>Subjects</span>
            <strong>{subjects.length}</strong>
          </div>
          <div className={styles.statItem}>
            <span>Current term</span>
            <strong>
              Term {streamInfo.term}, {streamInfo.academicYear}
            </strong>
          </div>
        </div>

        <div className={styles.analyticsCard}>
          <h3>Performance summary</h3>
          <div className={styles.statItem}>
            <span>Class average</span>
            <strong>78.5%</strong>
          </div>
          <div className={styles.statItem}>
            <span>Pass rate</span>
            <strong>85%</strong>
          </div>
          <div className={styles.statItem}>
            <span>Top performance</span>
            <strong>Mathematics (82%)</strong>
          </div>
          <div className={styles.analyticsNote}>
            Learners are strongest in quantitative work, with follow-up needed
            on revision consistency and writing confidence.
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsPage: React.FC<{ streamInfo: StreamInfo }> = ({ streamInfo }) => {
  return (
    <div className={styles.settingsContainer}>
      <div className={styles.sectionHeader}>
        <div>
          <span className={styles.sectionEyebrow}>Configuration</span>
          <h2>Class settings</h2>
        </div>
        <p>Refresh stream details while keeping the rest of your workflow intact.</p>
      </div>

      <div className={styles.settingsCard}>
        <h3>Stream information</h3>
        <div className={styles.settingsField}>
          <label>Stream name</label>
          <input type="text" defaultValue={streamInfo.name} />
        </div>
        <div className={styles.settingsField}>
          <label>Class name</label>
          <input type="text" defaultValue={streamInfo.className} />
        </div>
        <div className={styles.settingsField}>
          <label>Class teacher</label>
          <input type="text" defaultValue={streamInfo.classTeacher} />
        </div>
        <div className={styles.settingsField}>
          <label>Academic year</label>
          <input type="text" defaultValue={streamInfo.academicYear} />
        </div>
        <button className={styles.saveSettingsBtn} type="button">
          Save changes
        </button>
      </div>
    </div>
  );
};

export default ClassTeacherDashboard;
