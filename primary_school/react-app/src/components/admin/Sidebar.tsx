// components/admin/Sidebar.tsx
import React from "react";

interface SidebarProps {
  collapsed: boolean;
  activeTab: string;
  navItems: any[];
  classesCount: number;
  subjectsCount: number;
  teachersCount: number;
  assignedCT: number;
  totalClasses: number;
  unassignedCount: number;
  onToggleCollapse: () => void;
  onSelectTab: (tabId: string) => void;
  onLogout: () => void;
  teacherInitials: string;
  teacherAvatarColor: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  activeTab,
  navItems,
  classesCount,
  subjectsCount,
  teachersCount,
  assignedCT,
  totalClasses,
  unassignedCount,
  onToggleCollapse,
  onSelectTab,
  onLogout,
  teacherInitials,
  teacherAvatarColor,
}) => {
  return (
    <aside
      style={{
        width: collapsed ? 56 : 224,
        background: "var(--cg)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.28s cubic-bezier(0.22, 1, 0.36, 1)",
        overflow: "hidden",
        flexShrink: 0,
        zIndex: 5,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "14px 12px 11px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,.07)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: "var(--gold)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          {!collapsed && (
            <div>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#e8dcc8",
                  letterSpacing: ".07em",
                  textTransform: "uppercase",
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                Admin Portal
              </p>
              <p style={{ fontSize: 9, color: "#4a6b5a", margin: 0 }}>
                School Administration
              </p>
            </div>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          style={{
            width: 25,
            height: 25,
            borderRadius: 6,
            background: "rgba(255,255,255,.06)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9eb8aa",
            flexShrink: 0,
            transition: "background .15s",
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <path d={collapsed ? "M9 18l6-6-6-6" : "M15 18l-6-6 6-6"} />
          </svg>
        </button>
      </div>

      {/* Profile */}
      <div
        style={{
          padding: 12,
          display: "flex",
          alignItems: "center",
          gap: 9,
          justifyContent: collapsed ? "center" : "flex-start",
          borderBottom: "1px solid rgba(255,255,255,.07)",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: teacherAvatarColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 11,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {teacherInitials}
        </div>
        {!collapsed && (
          <div>
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#e8dcc8",
                margin: 0,
              }}
            >
              Admin User
            </p>
            <p style={{ fontSize: 10, color: "#6b9a82", margin: 0 }}>
              School Administrator
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div
        style={{
          padding: "10px 12px",
          borderBottom: "1px solid rgba(255,255,255,.07)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 5,
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,.06)",
              borderRadius: 7,
              padding: "5px 3px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: 9,
                color: "#4a6b5a",
                margin: "0 0 1px",
                textTransform: "uppercase",
                letterSpacing: ".04em",
              }}
            >
              Classes
            </p>
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#d8f0e4",
                margin: 0,
              }}
            >
              {classesCount}
            </p>
          </div>
          <div
            style={{
              background: "rgba(255,255,255,.06)",
              borderRadius: 7,
              padding: "5px 3px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: 9,
                color: "#4a6b5a",
                margin: "0 0 1px",
                textTransform: "uppercase",
                letterSpacing: ".04em",
              }}
            >
              Subjects
            </p>
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#d8f0e4",
                margin: 0,
              }}
            >
              {subjectsCount}
            </p>
          </div>
          <div
            style={{
              background: "rgba(255,255,255,.06)",
              borderRadius: 7,
              padding: "5px 3px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: 9,
                color: "#4a6b5a",
                margin: "0 0 1px",
                textTransform: "uppercase",
                letterSpacing: ".04em",
              }}
            >
              Staff
            </p>
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#d8f0e4",
                margin: 0,
              }}
            >
              {teachersCount}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "8px 6px", overflowY: "auto" }}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              width: "100%",
              padding: "9px 10px",
              marginBottom: 2,
              background: "transparent",
              border: "none",
              borderLeft:
                activeTab === item.id
                  ? "3px solid var(--gold)"
                  : "3px solid transparent",
              borderRadius: "0 8px 8px 0",
              cursor: "pointer",
              textAlign: "left",
              transition: "all .15s",
              position: "relative",
              backgroundColor:
                activeTab === item.id ? "rgba(201,150,61,.18)" : "transparent",
            }}
            onMouseEnter={(e) => {
              if (activeTab !== item.id)
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(201,150,61,.09)";
            }}
            onMouseLeave={(e) => {
              if (activeTab !== item.id)
                (e.currentTarget as HTMLElement).style.background =
                  "transparent";
            }}
          >
            <span
              style={{
                color: activeTab === item.id ? "var(--gold)" : "#6b9a82",
                display: "flex",
                flexShrink: 0,
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                dangerouslySetInnerHTML={{ __html: item.svg }}
              />
            </span>
            {!collapsed && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: activeTab === item.id ? "#e8dcc8" : "#9eb8aa",
                }}
              >
                {item.label}
              </span>
            )}
            {item.id === "classes" && unassignedCount > 0 && !collapsed && (
              <span
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 15,
                  height: 15,
                  borderRadius: 8,
                  background: "var(--dText)",
                  fontSize: 8.5,
                  fontWeight: 700,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {unassignedCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* System Health */}
      <div
        style={{
          padding: "10px 12px",
          borderTop: "1px solid rgba(255,255,255,.07)",
          borderBottom: "1px solid rgba(255,255,255,.07)",
        }}
      >
        <p
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: "#4a6b5a",
            textTransform: "uppercase",
            letterSpacing: ".07em",
            margin: "0 0 7px",
          }}
        >
          System health
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: 11, color: "#6b9a82" }}>CT assigned</span>
          <span
            style={{
              fontFamily: "var(--serif)",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--gold)",
            }}
          >
            {assignedCT}/{totalClasses}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: 11, color: "#6b9a82" }}>Open alerts</span>
          <span
            style={{
              fontFamily: "var(--serif)",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--wText)",
            }}
          >
            3
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: "#6b9a82" }}>Unassigned</span>
          <span
            style={{
              fontFamily: "var(--serif)",
              fontSize: 13,
              fontWeight: 600,
              color: unassignedCount > 0 ? "var(--dText)" : "var(--sText)",
            }}
          >
            {unassignedCount}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "9px 6px",
          display: "flex",
          gap: 6,
          flexDirection: collapsed ? "column" : "row",
        }}
      >
        <button
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            padding: 7,
            background: "rgba(255,255,255,.05)",
            border: "none",
            borderRadius: 7,
            cursor: "pointer",
            color: "#6b9a82",
            position: "relative",
            transition: "background .15s",
          }}
        >
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
          {!collapsed && (
            <span style={{ fontSize: 11, color: "#6b9a82" }}>Alerts</span>
          )}
          <span
            style={{
              position: "absolute",
              top: 3,
              right: 4,
              width: 14,
              height: 14,
              borderRadius: 7,
              background: "var(--gold)",
              fontSize: 8,
              fontWeight: 700,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            3
          </span>
        </button>
        <button
          onClick={onLogout}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            padding: 7,
            background: "rgba(255,255,255,.05)",
            border: "none",
            borderRadius: 7,
            cursor: "pointer",
            color: "#6b9a82",
            transition: "background .15s",
          }}
        >
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
          {!collapsed && (
            <span style={{ fontSize: 11, color: "#6b9a82" }}>Log out</span>
          )}
        </button>
      </div>
    </aside>
  );
};
