// components/deputyhead/DeputyHeadDashboard.tsx

import React, { useState } from "react";
import styles from "./DeputyHeadDashboard.module.css";
import SchoolOverview from "./SchoolOverview";
import TeacherManagement from "./TeacherManagement";
import ClassManagement from "./ClassManagement";
import StudentManagement from "./StudentManagement";
import PerformanceAnalytics from "./PerformanceAnalytics";
import Reports from "./Reports";
import ParentConcerns from "./ParentConcerns";
import { User, UserRole } from "./types";

// Dummy User Data
const dummyDeputy: User = {
  id: "DEP001",
  name: "Mrs. Jane Wanjiku",
  email: "jane.wanjiku@school.com",
  role: "deputy",
  avatar:
    "https://ui-avatars.com/api/?name=Jane+Wanjiku&background=4F46E5&color=fff",
  phone: "+254712345678",
  joinDate: "2020-01-15",
};

const dummyHeadTeacher: User = {
  id: "HD001",
  name: "Mr. John Mwangi",
  email: "john.mwangi@school.com",
  role: "headteacher",
  avatar:
    "https://ui-avatars.com/api/?name=John+Wangari&background=10B981&color=fff",
  phone: "+254723456789",
  joinDate: "2018-01-10",
};

interface DeputyHeadDashboardProps {
  userRole?: UserRole;
}

type Tab =
  | "overview"
  | "teachers"
  | "classes"
  | "students"
  | "analytics"
  | "reports"
  | "concerns";

const DeputyHeadDashboard: React.FC<DeputyHeadDashboardProps> = ({
  userRole = "deputy",
}) => {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = userRole === "deputy" ? dummyDeputy : dummyHeadTeacher;
  const isHeadTeacher = userRole === "headteacher";

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <SchoolOverview userRole={userRole} />;
      case "teachers":
        return <TeacherManagement userRole={userRole} />;
      case "classes":
        return <ClassManagement userRole={userRole} />;
      case "students":
        return <StudentManagement userRole={userRole} />;
      case "analytics":
        return <PerformanceAnalytics userRole={userRole} />;
      case "reports":
        return <Reports userRole={userRole} />;
      case "concerns":
        return <ParentConcerns userRole={userRole} />;
      default:
        return null;
    }
  };

  const menuItems = [
    {
      id: "overview" as Tab,
      label: "School Overview",
      icon: "🏫",
      description: "Key metrics & statistics",
      allowedFor: ["deputy", "headteacher"],
    },
    {
      id: "teachers" as Tab,
      label: "Teacher Management",
      icon: "👨‍🏫",
      description: "Manage teaching staff",
      allowedFor: ["deputy", "headteacher"],
    },
    {
      id: "classes" as Tab,
      label: "Class Management",
      icon: "📚",
      description: "Manage classes & streams",
      allowedFor: ["deputy", "headteacher"],
    },
    {
      id: "students" as Tab,
      label: "Student Management",
      icon: "👨‍🎓",
      description: "View all students",
      allowedFor: ["deputy", "headteacher"],
    },
    {
      id: "analytics" as Tab,
      label: "Analytics",
      icon: "📊",
      description: "Performance insights",
      allowedFor: ["deputy", "headteacher"],
    },
    {
      id: "reports" as Tab,
      label: "Reports",
      icon: "📄",
      description: "Generate school reports",
      allowedFor: ["headteacher"],
    },
    {
      id: "concerns" as Tab,
      label: "Parent Concerns",
      icon: "💬",
      description: "Manage feedback",
      allowedFor: ["deputy", "headteacher"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.allowedFor.includes(userRole),
  );

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
                <span className={styles.logoText}>School Admin</span>
              </>
            ) : (
              <span className={styles.logoIcon}>🏫</span>
            )}
          </div>
          <button className={styles.collapseBtn} onClick={toggleSidebar}>
            {sidebarCollapsed ? "→" : "←"}
          </button>
        </div>

        <div className={styles.userProfile}>
          <div className={styles.profileAvatar}>
            <img src={user.avatar} alt={user.name} />
            {isHeadTeacher && <span className={styles.roleBadge}>Head</span>}
          </div>
          {!sidebarCollapsed && (
            <div className={styles.profileInfo}>
              <p className={styles.profileName}>{user.name}</p>
              <p className={styles.profileRole}>
                {isHeadTeacher ? "Head Teacher" : "Deputy Head Teacher"}
              </p>
              <p className={styles.profileEmail}>{user.email}</p>
            </div>
          )}
        </div>

        <nav className={styles.sidebarNav}>
          {filteredMenuItems.map((item) => (
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
                <span className={styles.notificationCount}>3</span>
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
              <button className={styles.footerBtnIcon}>
                🔔
                <span className={styles.notificationDot} />
              </button>
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
              {filteredMenuItems.find((item) => item.id === activeTab)?.label ||
                "Dashboard"}
            </h2>
            <p>
              {filteredMenuItems.find((item) => item.id === activeTab)
                ?.description || "Overview"}
            </p>
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
            <div className={styles.notificationBadge}>
              <span>🔔</span>
              <span className={styles.badge}>3</span>
            </div>
            <div className={styles.topBarUser}>
              <img src={user.avatar} alt={user.name} />
              <div>
                <p className={styles.topBarName}>{user.name}</p>
                <p className={styles.topBarRole}>
                  {isHeadTeacher ? "Head Teacher" : "Deputy Head"}
                </p>
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

export default DeputyHeadDashboard;
