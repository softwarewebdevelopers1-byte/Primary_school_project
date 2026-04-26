// components/deputyhead/ClassManagement.tsx
import React, { useState } from "react";
import { SectionHeader } from "./shared/SectionHeader";
import { C, F } from "./shared/constants";
import { gc } from "./shared/helpers";

interface ClassManagementProps {
  classes?: any[];
  students?: any[];
  staff?: any[];
  term?: number;
  year?: number;
}

export const ClassManagement: React.FC<ClassManagementProps> = ({ 
  classes = [], 
  students = [], 
  staff = [],
  term = 1,
  year = 2024
}) => {
  const [selectedClass, setSelectedClass] = useState<any>(null);

  return (
  <div className="dh-anim">
    <SectionHeader
      eyebrow="Classes"
      title="Class management"
      sub={`${classes.length} streams · Grades 7–9 · Term ${term}, ${year}`}
    />
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
        gap: 14,
      }}
    >
      {classes.map((c, i) => (
        <div
          key={c.id || i}
          className="dh-card"
          onClick={() => setSelectedClass(c)}
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 13,
            padding: "1.3rem",
            cursor: "pointer",
            transition: "box-shadow .2s,transform .2s",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 12,
            }}
          >
            <div>
              <h3
                style={{
                  fontFamily: F.serif,
                  fontSize: "1.3rem",
                  fontWeight: 600,
                  color: C.text,
                  margin: "0 0 3px",
                }}
              >
                {c.name}
              </h3>
              <p
                style={{
                  fontFamily: F.sans,
                  fontSize: 12,
                  color: C.textMuted,
                  margin: 0,
                }}
              >
                {c.teacher}
              </p>
            </div>
            <span
              style={{
                fontFamily: F.serif,
                fontSize: "1.7rem",
                fontWeight: 600,
                color: gc(c.avg),
              }}
            >
              {c.avg}%
            </span>
          </div>
          <div
            style={{
              height: 6,
              background: C.sand,
              borderRadius: 3,
              overflow: "hidden",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: `${c.avg}%`,
                height: "100%",
                background: gc(c.avg),
                borderRadius: 3,
              }}
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8,
            }}
          >
            {[
              ["Students", c.students],
              ["Subjects", c.subjects],
              ["Term", `T${c.term}`],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  background: C.sand,
                  borderRadius: 8,
                  padding: "8px 10px",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    fontFamily: F.sans,
                    fontSize: 10,
                    fontWeight: 700,
                    color: C.textFaint,
                    textTransform: "uppercase",
                    letterSpacing: ".04em",
                    margin: "0 0 2px",
                  }}
                >
                  {k}
                </p>
                <p
                  style={{
                    fontFamily: F.sans,
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: C.text,
                    margin: 0,
                  }}
                >
                  {v}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>

    {selectedClass && (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: 20,
        }}
        onClick={() => setSelectedClass(null)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: C.white,
            borderRadius: 16,
            width: "100%",
            maxWidth: 600,
            maxHeight: "85vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ padding: "24px 24px 16px", borderBottom: `1px solid ${C.borderLight}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <h2 style={{ margin: 0, fontFamily: F.serif, fontSize: 24, color: C.text }}>{selectedClass.name}</h2>
              <button 
                onClick={() => setSelectedClass(null)}
                style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: C.textMuted }}
              >
                ×
              </button>
            </div>
            <p style={{ margin: 0, fontFamily: F.sans, fontSize: 14, color: C.textMid }}>
              <strong>Class Teacher:</strong> {selectedClass.teacher || "Unassigned"}
            </p>
          </div>
          <div style={{ padding: 24, overflowY: "auto" }}>
            <h4 style={{ margin: "0 0 12px", fontFamily: F.sans, color: C.text }}>Enrolled Students ({students.filter(s => s.classGrade === selectedClass.grade && (s.classStream || "") === (selectedClass.stream || "")).length})</h4>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: C.sand, textAlign: "left" }}>
                  <th style={{ padding: "8px 12px", fontFamily: F.sans, fontSize: 12, color: C.textMuted }}>Name</th>
                  <th style={{ padding: "8px 12px", fontFamily: F.sans, fontSize: 12, color: C.textMuted }}>Adm No</th>
                  <th style={{ padding: "8px 12px", fontFamily: F.sans, fontSize: 12, color: C.textMuted }}>Gender</th>
                </tr>
              </thead>
              <tbody>
                {students.filter(s => s.classGrade === selectedClass.grade && (s.classStream || "") === (selectedClass.stream || "")).map((s, i) => (
                  <tr key={s.id || i} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                    <td style={{ padding: "10px 12px", fontFamily: F.sans, fontSize: 13, color: C.text }}>{s.name}</td>
                    <td style={{ padding: "10px 12px", fontFamily: F.sans, fontSize: 13, color: C.textMid }}>{s.admissionNo || s.adm || "-"}</td>
                    <td style={{ padding: "10px 12px", fontFamily: F.sans, fontSize: 13, color: C.textMuted }}>{s.gender || "-"}</td>
                  </tr>
                ))}
                {students.filter(s => s.classGrade === selectedClass.grade && (s.classStream || "") === (selectedClass.stream || "")).length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ padding: 20, textAlign: "center", color: C.textMuted, fontFamily: F.sans }}>No students found for this class.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}
  </div>
  );
};
