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
  allowedFor: UserRole[];
}> = [
  {
    id: "overview",
    label: "Overview",
    shortLabel: "OV",
    allowedFor: ["deputy", "headteacher"],
  },
  {
    id: "teachers",
    label: "Teachers",
    shortLabel: "TM",
    allowedFor: ["deputy", "headteacher"],
  },
  {
    id: "classes",
    label: "Classes",
    shortLabel: "CM",
    allowedFor: ["deputy", "headteacher"],
  },
  {
    id: "students",
    label: "Students",
    shortLabel: "SM",
    allowedFor: ["deputy", "headteacher"],
  },
  {
    id: "analytics",
    label: "Analytics",
    shortLabel: "AN",
    allowedFor: ["deputy", "headteacher"],
  },
  {
    id: "reports",
    label: "Reports",
    shortLabel: "RP",
    allowedFor: ["headteacher"],
  },
  {
    id: "concerns",
    label: "Concerns",
    shortLabel: "PC",
    allowedFor: ["deputy", "headteacher"],
  },
];

const DeputyHeadSidebar: React.FC<DeputyHeadSidebarProps> = ({
  activeTab,
  collapsed,
  mobileOpen,
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
              <span className={sidebarStyles.logoName}>Deputy Head</span>
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

export default DeputyHeadSidebar;
