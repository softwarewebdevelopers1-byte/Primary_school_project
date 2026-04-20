// components/classteacher/ClassTeacherDashboard.tsx

import React, { useState } from "react";
import styles from "./ClassTeacherDashboard.module.css";
import StudentList from "./StudentList";
import StudentDetails from "./StudentDetails";
import MarksManagement from "./MarksManagement";
import ResultsDownload from "./ResultsDownload";
import { Student, StreamInfo, Subject } from "./types";

// Dummy data
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
    // Close mobile menu on mobile when selecting
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

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

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

  const menuItems = [
    {
      id: "students" as Tab,
      label: "Students Management",
      icon: "👥",
      description: "Manage student records",
    },
    {
      id: "marks" as Tab,
      label: "Marks Management",
      icon: "📝",
      description: "Enter and manage marks",
    },
    {
      id: "results" as Tab,
      label: "Results & Reports",
      icon: "📊",
      description: "Generate and download results",
    },
    {
      id: "analytics" as Tab,
      label: "Analytics",
      icon: "📈",
      description: "View performance analytics",
    },
    {
      id: "settings" as Tab,
      label: "Settings",
      icon: "⚙️",
      description: "Configure class settings",
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
                <span className={styles.logoIcon}>🏫</span>
                <span className={styles.logoText}>Teacher Portal</span>
              </>
            ) : (
              <span className={styles.logoIcon}>🏫</span>
            )}
          </div>
          <button className={styles.collapseBtn} onClick={toggleSidebar}>
            {sidebarCollapsed ? "→" : "←"}
          </button>
        </div>

        <div className={styles.teacherProfile}>
          <div className={styles.profileAvatar}>
            <img
              src="https://ui-avatars.com/api/?name=Peter+Otieno&background=4F46E5&color=fff"
              alt="Teacher"
            />
          </div>
          {!sidebarCollapsed && (
            <div className={styles.profileInfo}>
              <p className={styles.profileName}>{streamInfo.classTeacher}</p>
              <p className={styles.profileRole}>Class Teacher</p>
              <p className={styles.profileStream}>
                {streamInfo.name} • {streamInfo.className}
              </p>
            </div>
          )}
        </div>

        <div className={styles.streamInfo}>
          {!sidebarCollapsed ? (
            <>
              <div className={styles.streamDetail}>
                <span className={styles.streamLabel}>Stream:</span>
                <span className={styles.streamValue}>{streamInfo.name}</span>
              </div>
              <div className={styles.streamDetail}>
                <span className={styles.streamLabel}>Term:</span>
                <span className={styles.streamValue}>
                  Term {streamInfo.term}, {streamInfo.academicYear}
                </span>
              </div>
              <div className={styles.streamDetail}>
                <span className={styles.streamLabel}>Students:</span>
                <span className={styles.streamValue}>
                  {streamInfo.totalStudents}
                </span>
              </div>
            </>
          ) : (
            <div className={styles.streamBadge}>
              <span>{streamInfo.name}</span>
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
                setSelectedStudent(null);
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
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <button className={styles.footerBtnIcon}>🔔</button>
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
              <span className={styles.badge}>3</span>
            </div>
            <div className={styles.topBarTeacher}>
              <img
                src="https://ui-avatars.com/api/?name=Peter+Otieno&background=4F46E5&color=fff"
                alt="Teacher"
              />
              <div>
                <p className={styles.topBarName}>{streamInfo.classTeacher}</p>
                <p className={styles.topBarRole}>Class Teacher</p>
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

// Analytics Dashboard Component
const AnalyticsDashboard: React.FC<{
  students: Student[];
  subjects: Subject[];
  streamInfo: StreamInfo;
}> = ({ students, subjects, streamInfo }) => {
  return (
    <div className={styles.analyticsContainer}>
      <h2>📈 Performance Analytics</h2>
      <div className={styles.analyticsGrid}>
        <div className={styles.analyticsCard}>
          <h3>Class Overview</h3>
          <div className={styles.statItem}>
            <span>Total Students:</span>
            <strong>{students.length}</strong>
          </div>
          <div className={styles.statItem}>
            <span>Subjects:</span>
            <strong>{subjects.length}</strong>
          </div>
          <div className={styles.statItem}>
            <span>Current Term:</span>
            <strong>
              Term {streamInfo.term}, {streamInfo.academicYear}
            </strong>
          </div>
        </div>
        <div className={styles.analyticsCard}>
          <h3>Performance Summary</h3>
          <div className={styles.statItem}>
            <span>Class Average:</span>
            <strong>78.5%</strong>
          </div>
          <div className={styles.statItem}>
            <span>Pass Rate:</span>
            <strong>85%</strong>
          </div>
          <div className={styles.statItem}>
            <span>Top Performance:</span>
            <strong>Mathematics (82%)</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

// Settings Page Component
const SettingsPage: React.FC<{ streamInfo: StreamInfo }> = ({ streamInfo }) => {
  return (
    <div className={styles.settingsContainer}>
      <h2>⚙️ Class Settings</h2>
      <div className={styles.settingsCard}>
        <h3>Stream Information</h3>
        <div className={styles.settingsField}>
          <label>Stream Name:</label>
          <input type="text" defaultValue={streamInfo.name} />
        </div>
        <div className={styles.settingsField}>
          <label>Class Name:</label>
          <input type="text" defaultValue={streamInfo.className} />
        </div>
        <div className={styles.settingsField}>
          <label>Class Teacher:</label>
          <input type="text" defaultValue={streamInfo.classTeacher} />
        </div>
        <div className={styles.settingsField}>
          <label>Academic Year:</label>
          <input type="text" defaultValue={streamInfo.academicYear} />
        </div>
        <button className={styles.saveSettingsBtn}>Save Changes</button>
      </div>
    </div>
  );
};

export default ClassTeacherDashboard;
