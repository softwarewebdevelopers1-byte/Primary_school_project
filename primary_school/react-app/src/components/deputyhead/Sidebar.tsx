// components/deputyhead/Sidebar.tsx
import React from "react";
import { Avatar } from "./shared/Avatar";
import {
  BellIcon,
  LogoutIcon,
  ChevronLeft,
  ChevronRight,
} from "./shared/Icons";
import { C, F } from "./shared/constants";
import { TEACHERS, CONCERNS } from "./shared/data";

interface SidebarProps {
  navItems: any[];
  activeTab: string;
  collapsed: boolean;
  roleToggle: "deputy" | "headteacher"; // Fixed type
  onToggleCollapse: () => void;
  onSelectTab: (tabId: string) => void;
  onRoleToggle: (role: "deputy" | "headteacher") => void; // Fixed type
  userName: string;
  userRole: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  navItems,
  activeTab,
  collapsed,
  roleToggle,
  onToggleCollapse,
  onSelectTab,
  onRoleToggle,
  userName,
  userRole,
}) => {
  const activeTeachers = TEACHERS.filter((t) => t.status === "Active").length;
  const openConcerns = CONCERNS.filter((c) => c.status === "Open").length;

  return (
    <aside
      style={{
        width: collapsed ? 64 : 232,
        flexShrink: 0,
        background: C.green,
        display: "flex",
        flexDirection: "column",
        transition: "width .28s cubic-bezier(.22,1,.36,1)",
        overflow: "hidden",
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "16px 12px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          borderBottom: "1px solid rgba(255,255,255,.07)",
        }}
      >
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: C.gold,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <p
                style={{
                  fontFamily: F.sans,
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: "#e8dcc8",
                  letterSpacing: ".07em",
                  textTransform: "uppercase",
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                Leadership Hub
              </p>
              <p
                style={{
                  fontFamily: F.sans,
                  fontSize: 9.5,
                  color: "#4a6b5a",
                  margin: 0,
                  letterSpacing: ".04em",
                }}
              >
                {roleToggle === "headteacher" ? "Head Teacher" : "Deputy Head"}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="dh-sbtn"
          style={{
            width: 26,
            height: 26,
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
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>

      {/* Profile */}
      <div
        style={{
          padding: collapsed ? "14px 0" : "14px 12px",
          display: "flex",
          alignItems: "center",
          gap: collapsed ? 0 : 10,
          justifyContent: collapsed ? "center" : "flex-start",
          borderBottom: "1px solid rgba(255,255,255,.07)",
        }}
      >
        <Avatar name={userName} size={34} />
        {!collapsed && (
          <div style={{ overflow: "hidden" }}>
            <p
              style={{
                fontFamily: F.sans,
                fontSize: 12,
                fontWeight: 700,
                color: "#e8dcc8",
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {userName}
            </p>
            <p
              style={{
                fontFamily: F.sans,
                fontSize: 10.5,
                color: "#6b9a82",
                margin: 0,
              }}
            >
              {userRole}
            </p>
          </div>
        )}
      </div>

      {/* Role toggle */}
      {!collapsed && (
        <div
          style={{
            padding: "10px 12px",
            borderBottom: "1px solid rgba(255,255,255,.07)",
          }}
        >
          <p
            style={{
              fontFamily: F.sans,
              fontSize: 9,
              fontWeight: 700,
              color: "#4a6b5a",
              textTransform: "uppercase",
              letterSpacing: ".06em",
              margin: "0 0 7px",
            }}
          >
            View as
          </p>
          <div style={{ display: "flex", gap: 6 }}>
            {(["deputy", "headteacher"] as const).map((r) => (
              <button
                key={r}
                onClick={() => onRoleToggle(r)}
                style={{
                  flex: 1,
                  padding: "5px 0",
                  background:
                    roleToggle === r
                      ? "rgba(201,150,61,.22)"
                      : "rgba(255,255,255,.05)",
                  border: `1px solid ${roleToggle === r ? C.gold : "rgba(255,255,255,.08)"}`,
                  borderRadius: 7,
                  fontFamily: F.sans,
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: roleToggle === r ? "#e8dcc8" : "#6b9a82",
                  cursor: "pointer",
                  transition: "all .18s",
                }}
              >
                {r === "deputy" ? "Deputy" : "Head"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "10px 6px", overflowY: "auto" }}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`dh-nav${activeTab === item.id ? " dh-active" : ""}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: collapsed ? 0 : 10,
              width: "100%",
              padding: collapsed ? "10px 0" : "9px 10px",
              marginBottom: 2,
              background: "transparent",
              border: "none",
              borderLeft: `3px solid ${activeTab === item.id ? C.gold : "transparent"}`,
              borderRadius: activeTab === item.id ? "0 8px 8px 0" : "8px",
              cursor: "pointer",
              textAlign: "left",
              justifyContent: collapsed ? "center" : "flex-start",
              transition: "all .15s",
            }}
          >
            <span
              className="dh-ni"
              style={{
                color: activeTab === item.id ? C.gold : "#6b9a82",
                display: "flex",
                flexShrink: 0,
                transition: "color .15s",
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={item.icon} />
                {item.icon2 && <path d={item.icon2} />}
              </svg>
            </span>
            {!collapsed && (
              <p
                className="dh-nl"
                style={{
                  fontFamily: F.sans,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: activeTab === item.id ? "#e8dcc8" : "#9eb8aa",
                  margin: 0,
                  transition: "color .15s",
                }}
              >
                {item.label}
              </p>
            )}
          </button>
        ))}
      </nav>

      {/* Operational pulse */}
      {!collapsed && (
        <div
          style={{
            padding: "11px 12px",
            borderTop: "1px solid rgba(255,255,255,.07)",
            borderBottom: "1px solid rgba(255,255,255,.07)",
          }}
        >
          <p
            style={{
              fontFamily: F.sans,
              fontSize: 9.5,
              fontWeight: 700,
              color: "#4a6b5a",
              textTransform: "uppercase",
              letterSpacing: ".07em",
              margin: "0 0 8px",
            }}
          >
            Operations
          </p>
          {[
            ["Staff active", `${activeTeachers}/${TEACHERS.length}`],
            ["Open concerns", openConcerns],
            ["School avg", "77%"],
          ].map(([k, v]) => (
            <div
              key={k}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 5,
              }}
            >
              <span
                style={{ fontFamily: F.sans, fontSize: 11.5, color: "#6b9a82" }}
              >
                {k}
              </span>
              <span
                style={{
                  fontFamily: F.serif,
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.gold,
                }}
              >
                {v}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          padding: collapsed ? "10px 0" : "10px 6px",
          display: "flex",
          flexDirection: collapsed ? "column" : "row",
          gap: 6,
          justifyContent: "center",
        }}
      >
        <button
          className="dh-sbtn"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            padding: "7px",
            background: "rgba(255,255,255,.05)",
            border: "none",
            borderRadius: 7,
            cursor: "pointer",
            color: "#6b9a82",
            position: "relative",
            transition: "background .15s",
          }}
        >
          <BellIcon />
          {!collapsed && (
            <span
              style={{ fontFamily: F.sans, fontSize: 11, color: "#6b9a82" }}
            >
              Alerts
            </span>
          )}
          <span
            style={{
              position: "absolute",
              top: 3,
              right: collapsed ? 3 : 5,
              width: 14,
              height: 14,
              borderRadius: 7,
              background: C.gold,
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
          className="dh-sbtn"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            padding: "7px",
            background: "rgba(255,255,255,.05)",
            border: "none",
            borderRadius: 7,
            cursor: "pointer",
            color: "#6b9a82",
            transition: "background .15s",
          }}
        >
          <LogoutIcon />
          {!collapsed && (
            <span
              style={{ fontFamily: F.sans, fontSize: 11, color: "#6b9a82" }}
            >
              Log out
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};
