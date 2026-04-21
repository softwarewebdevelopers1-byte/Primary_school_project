import React, { useState } from "react";
import styles from "./DeputyHeadDashboard.module.css";
import SchoolOverview from "./SchoolOverview";
import TeacherManagement from "./TeacherManagement";
import ClassManagement from "./ClassManagement";
import StudentManagement from "./StudentManagement";
import PerformanceAnalytics from "./PerformanceAnalytics";
import Reports from "./Reports";
import ParentConcerns from "./ParentConcerns";
import DeputyHeadSidebar from "./DeputyHeadSidebar";
import { User, UserRole } from "./types";

const dummyDeputy: User = {
  id: "DEP001",
  name: "Mrs. Jane Wanjiku",
  email: "jane.wanjiku@school.com",
  role: "deputy",
  avatar:
    "https://ui-avatars.com/api/?name=Jane+Wanjiku&background=0B2018&color=fff",
  phone: "+254712345678",
  joinDate: "2020-01-15",
};

const dummyHeadTeacher: User = {
  id: "HD001",
  name: "Mr. John Mwangi",
  email: "john.mwangi@school.com",
  role: "headteacher",
  avatar:
    "https://ui-avatars.com/api/?name=John+Mwangi&background=0B2018&color=fff",
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

const menuItems: Array<{
  id: Tab;
  label: string;
  description: string;
  allowedFor: UserRole[];
}> = [
  {
    id: "overview",
    label: "School overview",
    description: "Key metrics and schoolwide readiness.",
    allowedFor: ["deputy", "headteacher"],
  },
  {
    id: "teachers",
    label: "Teacher management",
    description: "Monitor staffing, workload, and support needs.",
    allowedFor: ["deputy", "headteacher"],
  },
  {
    id: "classes",
    label: "Class management",
    description: "Track streams, structure, and class assignments.",
    allowedFor: ["deputy", "headteacher"],
  },
  {
    id: "students",
    label: "Student management",
    description: "Review learner records and movement across school.",
    allowedFor: ["deputy", "headteacher"],
  },
  {
    id: "analytics",
    label: "Analytics",
    description: "See trends, attainment, and operational patterns.",
    allowedFor: ["deputy", "headteacher"],
  },
  {
    id: "reports",
    label: "Reports",
    description: "Prepare leadership summaries and reporting packs.",
    allowedFor: ["headteacher"],
  },
  {
    id: "concerns",
    label: "Parent concerns",
    description: "Stay on top of follow-up and family feedback.",
    allowedFor: ["deputy", "headteacher"],
  },
];

const DeputyHeadDashboard: React.FC<DeputyHeadDashboardProps> = ({
  userRole = "deputy",
}) => {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = userRole === "deputy" ? dummyDeputy : dummyHeadTeacher;
  const isHeadTeacher = userRole === "headteacher";
  const filteredMenuItems = menuItems.filter((item) =>
    item.allowedFor.includes(userRole),
  );
  const activeMenuItem =
    filteredMenuItems.find((item) => item.id === activeTab) ?? filteredMenuItems[0];

  const leadershipActions = [
    {
      title: "Review staffing",
      detail: "Check class allocation pressure and teacher support needs.",
      tag: "TM",
      onClick: () => setActiveTab("teachers"),
    },
    {
      title: "Open analytics",
      detail: "See schoolwide patterns before weekly leadership meetings.",
      tag: "AN",
      onClick: () => setActiveTab("analytics"),
    },
    {
      title: "Track concerns",
      detail: "Follow parent issues and response timelines from one place.",
      tag: "PC",
      onClick: () => setActiveTab("concerns"),
    },
  ];

  const leadershipHighlights = [
    `${filteredMenuItems.length} leadership workspaces are visible in this account.`,
    `${isHeadTeacher ? "Full-school" : "Deputy"} access is active for daily oversight.`,
    `3 active alerts still need attention across operations and family follow-up.`,
  ];

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

  return (
    <div className={styles.dashboard}>
      {mobileMenuOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <DeputyHeadSidebar
        activeTab={activeTab}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        user={user}
        userRole={userRole}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setMobileMenuOpen(false);
        }}
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
            <span className={styles.topBarEyebrow}>Leadership dashboard</span>
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
              <span className={styles.notificationLabel}>Alerts</span>
              <span className={styles.badge}>3</span>
            </div>
            <div className={styles.topBarTeacher}>
              <img src={user.avatar} alt={user.name} />
              <div>
                <p className={styles.topBarName}>{user.name}</p>
                <p className={styles.topBarRole}>
                  {isHeadTeacher ? "Head Teacher" : "Deputy Head Teacher"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className={styles.overviewPanel}>
          <div className={styles.heroCard}>
            <div className={styles.heroCopy}>
              <span className={styles.heroEyebrow}>School operations</span>
              <h1>
                Lead academic operations with a calmer, clearer view of school
                performance, staffing, and learner support.
              </h1>
              <p>
                The leadership workspace now follows the same green and gold
                system as the login experience, while keeping the daily admin
                flow polished and easy to scan.
              </p>
              <div className={styles.heroActions}>
                {leadershipActions.map((action) => (
                  <button
                    key={action.title}
                    type="button"
                    className={styles.heroActionBtn}
                    onClick={action.onClick}
                  >
                    <span className={styles.heroActionTag}>{action.tag}</span>
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
                <span>Leadership access</span>
                <strong>{isHeadTeacher ? "Full" : "Deputy"}</strong>
                <p>
                  Permissions are aligned to the current role for focused
                  decision-making.
                </p>
              </div>
              <div className={styles.heroList}>
                {leadershipHighlights.map((item) => (
                  <div key={item} className={styles.heroListItem}>
                    <span className={styles.heroListDot} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.metricGrid}>
            <article className={styles.metricCard}>
              <span className={styles.metricLabel}>Visible workspaces</span>
              <strong>{filteredMenuItems.length}</strong>
              <p>Leadership actions are grouped into clear operational areas.</p>
            </article>
            <article className={styles.metricCard}>
              <span className={styles.metricLabel}>Open alerts</span>
              <strong>3</strong>
              <p>Outstanding issues stay visible before they become urgent.</p>
            </article>
            <article className={styles.metricCard}>
              <span className={styles.metricLabel}>Oversight mode</span>
              <strong>{isHeadTeacher ? "Whole school" : "Academic support"}</strong>
              <p>Role-specific visibility keeps the dashboard focused.</p>
            </article>
            <article className={styles.metricCard}>
              <span className={styles.metricLabel}>Reporting cadence</span>
              <strong>Weekly</strong>
              <p>Summaries and reviews remain ready for leadership meetings.</p>
            </article>
          </div>
        </section>

        <div className={styles.contentArea}>{renderContent()}</div>
      </main>
    </div>
  );
};

export default DeputyHeadDashboard;
