import React, { useState } from "react";
import styles from "./ClassTeacherDashboard.module.css";
import StudentList from "./StudentList";
import StudentDetails from "./StudentDetails";
import MarksManagement from "./MarksManagement";
import ResultsDownload from "./ResultsDownload";
import ClassTeacherSidebar from "./ClassTeacherSidebar";
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
  {
    id: "SUB001",
    name: "Mathematics",
    code: "MATH101",
    teacher: "Mr. Peter Otieno",
  },
  {
    id: "SUB002",
    name: "English",
    code: "ENG101",
    teacher: "Mrs. Jane Wanjiku",
  },
  {
    id: "SUB003",
    name: "Kiswahili",
    code: "KSW101",
    teacher: "Mr. James Kamau",
  },
  {
    id: "SUB004",
    name: "Science",
    code: "SCI101",
    teacher: "Mrs. Mary Achieng",
  },
  {
    id: "SUB005",
    name: "Social Studies",
    code: "SST101",
    teacher: "Mr. John Mwangi",
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
  icon: string;
}> = [
  {
    id: "students",
    label: "Students",
    shortLabel: "SR",
    description: "View and manage class learners.",
    icon: "ST",
  },
  {
    id: "marks",
    label: "Marks",
    shortLabel: "MM",
    description: "Enter and review marks.",
    icon: "MK",
  },
  {
    id: "results",
    label: "Results",
    shortLabel: "RR",
    description: "Generate class reports.",
    icon: "RP",
  },
  {
    id: "analytics",
    label: "Analytics",
    shortLabel: "AN",
    description: "Check class performance trends.",
    icon: "AN",
  },
  {
    id: "settings",
    label: "Settings",
    shortLabel: "ST",
    description: "Update stream details.",
    icon: "CF",
  },
];

const teacherAvatar =
  "https://ui-avatars.com/api/?name=Peter+Otieno&background=0B2018&color=fff";

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
  const activeMenuItem =
    menuItems.find((item) => item.id === activeTab) ?? menuItems[0];

  const quickActions = [
    {
      title: "Marks",
      detail: "Open grading.",
      icon: "MK",
      onClick: () => handleSelectTab("marks"),
    },
    {
      title: "Reports",
      detail: "Prepare results.",
      icon: "RP",
      onClick: () => handleSelectTab("results"),
    },
    {
      title: "Analytics",
      detail: "View trends.",
      icon: "AN",
      onClick: () => handleSelectTab("analytics"),
    },
  ];

  const focusItems = [
    `${students.length} learners are attached to ${streamInfo.className} ${streamInfo.name}.`,
    `${subjects.length} subject teachers support this stream.`,
    `${attendanceRate}% of records are active this term.`,
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

      <ClassTeacherSidebar
        activeTab={activeTab}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        streamInfo={streamInfo}
        teacherAvatar={teacherAvatar}
        subjectsCount={subjects.length}
        attendanceRate={attendanceRate}
        onSelectTab={handleSelectTab}
        onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
      />

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
            <span className={styles.topBarEyebrow}>
              Class teacher dashboard
            </span>
            <h2>{activeMenuItem.label}</h2>
            <p>{activeMenuItem.description}</p>
          </div>
          <div className={styles.topBarActions}>
            <div className={styles.dateDisplay}>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className={styles.notificationBadge} role="status">
              <span>Alerts</span>
              <span className={styles.badge}>3</span>
            </div>
            <div className={styles.topBarTeacher}>
              <img src={teacherAvatar} alt="Teacher" />
              <div>
                <p className={styles.topBarName}>{streamInfo.classTeacher}</p>
                <p className={styles.topBarRole}>
                  {streamInfo.className} {streamInfo.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className={styles.overviewPanel}>
          <div className={styles.heroCard}>
            <div className={styles.heroCopy}>
              <span className={styles.heroEyebrow}>Today's focus</span>
              <h1>
                Keep {streamInfo.className} {streamInfo.name} ready for daily
                class work.
              </h1>
              <p>
                Quick access to learners, marks, reports, and class progress.
              </p>
              <div className={styles.heroActions}>
                {quickActions.map((action) => (
                  <button
                    key={action.title}
                    type="button"
                    className={styles.heroActionBtn}
                    onClick={action.onClick}
                  >
                    <span className={styles.heroActionIcon}>{action.icon}</span>
                    <div>
                      <strong>{action.title}</strong>
                      <span>{action.detail}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.heroAside}>
              <div className={styles.heroInsight}>
                <span>Readiness score</span>
                <strong>{attendanceRate}%</strong>
                <p>
                  Most class records are active and ready for term workflows.
                </p>
              </div>
              <div className={styles.heroList}>
                {focusItems.map((item, idx) => (
                  <div key={idx} className={styles.heroListItem}>
                    <span className={styles.heroListDot} /> {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.metricGrid}>
            <article className={styles.metricCard}>
              <div className={styles.metricIcon}>ST</div>
              <div>
                <span className={styles.metricLabel}>Students enrolled</span>
                <strong>{students.length}</strong>
                <p>Current class list.</p>
              </div>
            </article>
            <article className={styles.metricCard}>
              <div className={styles.metricIcon}>SB</div>
              <div>
                <span className={styles.metricLabel}>Subject coverage</span>
                <strong>{subjects.length}</strong>
                <p>Assigned subject teachers.</p>
              </div>
            </article>
            <article className={styles.metricCard}>
              <div className={styles.metricIcon}>RP</div>
              <div>
                <span className={styles.metricLabel}>Report readiness</span>
                <strong>85%</strong>
                <p>Reports nearly complete.</p>
              </div>
            </article>
            <article className={styles.metricCard}>
              <div className={styles.metricIcon}>FM</div>
              <div>
                <span className={styles.metricLabel}>Family follow-up</span>
                <strong>6</strong>
                <p>Pending parent follow-up.</p>
              </div>
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
          <div className={styles.analyticsCardIcon}>OV</div>
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
          <div className={styles.analyticsCardIcon}>PF</div>
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

        <div className={styles.analyticsCard}>
          <div className={styles.analyticsCardIcon}>TP</div>
          <h3>Top performers</h3>
          <div className={styles.topPerformerList}>
            <div className={styles.topPerformer}>
              <span className={styles.topPerformerRank}>1</span>
              <span>Emma Mwangi</span>
              <strong>92%</strong>
            </div>
            <div className={styles.topPerformer}>
              <span className={styles.topPerformerRank}>2</span>
              <span>James Otieno</span>
              <strong>88%</strong>
            </div>
            <div className={styles.topPerformer}>
              <span className={styles.topPerformerRank}>3</span>
              <span>Aisha Hassan</span>
              <strong>85%</strong>
            </div>
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
        <p>
          Refresh stream details while keeping the rest of your workflow intact.
        </p>
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
