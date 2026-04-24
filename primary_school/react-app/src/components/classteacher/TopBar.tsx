// components/classteacher/TopBar.tsx
import React from "react";
import { Avatar } from "./shared/Avatar";
import { C, FONT } from "./shared/constants";
import { streamInfo } from "./shared/data";

interface TopBarProps {
  activeLabel: string;
  isMobile: boolean;
  onOpenMenu: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeLabel,
  isMobile,
  onOpenMenu,
}) => (
  <header
    className="ct-topBar"
    style={{
      background: C.white,
      borderBottom: `1px solid ${C.border}`,
      padding: "0 24px",
      height: 60,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexShrink: 0,
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
      style={{ display: "flex", alignItems: "center", gap: 18 }}
    >
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
        <Avatar name={streamInfo.classTeacher} size={34} />
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
            {streamInfo.classTeacher}
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
