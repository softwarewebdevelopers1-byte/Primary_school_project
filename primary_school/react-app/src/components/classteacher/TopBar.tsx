// components/classteacher/TopBar.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "./shared/Avatar";
import { C, FONT } from "./shared/constants";
import { DashboardTheme } from "../../lib/useDashboardTheme";

interface TopBarProps {
  activeLabel: string;
  isMobile: boolean;
  onOpenMenu: () => void;
  theme: DashboardTheme;
  onToggleTheme: () => void;
  onLogout: () => void;
  user: any;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeLabel,
  isMobile,
  onOpenMenu,
  theme,
  onToggleTheme,
  onLogout,
  user,
}) => {
  const navigate = useNavigate();

  const rolesArray = Array.isArray(user?.roles) ? user.roles : [];
  const isSubjectTeacher = rolesArray.includes("subjectteacher");
  const teachesSubjects = isSubjectTeacher;

  return (
    <header
      className="ct-topBar"
      style={{
        background: C.white,
        borderBottom: `1px solid ${C.border}`,
        padding: "10px 24px",
        minHeight: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        gap: 18,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        {isMobile && (
          <button
            type="button"
            className="ct-menuBtn"
            onClick={onOpenMenu}
            aria-label="Open navigation menu"
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              background: C.sand,
              fontFamily: FONT.sans,
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
              fontFamily: FONT.sans,
              fontSize: 10.5,
              fontWeight: 700,
              color: C.gold,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              margin: 0,
            }}
          >
            Class Teacher Dashboard
          </p>
          <h2
            style={{
              fontFamily: FONT.serif,
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
        className="ct-topBarMeta"
        style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}
      >
        {teachesSubjects && (
          <button
            type="button"
            onClick={() => navigate("/subjectTeacher")}
            style={{
              padding: "9px 14px",
              borderRadius: 10,
              border: `1px solid ${C.border}`,
              background: C.goldPale,
              color: C.text,
              fontFamily: FONT.sans,
              fontSize: 12.5,
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Subject Dashboard
          </button>
        )}
        <button
          type="button"
          onClick={onToggleTheme}
          style={{
            padding: "9px 14px",
            borderRadius: 10,
            border: `1px solid ${C.border}`,
            background: C.white,
            color: C.text,
            fontFamily: FONT.sans,
            fontSize: 12.5,
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {theme === "dark" ? "Light" : "Dark"}
        </button>

        <div style={{ textAlign: "right" }}>
          <p
            style={{
              fontFamily: FONT.sans,
              fontSize: 11,
              color: C.textFaint,
              margin: 0,
            }}
          >
            Term {user?.term || 1}
          </p>
          <p
            style={{
              fontFamily: FONT.sans,
              fontSize: 13,
              fontWeight: 700,
              color: C.textMid,
              margin: 0,
            }}
          >
            {user?.year || 2024} Academic Year
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={user?.name || "Teacher"} size={34} />
          <div>
            <p
              style={{
                fontFamily: FONT.sans,
                fontSize: 12.5,
                fontWeight: 700,
                color: C.text,
                margin: 0,
              }}
            >
              {user?.name}
            </p>
            <button
              onClick={onLogout}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                fontFamily: FONT.sans,
                fontSize: 11,
                color: C.dangerText,
                fontWeight: 600,
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
};
