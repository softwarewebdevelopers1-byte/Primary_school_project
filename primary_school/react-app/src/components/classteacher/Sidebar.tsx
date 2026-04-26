// components/classteacher/Sidebar.tsx
import React from "react";
import { Avatar } from "./shared/Avatar";
import {
  HomeIcon,
  BellIcon,
  LogoutIcon,
  ChevronLeft,
  ChevronRight,
} from "./shared/Icons";
import { C, FONT } from "./shared/constants";
import { NavItem } from "./types";

interface SidebarProps {
  navItems: NavItem[];
  activeTab: string;
  collapsed: boolean;
  mobileOpen: boolean;
  isMobile: boolean;
  onToggleCollapse: () => void;
  onSelectTab: (tabId: string) => void;
  classAvg: number;
  user: any;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  navItems,
  activeTab,
  collapsed,
  mobileOpen,
  isMobile,
  onToggleCollapse,
  onSelectTab,
  classAvg,
  user,
  onLogout,
}) => {
  return (
    <aside
      className={`ct-sidebarShell${mobileOpen ? " ct-mobileOpen" : ""}`}
      style={{
        width: collapsed ? 64 : 240,
        flexShrink: 0,
        background: C.green,
        display: "flex",
        flexDirection: "column",
        transition: "width 0.28s cubic-bezier(.22,1,.36,1)",
        overflow: "hidden",
        position: isMobile ? "fixed" : "relative",
        inset: isMobile ? "0 auto 0 0" : undefined,
        height: isMobile ? "100vh" : undefined,
        zIndex: isMobile ? 1000 : 10,
        boxShadow: isMobile ? "0 18px 42px rgba(11,32,24,0.24)" : undefined,
      }}
    >
      {/* Logo row */}
      <div
        style={{
          padding: "18px 14px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          borderBottom: `1px solid rgba(255,255,255,0.07)`,
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
              <HomeIcon />
            </div>
            <span
              style={{
                fontFamily: FONT.sans,
                fontSize: 12,
                fontWeight: 700,
                color: "#e8dcc8",
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              Class Teacher Hub
            </span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          aria-label={
            isMobile
              ? "Close navigation menu"
              : collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
          }
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            background: "rgba(255,255,255,0.07)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9eb8aa",
            flexShrink: 0,
            transition: "background 0.15s",
          }}
        >
          {isMobile ? (
            <ChevronLeft size={14} />
          ) : collapsed ? (
            <ChevronRight size={14} />
          ) : (
            <ChevronLeft size={14} />
          )}
        </button>
      </div>

      {/* Teacher profile */}
      <div
        style={{
          padding: collapsed ? "14px 0" : "16px 14px",
          display: "flex",
          alignItems: "center",
          gap: collapsed ? 0 : 10,
          justifyContent: collapsed ? "center" : "flex-start",
          borderBottom: `1px solid rgba(255,255,255,0.07)`,
        }}
      >
        <Avatar name={user?.name || "User"} size={36} />
        {!collapsed && (
          <div style={{ overflow: "hidden" }}>
            <p
              style={{
                fontFamily: FONT.sans,
                fontSize: 12.5,
                fontWeight: 700,
                color: "#e8dcc8",
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.name}
            </p>
            <p
              style={{
                fontFamily: FONT.sans,
                fontSize: 11,
                color: "#6b9a82",
                margin: 0,
              }}
            >
              Class Teacher · Grade {user?.classGrade}{user?.classStream}
            </p>
          </div>
        )}
      </div>

      {/* Stream stats */}
      {!collapsed && (
        <div
          style={{
            padding: "12px 14px",
            borderBottom: `1px solid rgba(255,255,255,0.07)`,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8,
            }}
          >
            {[
              ["Year", user?.year || 2024],
              ["Term", `T${user?.term || 1}`],
              ["Status", "Active"],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: 8,
                  padding: "7px 8px",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 10,
                    color: "#6b9a82",
                    margin: "0 0 2px",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {k}
                </p>
                <p
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#d8f0e4",
                    margin: 0,
                  }}
                >
                  {v}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`ct-navbtn${activeTab === item.id ? " ct-active" : ""}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: collapsed ? 0 : 10,
              width: "100%",
              padding: collapsed ? "10px 0" : "10px 10px",
              marginBottom: 2,
              background: "transparent",
              border: "none",
              borderLeft:
                activeTab === item.id
                  ? `3px solid ${C.gold}`
                  : "3px solid transparent",
              borderRadius: activeTab === item.id ? "0 9px 9px 0" : "9px",
              cursor: "pointer",
              textAlign: "left",
              justifyContent: collapsed ? "center" : "flex-start",
              transition: "all 0.15s",
            }}
          >
            <span
              style={{
                color: activeTab === item.id ? C.gold : "#6b9a82",
                flexShrink: 0,
                display: "flex",
              }}
            >
              <item.Icon />
            </span>
            {!collapsed && (
              <div>
                <p
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: activeTab === item.id ? "#e8dcc8" : "#9eb8aa",
                    margin: 0,
                  }}
                >
                  {item.label}
                </p>
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* Sidebar pulse */}
      {!collapsed && (
        <div
          style={{
            padding: "12px 14px",
            borderTop: `1px solid rgba(255,255,255,0.07)`,
            borderBottom: `1px solid rgba(255,255,255,0.07)`,
          }}
        >
          <p
            style={{
              fontFamily: FONT.sans,
              fontSize: 10,
              fontWeight: 700,
              color: "#4a6b5a",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              margin: "0 0 8px",
            }}
          >
            Class pulse
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <span
              style={{ fontFamily: FONT.sans, fontSize: 12, color: "#6b9a82" }}
            >
              Class average
            </span>
            <span
              style={{
                fontFamily: FONT.serif,
                fontSize: 14,
                fontWeight: 600,
                color: C.gold,
              }}
            >
              {classAvg}%
            </span>
          </div>
          <div
            style={{
              height: 5,
              background: "rgba(255,255,255,0.08)",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${classAvg}%`,
                height: "100%",
                background: C.gold,
                borderRadius: 3,
              }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          padding: collapsed ? "10px 0" : "12px 8px",
          display: "flex",
          flexDirection: collapsed ? "column" : "row",
          gap: 8,
          justifyContent: "center",
        }}
      >
        <button
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: collapsed ? "8px" : "8px 10px",
            background: "rgba(255,255,255,0.05)",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            color: "#6b9a82",
            position: "relative",
          }}
        >
          <BellIcon />
          {!collapsed && (
            <span
              style={{ fontFamily: FONT.sans, fontSize: 12, color: "#6b9a82" }}
            >
              Alerts
            </span>
          )}
          <span
            style={{
              position: "absolute",
              top: 4,
              right: collapsed ? 4 : 6,
              width: 16,
              height: 16,
              borderRadius: 8,
              background: C.gold,
              fontFamily: FONT.sans,
              fontSize: 9,
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
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: collapsed ? "8px" : "8px 10px",
            background: "rgba(255,255,255,0.05)",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            color: "#6b9a82",
          }}
        >
          <LogoutIcon />
          {!collapsed && (
            <span
              style={{ fontFamily: FONT.sans, fontSize: 12, color: "#6b9a82" }}
            >
              Log out
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};
