// components/classteacher/Settings.tsx
import React, { useState } from "react";
import { streamInfo } from "./shared/data";
import { C, FONT } from "./shared/constants";

const SectionHeader: React.FC<{
  eyebrow: string;
  title: string;
  sub?: string;
}> = ({ eyebrow, title, sub }) => (
  <div style={{ marginBottom: "1.6rem" }}>
    <p
      style={{
        fontFamily: FONT.sans,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.09em",
        textTransform: "uppercase",
        color: C.gold,
        margin: "0 0 5px",
      }}
    >
      {eyebrow}
    </p>
    <h2
      style={{
        fontFamily: FONT.serif,
        fontSize: "1.9rem",
        fontWeight: 600,
        color: C.text,
        margin: "0 0 4px",
        letterSpacing: "-0.01em",
      }}
    >
      {title}
    </h2>
    {sub && (
      <p
        style={{
          fontFamily: FONT.sans,
          fontSize: 13,
          color: C.textMuted,
          margin: 0,
        }}
      >
        {sub}
      </p>
    )}
  </div>
);

export const Settings: React.FC = () => {
  const [form, setForm] = useState({
    name: streamInfo.name,
    className: streamInfo.className,
    classTeacher: streamInfo.classTeacher,
    academicYear: streamInfo.academicYear,
    term: streamInfo.term,
  });
  const [saved, setSaved] = useState(false);

  const Field: React.FC<{ label: string; k: string; type?: string }> = ({
    label,
    k,
    type = "text",
  }) => (
    <div style={{ marginBottom: "1.2rem" }}>
      <label
        style={{
          display: "block",
          fontFamily: FONT.sans,
          fontSize: 11.5,
          fontWeight: 700,
          color: C.textMid,
          letterSpacing: "0.03em",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <input
        type={type}
        className="ct-input"
        value={(form as any)[k]}
        onChange={(e) => {
          setForm((f) => ({ ...f, [k]: e.target.value }));
          setSaved(false);
        }}
        style={{
          width: "100%",
          padding: "11px 14px",
          border: `1.5px solid ${C.border}`,
          borderRadius: 9,
          fontFamily: FONT.sans,
          fontSize: 14,
          color: C.text,
          background: C.cream,
          transition: "all 0.2s",
        }}
      />
    </div>
  );

  return (
    <div className="ct-anim">
      <SectionHeader
        eyebrow="Configuration"
        title="Class settings"
        sub="Update stream details while keeping the rest of your workflow intact."
      />
      <div style={{ maxWidth: 520 }}>
        <div
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: "1.8rem",
            marginBottom: 16,
          }}
        >
          <p
            style={{
              fontFamily: FONT.sans,
              fontSize: 11,
              fontWeight: 700,
              color: C.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              margin: "0 0 1.2rem",
            }}
          >
            Stream information
          </p>
          <Field label="Stream name" k="name" />
          <Field label="Class name" k="className" />
          <Field label="Class teacher" k="classTeacher" />
          <Field label="Academic year" k="academicYear" />
          <Field label="Term" k="term" type="number" />
          <button
            className="ct-primarybtn"
            onClick={() => setSaved(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "11px 22px",
              background: C.gold,
              color: "#fff",
              border: "none",
              borderRadius: 9,
              fontFamily: FONT.sans,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.22s",
              marginTop: 4,
            }}
          >
            {saved ? "✓ Changes saved" : "Save changes"}
          </button>
        </div>
        <div
          style={{
            background: C.dangerBg,
            border: `1px solid #fecaca`,
            borderRadius: 14,
            padding: "1.4rem",
          }}
        >
          <p
            style={{
              fontFamily: FONT.sans,
              fontSize: 12,
              fontWeight: 700,
              color: C.dangerText,
              margin: "0 0 6px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Danger zone
          </p>
          <p
            style={{
              fontFamily: FONT.sans,
              fontSize: 13,
              color: C.dangerText,
              margin: "0 0 12px",
              lineHeight: 1.5,
              opacity: 0.85,
            }}
          >
            Resetting class data is irreversible. All marks and student
            assignments will be cleared.
          </p>
          <button
            style={{
              padding: "9px 18px",
              background: "transparent",
              border: `1.5px solid ${C.dangerText}`,
              borderRadius: 9,
              fontFamily: FONT.sans,
              fontSize: 13,
              fontWeight: 600,
              color: C.dangerText,
              cursor: "pointer",
            }}
          >
            Reset class data
          </button>
        </div>
      </div>
    </div>
  );
};
