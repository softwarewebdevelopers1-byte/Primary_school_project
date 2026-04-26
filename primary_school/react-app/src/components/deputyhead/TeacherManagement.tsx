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
  const [search, setSearch] = useState("");
  const filtered = staff.filter(
    (t) =>
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.department?.toLowerCase().includes(search.toLowerCase()),
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
    </div>
  );
};
