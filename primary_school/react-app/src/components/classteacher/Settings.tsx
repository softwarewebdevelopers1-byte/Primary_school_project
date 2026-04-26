// components/classteacher/Settings.tsx
import React, { useState } from "react";
import { C, FONT } from "./shared/constants";
import { api } from "../../lib/api";

interface SettingsProps {
  user: any;
  studentsCount: number;
  onUserUpdate?: (updatedUser: any) => void;
}

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

export const Settings: React.FC<SettingsProps> = ({ user, studentsCount, onUserUpdate }) => {
  const [form, setForm] = useState({
    name: user?.classStream || "",
    className: `Grade ${user?.classGrade || ""}`,
    classTeacher: user?.name || "",
    academicYear: user?.year?.toString() || "2024",
    term: user?.term?.toString() || "1",
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedData = {
        ...user,
        term: Number(form.term),
        year: Number(form.academicYear),
      };
      await api.put(`/users/${user.id}`, updatedData);
      setSaved(true);
      if (onUserUpdate) onUserUpdate(updatedData);
      // Update local storage too
      localStorage.setItem("user", JSON.stringify(updatedData));
    } catch (err) {
      alert("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const Field: React.FC<{ label: string; k: string; type?: string; disabled?: boolean }> = ({
    label,
    k,
    type = "text",
    disabled = false,
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
        disabled={disabled}
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
          color: disabled ? C.textMuted : C.text,
          background: disabled ? C.sand : C.cream,
          transition: "all 0.2s",
          cursor: disabled ? "not-allowed" : "text"
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
          <Field label="Stream name" k="name" disabled />
          <Field label="Class name" k="className" disabled />
          <Field label="Class teacher" k="classTeacher" disabled />
          <Field label="Academic year" k="academicYear" />
          <Field label="Term" k="term" type="number" />
          <p style={{ fontSize: 12, color: C.textFaint, marginBottom: "1rem" }}>
            Note: Some fields are locked by administration.
          </p>
          <button
            className="ct-primarybtn"
            onClick={handleSave}
            disabled={loading}
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
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.22s",
              marginTop: 4,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Saving..." : saved ? "✓ Changes saved" : "Save changes"}
          </button>
        </div>
        <div
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: "1.4rem",
          }}
        >
          <p
            style={{
              fontFamily: FONT.sans,
              fontSize: 12,
              fontWeight: 700,
              color: C.textMid,
              margin: "0 0 6px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Class statistics
          </p>
          <p style={{ fontFamily: FONT.sans, fontSize: 13, color: C.textMuted, margin: 0 }}>
            Total Learners: <strong>{studentsCount}</strong>
          </p>
          <p style={{ fontFamily: FONT.sans, fontSize: 13, color: C.textMuted, margin: "4px 0 0" }}>
            Status: <span style={{ color: C.successText, fontWeight: 600 }}>Active</span>
          </p>
        </div>
      </div>
    </div>
  );
};
