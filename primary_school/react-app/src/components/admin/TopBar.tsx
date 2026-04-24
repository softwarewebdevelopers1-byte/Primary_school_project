// components/admin/TopBar.tsx
import React from "react";

interface TopBarProps {
  title: string;
  unassignedCount: number;
  onSwitchTab: (tab: string) => void;
  teacherInitials: string;
  teacherAvatarColor: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  unassignedCount,
  onSwitchTab,
  teacherInitials,
  teacherAvatarColor,
}) => {
  const date = new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <header
      style={{
        background: "var(--cream)",
        borderBottom: "1px solid var(--border)",
        padding: "0 20px",
        height: 54,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        gap: 12,
      }}
    >
      <div>
        <p
          style={{
            fontSize: 9.5,
            fontWeight: 700,
            color: "var(--gold)",
            textTransform: "uppercase",
            letterSpacing: ".09em",
            margin: 0,
          }}
        >
          Admin Dashboard
        </p>
        <h2
          style={{
            fontFamily: "var(--serif)",
            fontSize: "1.1rem",
            fontWeight: 600,
            color: "var(--text)",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {title}
        </h2>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {unassignedCount > 0 && (
          <button
            onClick={() => onSwitchTab("classes")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 12px",
              background: "var(--dBg)",
              border: "1px solid #fecaca",
              borderRadius: 8,
              cursor: "pointer",
              fontFamily: "var(--sans)",
              fontSize: 11.5,
              fontWeight: 700,
              color: "var(--dText)",
            }}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>
              {unassignedCount} class{unassignedCount > 1 ? "es" : ""} without
              CT
            </span>
          </button>
        )}
        <p style={{ fontSize: 11.5, color: "var(--textF)", margin: 0 }}>
          {date}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 31,
              height: 31,
              borderRadius: "50%",
              background: teacherAvatarColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 11,
              color: "#fff",
            }}
          >
            {teacherInitials}
          </div>
          <div>
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "var(--text)",
                margin: 0,
              }}
            >
              Admin User
            </p>
            <p style={{ fontSize: 10, color: "var(--textMut)", margin: 0 }}>
              Administrator
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
