// components/subjectteacher/Sidebar.tsx
import React from "react";
import styles from "./SubjectTeacherDashboard.module.css";

interface SidebarProps {
  collapsed: boolean;
  activeTab: string;
  onToggleCollapse: () => void;
  onSelectTab: (tab: string) => void;
  teacherName: string;
  teacherInitials: string;
  teacherAvatarColor: string;
  streamsCount: number;
  totalStudents: number;
  department: string;
  onLogout: () => void;
}

const navItems = [
  { id: "subjects", label: "Subjects", icon: "SB" },
  { id: "marks", label: "Marks", icon: "ME" },
  { id: "assessments", label: "Assessments", icon: "AS" },
  { id: "progress", label: "Progress", icon: "PR" },
  { id: "resources", label: "Resources", icon: "RS" },
];

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  activeTab,
  onToggleCollapse,
  onSelectTab,
  teacherName,
  teacherInitials,
  teacherAvatarColor,
  streamsCount,
  totalStudents,
  department,
  onLogout,
}) => {
  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <div className={styles.sbLogo}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flex: 1,
            minWidth: 0,
          }}
        >
          <div className={styles.sbBadge}>ST</div>
          {!collapsed && (
            <div className={styles.sbLogoText}>
              <p>Subject Teacher</p>
              <span>Navigation</span>
            </div>
          )}
        </div>
        <button className={styles.sbToggle} onClick={onToggleCollapse}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={collapsed ? "M9 18l6-6-6-6" : "M15 18l-6-6 6-6"} />
          </svg>
        </button>
      </div>

      <div className={styles.sbProfile}>
        <div
          className={styles.sbAvatar}
          style={{ background: teacherAvatarColor }}
        >
          {teacherInitials}
        </div>
        {!collapsed && (
          <div>
            <p className={styles.sbPname}>{teacherName}</p>
            <p className={styles.sbProle}>Mathematics Teacher</p>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className={styles.sbStats}>
          <p className={styles.sbStatsTitle}>Teaching summary</p>
          <div className={styles.sbStatRow}>
            <span className={styles.sbStatLabel}>Streams</span>
            <strong className={styles.sbStatVal}>{streamsCount}</strong>
          </div>
          <div className={styles.sbStatRow}>
            <span className={styles.sbStatLabel}>Learners</span>
            <strong className={styles.sbStatVal}>{totalStudents}</strong>
          </div>
          <div className={styles.sbStatRow}>
            <span className={styles.sbStatLabel}>Dept.</span>
            <strong className={styles.sbStatVal}>{department}</strong>
          </div>
        </div>
      )}

      <nav className={styles.sbNav}>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`${styles.navBtn} ${activeTab === item.id ? styles.active : ""}`}
            onClick={() => onSelectTab(item.id)}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            {!collapsed && (
              <span className={styles.navLabel}>{item.label}</span>
            )}
          </button>
        ))}
      </nav>

      <div className={styles.sbFooter}>
        <button className={styles.footBtn}>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          {!collapsed && <span>Alerts</span>}
        </button>
        <button className={styles.footBtn} onClick={onLogout}>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};
