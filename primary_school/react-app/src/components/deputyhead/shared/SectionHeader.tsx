// components/deputyhead/shared/SectionHeader.tsx
import React from "react";
import { C, F } from "./constants";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  sub?: string;
  action?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  sub,
  action,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: "1.5rem",
      flexWrap: "wrap",
      gap: 12,
    }}
  >
    <div>
      <p
        style={{
          fontFamily: F.sans,
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: ".09em",
          textTransform: "uppercase",
          color: C.gold,
          margin: "0 0 4px",
        }}
      >
        {eyebrow}
      </p>
      <h2
        style={{
          fontFamily: F.serif,
          fontSize: "1.9rem",
          fontWeight: 600,
          color: C.text,
          margin: "0 0 3px",
          letterSpacing: "-.01em",
        }}
      >
        {title}
      </h2>
      {sub && (
        <p
          style={{
            fontFamily: F.sans,
            fontSize: 13,
            color: C.textMuted,
            margin: 0,
          }}
        >
          {sub}
        </p>
      )}
    </div>
    {action}
  </div>
);
