// components/classteacher/StudentDetails.tsx
import React from "react";
import { avg, grade, gradeColor, gradeBg } from "./shared/helpers";
import { Avatar } from "./shared/Avatar";
import { BackIcon } from "./shared/Icons";
import { C, FONT } from "./shared/constants";

interface StudentDetailsProps {
  student: any;
  subjects: any[];
  onBack: () => void;
}

export const StudentDetails: React.FC<StudentDetailsProps> = ({
  student,
  subjects,
  onBack,
}) => {
  const a = avg(student.marks);

  return (
    <div className="ct-anim">
      <button
        onClick={onBack}
        className="ct-ghostbtn"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "8px 14px",
          background: "transparent",
          border: `1px solid ${C.border}`,
          borderRadius: 9,
          fontFamily: FONT.sans,
          fontSize: 13,
          fontWeight: 600,
          color: C.textMid,
          cursor: "pointer",
          marginBottom: "1.6rem",
          transition: "background 0.15s",
        }}
      >
        <BackIcon /> Back to list
      </button>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {/* Profile card */}
        <div
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: "1.6rem",
            gridColumn: "1/-1",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              marginBottom: "1.4rem",
            }}
          >
            <Avatar name={student.name} size={56} />
            <div>
              <h2
                style={{
                  fontFamily: FONT.serif,
                  fontSize: "1.7rem",
                  fontWeight: 600,
                  color: C.text,
                  margin: "0 0 4px",
                }}
              >
                {student.name}
              </h2>
              <p
                style={{
                  fontFamily: FONT.sans,
                  fontSize: 12.5,
                  color: C.textMuted,
                  margin: 0,
                }}
              >
                {student.admissionNumber} · {student.gender} ·{" "}
                Grade {student.classGrade} {student.classStream}
              </p>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <p
                style={{
                  fontFamily: FONT.serif,
                  fontSize: "2.4rem",
                  fontWeight: 600,
                  color: gradeColor(a),
                  margin: 0,
                }}
              >
                {a}%
              </p>
              <p
                style={{
                  fontFamily: FONT.sans,
                  fontSize: 11.5,
                  color: C.textFaint,
                  margin: 0,
                }}
              >
                Class average · Grade {grade(a)}
              </p>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 12,
            }}
          >
            {[
              ["Parent", student.parentName],
              ["Phone", student.parentPhone],
              ["Status", student.status],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  background: C.sand,
                  borderRadius: 9,
                  padding: "12px 14px",
                }}
              >
                <p
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.textFaint,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    margin: "0 0 4px",
                  }}
                >
                  {k}
                </p>
                <p
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 13.5,
                    fontWeight: 600,
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
        {/* Marks breakdown */}
        <div
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: "1.4rem",
            gridColumn: "1/-1",
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
              margin: "0 0 1rem",
            }}
          >
            Subject marks
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {subjects
              .filter(sub => student.marks && student.marks[sub.id] !== undefined)
              .map((sub) => {
              const m = student.marks[sub.id];
              return (
                <div
                  key={sub.id}
                  style={{ display: "flex", alignItems: "center", gap: 14 }}
                >
                  <span
                    style={{
                      fontFamily: FONT.sans,
                      fontSize: 13,
                      color: C.textMid,
                      width: 130,
                      flexShrink: 0,
                    }}
                  >
                    {sub.name}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 8,
                      background: C.sand,
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${m}%`,
                        height: "100%",
                        background: gradeColor(m),
                        borderRadius: 4,
                        transition: "width 0.6s ease",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontFamily: FONT.serif,
                      fontSize: 15,
                      fontWeight: 600,
                      color: gradeColor(m),
                      width: 48,
                      textAlign: "right",
                    }}
                  >
                    {m}%
                  </span>
                  <span
                    style={{
                      fontFamily: FONT.sans,
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: gradeColor(m),
                      background: gradeBg(m),
                      padding: "2px 8px",
                      borderRadius: 12,
                      width: 28,
                      textAlign: "center",
                    }}
                  >
                    {grade(m)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
