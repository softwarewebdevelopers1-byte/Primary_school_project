// components/deputyhead/StudentManagement.tsx
import React, { useState } from "react";
import { SectionHeader } from "./shared/SectionHeader";
import { Avatar } from "./shared/Avatar";
import { C, F } from "./shared/constants";
import { gc, avg } from "./shared/helpers";

interface StudentManagementProps {
  students?: any[];
  subjects?: any[];
}

export const StudentManagement: React.FC<StudentManagementProps> = ({ students = [], subjects = [] }) => {
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [search, setSearch] = useState("");
  const filtered = students.filter(
    (s) =>
      (s.name || s.studentsName || "").toLowerCase().includes(search.toLowerCase()) ||
      String(s.classGrade || "").toLowerCase().includes(search.toLowerCase()) ||
      String(s.classStream || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="dh-anim">
      <SectionHeader
        eyebrow="Learners"
        title="Student management"
        sub={`${students.length} student records · schoolwide view`}
        action={
          <input
            className="dh-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or class…"
            style={{
              padding: "9px 14px",
              border: `1.5px solid ${C.border}`,
              borderRadius: 9,
              fontFamily: F.sans,
              fontSize: 13,
              color: C.text,
              background: C.cream,
              width: 220,
              transition: "all .2s",
            }}
          />
        }
      />
      <div
        style={{
          background: C.white,
          border: `1px solid ${C.border}`,
          borderRadius: 13,
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: C.sand }}>
              {[
                "Student",
                "Adm. No",
                "Class",
                "Gender",
                "Status",
                "Average",
                "",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 14px",
                    textAlign: "left",
                    fontFamily: F.sans,
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: C.textMuted,
                    letterSpacing: ".06em",
                    textTransform: "uppercase",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr
                key={s.id}
                className="dh-row"
                style={{ borderTop: `1px solid ${C.borderLight}` }}
              >
                <td style={{ padding: "11px 14px" }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 9 }}
                  >
                    <Avatar name={s.name} size={30} />
                    <span
                      style={{
                        fontFamily: F.sans,
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
                    padding: "11px 14px",
                    fontFamily: F.sans,
                    fontSize: 12.5,
                    color: C.textMuted,
                  }}
                >
                  {s.admissionNo || s.adm || "-"}
                </td>
                <td
                  style={{
                    padding: "11px 14px",
                    fontFamily: F.sans,
                    fontSize: 13,
                    color: C.textMid,
                  }}
                >
                  Grade {s.classGrade}{s.classStream || ""}
                </td>
                <td
                  style={{
                    padding: "11px 14px",
                    fontFamily: F.sans,
                    fontSize: 13,
                    color: C.textMuted,
                  }}
                >
                  {s.gender || "N/A"}
                </td>
                <td style={{ padding: "11px 14px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "3px 10px",
                      borderRadius: 20,
                      fontSize: 10.5,
                      fontWeight: 700,
                      background:
                        s.status === "active" || s.status === "Active" ? C.successBg : C.dangerBg,
                      color:
                        s.status === "active" || s.status === "Active" ? C.successText : C.dangerText,
                    }}
                  >
                    {s.status || "Active"}
                  </span>
                </td>
                <td style={{ padding: "11px 14px" }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <div
                      style={{
                        width: 60,
                        height: 6,
                        background: C.sand,
                        borderRadius: 3,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${avg(s.marks || {})}%`,
                          height: "100%",
                          background: gc(avg(s.marks || {})),
                          borderRadius: 3,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontFamily: F.serif,
                        fontSize: 15,
                        fontWeight: 600,
                        color: gc(avg(s.marks || {})),
                      }}
                    >
                      {avg(s.marks || {})}%
                    </span>
                  </div>
                </td>
                <td style={{ padding: "11px 14px" }}>
                  <button
                    className="dh-pill"
                    onClick={() => setSelectedStudent(s)}
                    style={{
                      padding: "4px 12px",
                      background: "transparent",
                      border: `1px solid ${C.border}`,
                      borderRadius: 20,
                      fontFamily: F.sans,
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: C.textMuted,
                      cursor: "pointer",
                      transition: "all .18s",
                    }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedStudent && (
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
          onClick={() => setSelectedStudent(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: C.white,
              borderRadius: 16,
              width: "100%",
              maxWidth: 500,
              maxHeight: "85vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ padding: "24px 24px 16px", borderBottom: `1px solid ${C.borderLight}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <h2 style={{ margin: 0, fontFamily: F.serif, fontSize: 24, color: C.text }}>{selectedStudent.name}</h2>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: C.textMuted }}
                >
                  ×
                </button>
              </div>
              <p style={{ margin: 0, fontFamily: F.sans, fontSize: 14, color: C.textMid }}>
                <strong>Adm No:</strong> {selectedStudent.admissionNo || selectedStudent.adm || "-"} | <strong>Class:</strong> Grade {selectedStudent.classGrade}{selectedStudent.classStream || ""}
              </p>
            </div>
            <div style={{ padding: 24, overflowY: "auto" }}>
              <h4 style={{ margin: "0 0 12px", fontFamily: F.sans, color: C.text }}>Subject Performance</h4>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: C.sand, textAlign: "left" }}>
                    <th style={{ padding: "8px 12px", fontFamily: F.sans, fontSize: 12, color: C.textMuted }}>Subject</th>
                    <th style={{ padding: "8px 12px", fontFamily: F.sans, fontSize: 12, color: C.textMuted }}>Score (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((sub, i) => {
                    const mark = (selectedStudent.marks || {})[sub.id];
                    return (
                      <tr key={sub.id || i} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                        <td style={{ padding: "10px 12px", fontFamily: F.sans, fontSize: 13, color: C.text }}>{sub.name}</td>
                        <td style={{ padding: "10px 12px", fontFamily: F.serif, fontSize: 13, fontWeight: 600, color: mark != null ? gc(mark) : C.textMid }}>
                          {mark != null ? mark : "-"}
                        </td>
                      </tr>
                    );
                  })}
                  {subjects.length === 0 && (
                    <tr>
                      <td colSpan={2} style={{ padding: 20, textAlign: "center", color: C.textMuted, fontFamily: F.sans }}>No subjects loaded.</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", padding: 16, background: C.cream, borderRadius: 8 }}>
                <span style={{ fontFamily: F.sans, fontSize: 14, fontWeight: 600, color: C.textMid }}>Average Score</span>
                <span style={{ fontFamily: F.serif, fontSize: 18, fontWeight: 700, color: gc(avg(selectedStudent.marks || {})) }}>
                  {avg(selectedStudent.marks || {})}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
