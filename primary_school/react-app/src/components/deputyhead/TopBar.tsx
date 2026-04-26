// components/deputyhead/TopBar.tsx
import React from "react";
import { Avatar } from "./shared/Avatar";
import { C, F } from "./shared/constants";
import { DashboardTheme } from "../../lib/useDashboardTheme";
import { RoleSwitcher } from "../shared/RoleSwitcher";

interface TopBarProps {
  activeLabel: string;
  userName: string;
  date: string;
  isMobile: boolean;
  onOpenMenu: () => void;
  theme: DashboardTheme;
  onToggleTheme: () => void;
  onLogout: () => void;
  user: any;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeLabel,
  userName,
  date,
  isMobile,
  onOpenMenu,
  theme,
  onToggleTheme,
  onLogout,
  user,
}) => (
  <header
    className="dh-topBar"
    style={{
      background: C.white,
      borderBottom: `1px solid ${C.border}`,
      padding: "0 22px",
      height: 58,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexShrink: 0,
      gap: 16,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
      {isMobile && (
        <button
          type="button"
          className="dh-menuBtn"
          onClick={onOpenMenu}
          aria-label="Open navigation menu"
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: `1px solid ${C.border}`,
            background: C.sand,
            fontFamily: F.sans,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          Menu
        </button>
      )}
      <div style={{ minWidth: 0 }}>
      <p
        style={{
          fontFamily: F.sans,
          fontSize: 10,
          fontWeight: 700,
          color: C.gold,
          textTransform: "uppercase",
          letterSpacing: ".09em",
          margin: 0,
        }}
      >
        Leadership Dashboard
      </p>
      <h2
        style={{
          fontFamily: F.serif,
          fontSize: "1.15rem",
          fontWeight: 600,
          color: C.text,
          margin: 0,
          lineHeight: 1.2,
        }}
      >
        {activeLabel}
      </h2>
      </div>
    </div>
    <div
      className="dh-topBarMeta"
      style={{ display: "flex", alignItems: "center", gap: 18 }}
    >
      <button
        type="button"
        onClick={onToggleTheme}
        style={{
          padding: "8px 12px",
          borderRadius: 10,
          border: `1px solid ${C.border}`,
          background: C.white,
          color: C.text,
          fontFamily: F.sans,
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {theme === "dark" ? "Light" : "Dark"}
      </button>
      <p
        style={{
          fontFamily: F.sans,
          fontSize: 12,
          color: C.textFaint,
          margin: 0,
          whiteSpace: "nowrap",
        }}
      >
        {date}
      </p>
      <RoleSwitcher user={user} />
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <Avatar name={userName} size={33} />
        <div>
          <p
            style={{
              fontFamily: F.sans,
              fontSize: 12.5,
              fontWeight: 700,
              color: C.text,
              margin: 0,
            }}
          >
            {userName}
          </p>
          <button
            onClick={onLogout}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              fontFamily: F.sans,
              fontSize: 10.5,
              color: C.dangerText,
              fontWeight: 700,
              cursor: "pointer",
              textDecoration: "underline"
            }}
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  </header>
);
