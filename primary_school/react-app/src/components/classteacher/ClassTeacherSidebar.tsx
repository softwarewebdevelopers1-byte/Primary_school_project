import React from "react";
import sidebarStyles from "../shared/TeacherSidebar.module.css";
import { StreamInfo } from "./types";

type Tab = "students" | "marks" | "results" | "analytics" | "settings";

interface ClassTeacherSidebarProps {
  activeTab: Tab;
  collapsed: boolean;
  mobileOpen: boolean;
  streamInfo: StreamInfo;
  teacherAvatar: string;
  subjectsCount: number;
  attendanceRate: number;
  onSelectTab: (tab: Tab) => void;
  onToggleCollapse: () => void;
}

const menuItems: Array<{
  id: Tab;
  label: string;
  shortLabel: string;
}> = [
  {
    id: "students",
    label: "Students",
    shortLabel: "SR",
  },
  {
    id: "marks",
    label: "Marks",
    shortLabel: "MM",
  },
  {
    id: "results",
    label: "Results",
    shortLabel: "RR",
  },
  {
    id: "analytics",
    label: "Analytics",
    shortLabel: "AN",
  },
  {
    id: "settings",
    label: "Settings",
    shortLabel: "ST",
  },
];

const ClassTeacherSidebar: React.FC<ClassTeacherSidebarProps> = ({
  activeTab,
  collapsed,
  mobileOpen,
  streamInfo,
  teacherAvatar,
  subjectsCount,
  attendanceRate,
  onSelectTab,
  onToggleCollapse,
}) => {
  return (
    <aside
      className={[
        sidebarStyles.sidebar,
        collapsed ? sidebarStyles.collapsed : "",
        mobileOpen ? sidebarStyles.mobileOpen : "",
      ].join(" ")}
    >
      <div className={sidebarStyles.sidebarHeader}>
        <div className={sidebarStyles.logo}>
          <span className={sidebarStyles.logoBadge}>CT</span>
          {!collapsed && (
            <div className={sidebarStyles.logoText}>
              <span className={sidebarStyles.logoName}>Class Teacher</span>
              <span className={sidebarStyles.logoCaption}>Navigation</span>
            </div>
          )}
        </div>
        <button
          className={sidebarStyles.collapseBtn}
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? ">" : "<"}
        </button>
      </div>

      <div className={sidebarStyles.profileCard}>
        <img
          className={sidebarStyles.profileAvatar}
          src={teacherAvatar}
          alt={streamInfo.classTeacher}
        />
        {!collapsed && (
          <div className={sidebarStyles.profileInfo}>
            <p className={sidebarStyles.profileName}>{streamInfo.classTeacher}</p>
            <p className={sidebarStyles.profileRole}>Class Teacher</p>
            <p className={sidebarStyles.profileMeta}>
              {streamInfo.className} {streamInfo.name}
            </p>
          </div>
        )}
      </div>

      <div className={sidebarStyles.statsCard}>
        {!collapsed ? (
          <>
            <p className={sidebarStyles.statsTitle}>Class summary</p>
            <div className={sidebarStyles.statRow}>
              <span className={sidebarStyles.statLabel}>Students</span>
              <strong className={sidebarStyles.statValue}>
                {streamInfo.totalStudents}
              </strong>
            </div>
            <div className={sidebarStyles.statRow}>
              <span className={sidebarStyles.statLabel}>Attendance</span>
              <strong className={sidebarStyles.statValue}>{attendanceRate}%</strong>
            </div>
            <div className={sidebarStyles.statRow}>
              <span className={sidebarStyles.statLabel}>Teachers</span>
              <strong className={sidebarStyles.statValue}>{subjectsCount}</strong>
            </div>
          </>
        ) : (
          <span className={sidebarStyles.statChip}>{streamInfo.name}</span>
        )}
      </div>

      <nav className={sidebarStyles.nav}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={[
              sidebarStyles.navItem,
              activeTab === item.id ? sidebarStyles.active : "",
            ].join(" ")}
            onClick={() => onSelectTab(item.id)}
          >
            <span className={sidebarStyles.navIcon}>{item.shortLabel}</span>
            {!collapsed && (
              <div className={sidebarStyles.navText}>
                <span className={sidebarStyles.navLabel}>{item.label}</span>
              </div>
            )}
          </button>
        ))}
      </nav>

      <div className={sidebarStyles.footer}>
        {!collapsed ? (
          <>
            <button className={sidebarStyles.footerBtn} type="button">
              <span className={sidebarStyles.footerBtnTag}>03</span>
              <span className={sidebarStyles.footerText}>Alerts</span>
            </button>
            <button className={sidebarStyles.footerBtn} type="button">
              <span className={sidebarStyles.footerBtnTag}>OUT</span>
              <span className={sidebarStyles.footerText}>Logout</span>
            </button>
          </>
        ) : (
          <>
            <button className={sidebarStyles.footerBtnIcon} type="button">
              NT
              <span className={sidebarStyles.notificationDot} />
            </button>
            <button className={sidebarStyles.footerBtnIcon} type="button">
              LO
            </button>
          </>
        )}
      </div>
    </aside>
  );
};

export default ClassTeacherSidebar;
