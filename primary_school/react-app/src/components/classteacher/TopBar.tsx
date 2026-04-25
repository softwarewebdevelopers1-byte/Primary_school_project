import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "./shared/Avatar";
import { C, FONT } from "./shared/constants";
import { streamInfo } from "./shared/data";
import { DashboardTheme } from "../../lib/useDashboardTheme";

interface TopBarProps {
  activeLabel: string;
  isMobile: boolean;
  onOpenMenu: () => void;
  theme: DashboardTheme;
  onToggleTheme: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeLabel,
  isMobile,
  onOpenMenu,
  theme,
  onToggleTheme,
}) => {
  const navigate = useNavigate();
  const [user] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const isSubjectTeacher = user?.roles?.includes("subjectteacher");
  const hasSubjectAssignments = user?.subjects?.length > 0;
  const teachesSubjects = isSubjectTeacher && hasSubjectAssignments;

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
            Switch to Subject Dashboard
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
          {theme === "dark" ? "Light mode" : "Dark mode"}
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
            Current term
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
            Term {streamInfo.term}, {streamInfo.academicYear}
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
            <p
              style={{
                fontFamily: FONT.sans,
                fontSize: 11,
                color: C.textMuted,
                margin: 0,
              }}
            >
              Class Teacher
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
