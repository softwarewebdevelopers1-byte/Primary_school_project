// components/subjectteacher/TopBar.tsx
import React from "react";
import styles from "./SubjectTeacherDashboard.module.css";

interface TopBarProps {
  title: string;
  teacherName: string;
  teacherInitials: string;
  teacherAvatarColor: string;
  role: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  teacherName,
  teacherInitials,
  teacherAvatarColor,
  role,
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
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "10px", color: "var(--textF)", margin: 0 }}>
            Signed in as
          </p>
          <p
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "var(--textM)",
              margin: 0,
            }}
          >
            {role}
          </p>
        </div>
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
            <p style={{ fontSize: "10px", color: "var(--textMut)", margin: 0 }}>
              Mathematics
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
