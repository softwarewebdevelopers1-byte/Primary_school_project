// components/deputyhead/shared/MetricCard.tsx
import React from "react";
import { C, F } from "./constants";

interface MetricCardProps {
  label: string;
  value: string | number;
  note?: string;
  accent?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  note,
  accent = C.gold,
}) => (
  <div
    style={{
      background: C.white,
      border: `1px solid ${C.border}`,
      borderRadius: 13,
      padding: "1.2rem 1.3rem",
      borderTop: `3px solid ${accent}`,
      fontFamily: F.sans,
    }}
  >
    <p
      style={{
        fontSize: 10.5,
        fontWeight: 700,
        color: C.textFaint,
        textTransform: "uppercase",
        letterSpacing: ".05em",
        margin: "0 0 6px",
      }}
    >
      {label}
    </p>
    <p
      style={{
        fontFamily: F.serif,
        fontSize: "2rem",
        fontWeight: 600,
        color: C.text,
        margin: "0 0 4px",
        lineHeight: 1,
      }}
    >
      {value}
    </p>
    {note && (
      <p
        style={{
          fontSize: 11.5,
          color: C.textFaint,
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        {note}
      </p>
    )}
  </div>
);
