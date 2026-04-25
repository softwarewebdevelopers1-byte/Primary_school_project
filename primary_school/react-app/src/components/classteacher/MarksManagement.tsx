// components/classteacher/MarksManagement.tsx
import React, { useState, useEffect } from "react";
import { avg, gradeColor } from "./shared/helpers";
import { Avatar } from "./shared/Avatar";
import { C, FONT } from "./shared/constants";

interface MarksManagementProps {
  students: any[];
  subjects: any[];
}

const SectionHeader: React.FC<{
  eyebrow: string;
  title: string;
  sub?: string;
  action?: React.ReactNode;
}> = ({ eyebrow, title, sub, action }) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: "1.6rem",
      flexWrap: "wrap",
      gap: "12px",
    }}
  >
    <div>
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
    {action}
  </div>
);

export const MarksManagement: React.FC<MarksManagementProps> = ({ students, subjects }) => {
  const [marks, setMarks] = useState<Record<string, Record<string, number>>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const m: Record<string, Record<string, number>> = {};
    students.forEach((s) => {
      m[s.id] = { ...(s.marks || {}) };
      // Initialize missing subjects with 0
      subjects.forEach(sub => {
        if (m[s.id][sub.id] === undefined) m[s.id][sub.id] = 0;
      });
    });
    setMarks(m);
  }, [students, subjects]);

  const update = (sid: string, subid: string, val: string) => {
    const n = Math.max(0, Math.min(100, Number(val) || 0));
    setMarks((prev) => ({ ...prev, [sid]: { ...prev[sid], [subid]: n } }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    // In a real app, you would POST to /api/marks/bulk
    await new Promise(resolve => setTimeout(resolve, 800));
    setSaving(false);
    setSaved(true);
  };

  if (students.length === 0) {
    return <div style={{ padding: 40, textAlign: "center", color: C.textMuted }}>No students found in this class.</div>;
  }

  return (
    <div className="ct-anim">
      <SectionHeader
        eyebrow="Marks"
        title="Marks management"
        sub="Edit marks per subject. Values are clamped to 0–100."
        action={
          <button
            className="ct-primarybtn"
            onClick={handleSave}
            disabled={saving}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              background: C.gold,
              color: "#fff",
              border: "none",
              borderRadius: 9,
              fontFamily: FONT.sans,
              fontSize: 13.5,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.22s",
              opacity: saving ? 0.7 : 1
            }}
          >
            {saving ? "Saving..." : saved ? "✓ Saved" : "Save changes"}
          </button>
        }
      />
      <div
        style={{
          background: C.white,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          overflow: "auto",
        }}
      >
        <table
          style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}
        >
          <thead>
            <tr style={{ background: C.sand }}>
              <th
                style={{
                  padding: "11px 14px",
                  textAlign: "left",
                  fontFamily: FONT.sans,
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.textMuted,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Student
              </th>
              {subjects.map((s) => (
                <th
                  key={s.id}
                  style={{
                    padding: "11px 10px",
                    textAlign: "center",
                    fontFamily: FONT.sans,
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.textMuted,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {s.name.split(" ")[0]}
                </th>
              ))}
              <th
                style={{
                  padding: "11px 14px",
                  textAlign: "center",
                  fontFamily: FONT.sans,
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.textMuted,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Avg
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const currentMarks = marks[s.id] || {};
              const a = avg(currentMarks);
              return (
                <tr
                  key={s.id}
                  style={{ borderTop: `1px solid ${C.borderLight}` }}
                >
                  <td style={{ padding: "10px 14px" }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 9 }}
                    >
                      <Avatar name={s.name} size={28} />
                      <span
                        style={{
                          fontFamily: FONT.sans,
                          fontSize: 13,
                          fontWeight: 600,
                          color: C.text,
                        }}
                      >
                        {s.name}
                      </span>
                    </div>
                  </td>
                  {subjects.map((sub) => (
                    <td
                      key={sub.id}
                      style={{ padding: "10px 8px", textAlign: "center" }}
                    >
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={currentMarks[sub.id] || 0}
                        onChange={(e) => update(s.id, sub.id, e.target.value)}
                        className="ct-input"
                        style={{
                          width: 58,
                          padding: "7px 8px",
                          border: `1.5px solid ${C.border}`,
                          borderRadius: 8,
                          fontFamily: FONT.sans,
                          fontSize: 13.5,
                          fontWeight: 600,
                          color: gradeColor(currentMarks[sub.id] || 0),
                          textAlign: "center",
                          background: C.cream,
                          transition: "all 0.2s",
                        }}
                      />
                    </td>
                  ))}
                  <td style={{ padding: "10px 14px", textAlign: "center" }}>
                    <span
                      style={{
                        fontFamily: FONT.serif,
                        fontSize: 17,
                        fontWeight: 600,
                        color: gradeColor(a),
                      }}
                    >
                      {a}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
