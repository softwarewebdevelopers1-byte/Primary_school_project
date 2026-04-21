import React from "react";
import sidebarStyles from "../shared/TeacherSidebar.module.css";
import { Subject, Teacher } from "./types";

type Tab = "subjects" | "marks" | "assessments" | "progress" | "resources";

interface SubjectTeacherSidebarProps {
  activeTab: Tab;
  collapsed: boolean;
  mobileOpen: boolean;
  teacher: Teacher;
  subjects: Subject[];
  totalLearners: number;
  onSelectTab: (tab: Tab) => void;
  onToggleCollapse: () => void;
}

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

const SubjectTeacherSidebar: React.FC<SubjectTeacherSidebarProps> = ({
  activeTab,
  collapsed,
  mobileOpen,
  teacher,
  subjects,
  totalLearners,
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
          <span className={sidebarStyles.logoBadge}>ST</span>
          {!collapsed && (
            <div className={sidebarStyles.logoText}>
              <span className={sidebarStyles.logoName}>Subject Teacher Hub</span>
              <span className={sidebarStyles.logoCaption}>Lesson control</span>
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
          src={teacher.avatar}
          alt={teacher.name}
        />
        {!collapsed && (
          <div className={sidebarStyles.profileInfo}>
            <p className={sidebarStyles.profileName}>{teacher.name}</p>
            <p className={sidebarStyles.profileRole}>{teacher.subject} Teacher</p>
            <p className={sidebarStyles.profileMeta}>{teacher.department} Department</p>
          </div>
        )}
      </div>

      <div className={sidebarStyles.statsCard}>
        {!collapsed ? (
          <>
            <p className={sidebarStyles.statsTitle}>Teaching pulse</p>
            <div className={sidebarStyles.statRow}>
              <span className={sidebarStyles.statLabel}>Assigned streams</span>
              <strong className={sidebarStyles.statValue}>{subjects.length}</strong>
            </div>
            <div className={sidebarStyles.statRow}>
              <span className={sidebarStyles.statLabel}>Learners reached</span>
              <strong className={sidebarStyles.statValue}>{totalLearners}</strong>
            </div>
            <div className={sidebarStyles.statRow}>
              <span className={sidebarStyles.statLabel}>Department</span>
              <strong className={sidebarStyles.statValue}>{teacher.department}</strong>
            </div>
          </>
        ) : (
          <span className={sidebarStyles.statChip}>{subjects.length}C</span>
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
                <span className={sidebarStyles.navDescription}>
                  {item.description}
                </span>
              </div>
            )}
          </button>
        ))}
      </nav>

      <div className={sidebarStyles.footer}>
        {!collapsed ? (
          <>
            <button className={sidebarStyles.footerBtn} type="button">
              <span className={sidebarStyles.footerBtnTag}>02</span>
              <span className={sidebarStyles.footerText}>Notifications</span>
            </button>
            <button className={sidebarStyles.footerBtn} type="button">
              <span className={sidebarStyles.footerBtnTag}>CFG</span>
              <span className={sidebarStyles.footerText}>Settings</span>
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
              CF
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

export default SubjectTeacherSidebar;
