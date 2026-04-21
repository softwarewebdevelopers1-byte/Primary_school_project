import React from "react";
import sidebarStyles from "../shared/TeacherSidebar.module.css";
import { User, UserRole } from "./types";

type Tab =
  | "overview"
  | "teachers"
  | "classes"
  | "students"
  | "analytics"
  | "reports"
  | "concerns";

interface DeputyHeadSidebarProps {
  activeTab: Tab;
  collapsed: boolean;
  mobileOpen: boolean;
  user: User;
  userRole: UserRole;
  onSelectTab: (tab: Tab) => void;
  onToggleCollapse: () => void;
}

const allMenuItems: Array<{
  id: Tab;
  label: string;
  shortLabel: string;
  description: string;
  allowedFor: UserRole[];
}> = [
  {
    id: "overview",
    label: "School overview",
    shortLabel: "OV",
    description: "Key metrics and schoolwide readiness.",
    allowedFor: ["deputy", "headteacher"],
  },
  {
    id: "teachers",
    label: "Teacher management",
    shortLabel: "TM",
    description: "Monitor staffing, workload, and support needs.",
    allowedFor: ["deputy", "headteacher"],
  },
  {
    id: "classes",
    label: "Class management",
    shortLabel: "CM",
    description: "Track streams, structure, and class assignments.",
    allowedFor: ["deputy", "headteacher"],
  },
  {
    id: "students",
    label: "Student management",
    shortLabel: "SM",
    description: "Review learner records and movement across school.",
    allowedFor: ["deputy", "headteacher"],
  },
  {
    id: "analytics",
    label: "Analytics",
    shortLabel: "AN",
    description: "See trends, attainment, and operational patterns.",
    allowedFor: ["deputy", "headteacher"],
  },
  {
    id: "reports",
    label: "Reports",
    shortLabel: "RP",
    description: "Prepare leadership summaries and reporting packs.",
    allowedFor: ["headteacher"],
  },
  {
    id: "concerns",
    label: "Parent concerns",
    shortLabel: "PC",
    description: "Stay on top of follow-up and family feedback.",
    allowedFor: ["deputy", "headteacher"],
  },
];

const DeputyHeadSidebar: React.FC<DeputyHeadSidebarProps> = ({
  activeTab,
  collapsed,
  mobileOpen,
  user,
  userRole,
  onSelectTab,
  onToggleCollapse,
}) => {
  const visibleMenuItems = allMenuItems.filter((item) =>
    item.allowedFor.includes(userRole),
  );

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
          <span className={sidebarStyles.logoBadge}>DH</span>
          {!collapsed && (
            <div className={sidebarStyles.logoText}>
              <span className={sidebarStyles.logoName}>Leadership Hub</span>
              <span className={sidebarStyles.logoCaption}>School operations</span>
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
          src={user.avatar}
          alt={user.name}
        />
        {!collapsed && (
          <div className={sidebarStyles.profileInfo}>
            <p className={sidebarStyles.profileName}>{user.name}</p>
            <p className={sidebarStyles.profileRole}>
              {userRole === "headteacher" ? "Head Teacher" : "Deputy Head"}
            </p>
            <p className={sidebarStyles.profileMeta}>{user.email}</p>
          </div>
        )}
      </div>

      <div className={sidebarStyles.statsCard}>
        {!collapsed ? (
          <>
            <p className={sidebarStyles.statsTitle}>Leadership pulse</p>
            <div className={sidebarStyles.statRow}>
              <span className={sidebarStyles.statLabel}>Access level</span>
              <strong className={sidebarStyles.statValue}>
                {userRole === "headteacher" ? "Full" : "Deputy"}
              </strong>
            </div>
            <div className={sidebarStyles.statRow}>
              <span className={sidebarStyles.statLabel}>Visible workspaces</span>
              <strong className={sidebarStyles.statValue}>
                {visibleMenuItems.length}
              </strong>
            </div>
            <div className={sidebarStyles.statRow}>
              <span className={sidebarStyles.statLabel}>Open alerts</span>
              <strong className={sidebarStyles.statValue}>3</strong>
            </div>
          </>
        ) : (
          <span className={sidebarStyles.statChip}>ADM</span>
        )}
      </div>

      <nav className={sidebarStyles.nav}>
        {visibleMenuItems.map((item) => (
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
              <span className={sidebarStyles.footerBtnTag}>03</span>
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

export default DeputyHeadSidebar;
