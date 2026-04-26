// components/classteacher/StudentRecords.tsx
import React, { useState } from "react";
import { avg, gradeColor } from "./shared/helpers";
import { Avatar } from "./shared/Avatar";
import { C, FONT } from "./shared/constants";

interface StudentRecordsProps {
  students: any[];
  subjects: any[];
  onViewStudent: (student: any) => void;
  classInfo: string;
}

const StatusPill: React.FC<{ status: string }> = ({ status }) => (
  <span
    style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
      fontFamily: FONT.sans,
      letterSpacing: "0.03em",
      background: status === "Active" || status === "active" ? C.successBg : C.dangerBg,
      color: status === "Active" || status === "active" ? C.successText : C.dangerText,
    }}
  >
    {status}
  </span>
);

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

export const StudentRecords: React.FC<StudentRecordsProps> = ({
  students,
  subjects,
  onViewStudent,
  classInfo
}) => {
  const [search, setSearch] = useState("");
  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.admissionNo && s.admissionNo.includes(search)),
  );

  return (
    <div className="ct-anim">
      <SectionHeader
        eyebrow="Roster"
        title="Student records"
        sub={`${classInfo} · ${students.length} learners enrolled`}
        action={
          <div style={{ display: "flex", gap: 10 }}>
            <input
              className="ct-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or ID…"
              style={{
                padding: "9px 14px",
                border: `1.5px solid ${C.border}`,
                borderRadius: 9,
                fontFamily: FONT.sans,
                fontSize: 13,
                color: C.text,
                background: C.cream,
                width: 220,
                transition: "all 0.2s",
              }}
            />
          </div>
        }
      />
      <div
        style={{
          background: C.white,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          overflowX: "auto",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: C.sand }}>
              {[
                "Student",
                "Adm. No",
                "Status",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "11px 14px",
                    textAlign: "left",
                    fontFamily: FONT.sans,
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.textMuted,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
              {subjects && subjects.map(s => (
                <th
                  key={s.id}
                  style={{
                    padding: "11px 14px",
                    textAlign: "center",
                    fontFamily: FONT.sans,
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.textMuted,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                  title={s.name}
                >
                  {s.name.substring(0, 3)}
                </th>
              ))}
              {[
                "Avg",
                "Action",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "11px 14px",
                    textAlign: h === "Avg" ? "center" : "left",
                    fontFamily: FONT.sans,
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.textMuted,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const a = s.marks ? avg(s.marks) : 0;
              return (
                <tr
                  key={s.id}
                  className="ct-row"
                  style={{
                    borderTop: `1px solid ${C.borderLight}`,
                    cursor: "pointer",
                  }}
                  onClick={() => onViewStudent(s)}
                >
                  <td style={{ padding: "12px 14px" }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <Avatar name={s.name} size={32} />
                      <span
                        style={{
                          fontFamily: FONT.sans,
                          fontSize: 13.5,
                          fontWeight: 600,
                          color: C.text,
                        }}
                      >
                        {s.name}
                      </span>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      fontFamily: FONT.sans,
                      fontSize: 12.5,
                      color: C.textMuted,
                    }}
                  >
                    {s.admissionNo}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <StatusPill status={s.status} />
                  </td>
                  {subjects && subjects.map(sub => {
                    const mark = s.marks ? s.marks[sub.id] : null;
                    return (
                      <td key={sub.id} style={{ 
                        padding: "12px 14px",
                        textAlign: "center",
                        fontFamily: FONT.sans,
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: mark != null ? gradeColor(mark) : C.textMuted
                      }}>
                        {mark != null ? `${mark}%` : "-"}
                      </td>
                    );
                  })}
                  <td style={{ padding: "12px 14px", textAlign: "center" }}>
                    <span
                      style={{
                        fontFamily: FONT.serif,
                        fontSize: 16,
                        fontWeight: 600,
                        color: gradeColor(a),
                      }}
                    >
                      {a}%
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <button
                      className="ct-pill"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewStudent(s);
                      }}
                      style={{
                        padding: "5px 13px",
                        background: "transparent",
                        border: `1px solid ${C.border}`,
                        borderRadius: 20,
                        fontFamily: FONT.sans,
                        fontSize: 12,
                        fontWeight: 600,
                        color: C.textMuted,
                        cursor: "pointer",
                        transition: "all 0.18s",
                      }}
                    >
                      View
                    </button>
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
