// components/subjectteacher/TopBar.tsx
import React from "react";
// import { useNavigate } from "react-router-dom";
import styles from "./SubjectTeacherDashboard.module.css";
import { DashboardTheme } from "../../lib/useDashboardTheme";
import { RoleSwitcher } from "../shared/RoleSwitcher";

interface TopBarProps {
  title: string;
  teacherName: string;
  teacherInitials: string;
  teacherAvatarColor: string;
  theme: DashboardTheme;
  onToggleTheme: () => void;
  onLogout: () => void;
  user: any;
  onRefresh?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  teacherName,
  teacherInitials,
  teacherAvatarColor,
  theme,
  onToggleTheme,
  onLogout,
  user,
  onRefresh,
}) => {
  const date = new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className={styles.topbar}>
      <div>
        <p className={styles.topbarTitleSub}>Subject Teacher Portal</p>
        <h2 className={styles.topbarTitle}>{title}</h2>
      </div>
      <div className={styles.topbarRight}>
        <p style={{ fontSize: "11.5px", color: "var(--textF)", margin: 0 }}>
          {date}
        </p>
        <RoleSwitcher user={user} />
        <button
          type="button"
          onClick={onToggleTheme}
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "var(--white)",
            color: "var(--text)",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {theme === "dark" ? "Light" : "Dark"}
        </button>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--white)",
              color: "var(--gold)",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
            </svg>
            Sync
          </button>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            className={styles.sbAvatar}
            style={{
              background: teacherAvatarColor,
              width: 30,
              height: 30,
              fontSize: 10,
            }}
          >
            {teacherInitials}
          </div>
          <div>
            <p
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--text)",
                margin: 0,
              }}
            >
              {teacherName}
            </p>
            <button
              onClick={onLogout}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                fontSize: "10px",
                color: "var(--dText)",
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
    </div>
  );
};
