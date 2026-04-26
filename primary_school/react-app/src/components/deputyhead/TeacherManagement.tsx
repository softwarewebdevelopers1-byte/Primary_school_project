// components/deputyhead/TeacherManagement.tsx (continued)
import React, { useState } from "react";
import { SectionHeader } from "./shared/SectionHeader";
import { Avatar } from "./shared/Avatar";
import { C, F } from "./shared/constants";
import { gc } from "./shared/helpers";

interface TeacherManagementProps {
  staff?: any[];
}

export const TeacherManagement: React.FC<TeacherManagementProps> = ({ staff = [] }) => {
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [search, setSearch] = useState("");
  const filtered = staff.filter(
    (t) =>
      (t.name || t.teachersName || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.department || "").toLowerCase().includes(search.toLowerCase()),
  );
  const activeCount = staff.filter((t) => t.status === "active" || t.status === "Active").length;

  return (
    <div className="dh-anim">
      <SectionHeader
        eyebrow="Staff"
        title="Teacher management"
        sub={`${staff.length} teachers on record · ${activeCount} currently active`}
        action={
          <input
            className="dh-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or department…"
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
                "Teacher",
                "Department",
                "Class",
                "Students",
                "Status",
                "Class avg",
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
            {filtered.map((t) => (
              <tr
                key={t.id}
                className="dh-row"
                style={{ borderTop: `1px solid ${C.borderLight}` }}
              >
                <td style={{ padding: "11px 14px" }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 9 }}
                  >
                    <Avatar name={t.name} size={30} />
                    <span
                      style={{
                        fontFamily: F.sans,
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: C.text,
                      }}
                    >
                      {t.name}
                    </span>
                  </div>
                </td>
                <td
                  style={{
                    padding: "11px 14px",
                    fontFamily: F.sans,
                    fontSize: 13,
                    color: C.textMid,
                  }}
                >
                  {t.department || "General"}
                </td>
                <td
                  style={{
                    padding: "11px 14px",
                    fontFamily: F.sans,
                    fontSize: 13,
                    color: C.textMuted,
                  }}
                >
                  {t.classGrade ? `Grade ${t.classGrade}${t.classStream || ""}` : "None"}
                </td>
                <td
                  style={{
                    padding: "11px 14px",
                    fontFamily: F.serif,
                    fontSize: 16,
                    fontWeight: 600,
                    color: C.text,
                  }}
                >
                  {t.subjects?.length || 0} subjects
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
                        t.status === "active" || t.status === "Active" ? C.successBg : C.warnBg,
                      color: t.status === "active" || t.status === "Active" ? C.successText : C.warnText,
                    }}
                  >
                    {t.status || "Active"}
                  </span>
                </td>
                <td style={{ padding: "11px 14px" }}>
                  <span
                    style={{
                      fontFamily: F.serif,
                      fontSize: 16,
                      fontWeight: 600,
                      color: gc(75),
                    }}
                  >
                    -
                  </span>
                </td>
                <td style={{ padding: "11px 14px" }}>
                  <button
                    className="dh-pill"
                    onClick={() => setSelectedTeacher(t)}
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

    {selectedTeacher && (
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
        onClick={() => setSelectedTeacher(null)}
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
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar name={selectedTeacher.name} size={40} />
                <div>
                  <h2 style={{ margin: 0, fontFamily: F.serif, fontSize: 22, color: C.text }}>{selectedTeacher.name}</h2>
                  <p style={{ margin: 0, fontFamily: F.sans, fontSize: 13, color: C.textMid }}>{selectedTeacher.roleLabel}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTeacher(null)}
                style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: C.textMuted }}
              >
                ×
              </button>
            </div>
          </div>
          <div style={{ padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <p style={{ margin: "0 0 4px", fontFamily: F.sans, fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>Contact Info</p>
              <p style={{ margin: 0, fontFamily: F.sans, fontSize: 14, color: C.text }}><strong>Email:</strong> {selectedTeacher.email || "N/A"}</p>
              <p style={{ margin: "4px 0 0", fontFamily: F.sans, fontSize: 14, color: C.text }}><strong>Phone:</strong> {selectedTeacher.phone || "N/A"}</p>
            </div>
            <div>
              <p style={{ margin: "0 0 4px", fontFamily: F.sans, fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>Assignment</p>
              <p style={{ margin: 0, fontFamily: F.sans, fontSize: 14, color: C.text }}><strong>Department:</strong> {selectedTeacher.department || "General"}</p>
              <p style={{ margin: "4px 0 0", fontFamily: F.sans, fontSize: 14, color: C.text }}><strong>Class:</strong> {selectedTeacher.classGrade ? `Grade ${selectedTeacher.classGrade}${selectedTeacher.classStream || ""}` : "None"}</p>
            </div>
            <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", padding: 16, background: C.cream, borderRadius: 8 }}>
              <span style={{ fontFamily: F.sans, fontSize: 14, fontWeight: 600, color: C.textMid }}>Status</span>
              <span style={{ 
                fontFamily: F.sans, 
                fontSize: 14, 
                fontWeight: 700, 
                color: selectedTeacher.status === "active" || selectedTeacher.status === "Active" ? C.successText : C.warnText 
              }}>
                {selectedTeacher.status || "Active"}
              </span>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
  );
};
