// components/deputyhead/TopBar.tsx
import React from "react";
import { Avatar } from "./shared/Avatar";
import { C, F } from "./shared/constants";

interface TopBarProps {
  activeLabel: string;
  userName: string;
  userRole: string;
  date: string;
  isMobile: boolean;
  onOpenMenu: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeLabel,
  userName,
  userRole,
  date,
  isMobile,
  onOpenMenu,
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
      <div style={{ textAlign: "right" }}>
        <p
          style={{
            fontFamily: F.sans,
            fontSize: 10.5,
            color: C.textFaint,
            margin: 0,
          }}
        >
          Signed in as
        </p>
        <p
          style={{
            fontFamily: F.sans,
            fontSize: 12.5,
            fontWeight: 700,
            color: C.textMid,
            margin: 0,
          }}
        >
          {userRole}
        </p>
      </div>
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
          <p
            style={{
              fontFamily: F.sans,
              fontSize: 10.5,
              color: C.textMuted,
              margin: 0,
            }}
          >
            {userRole}
          </p>
        </div>
      </div>
    </div>
  </header>
);
