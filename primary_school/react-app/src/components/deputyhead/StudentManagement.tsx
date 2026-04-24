// components/deputyhead/StudentManagement.tsx
import React, { useState } from "react";
import { SectionHeader } from "./shared/SectionHeader";
import { Avatar } from "./shared/Avatar";
import { C, F } from "./shared/constants";
import { STUDENTS } from "./shared/data";
import { gc } from "./shared/helpers";

export const StudentManagement: React.FC = () => {
  const [search, setSearch] = useState("");
  const filtered = STUDENTS.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.class.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="dh-anim">
      <SectionHeader
        eyebrow="Learners"
        title="Student management"
        sub={`${STUDENTS.length} student records · schoolwide view`}
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
                  {s.adm}
                </td>
                <td
                  style={{
                    padding: "11px 14px",
                    fontFamily: F.sans,
                    fontSize: 13,
                    color: C.textMid,
                  }}
                >
                  {s.class}
                </td>
                <td
                  style={{
                    padding: "11px 14px",
                    fontFamily: F.sans,
                    fontSize: 13,
                    color: C.textMuted,
                  }}
                >
                  {s.gender}
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
                        s.status === "Active" ? C.successBg : C.dangerBg,
                      color:
                        s.status === "Active" ? C.successText : C.dangerText,
                    }}
                  >
                    {s.status}
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
                          width: `${s.avg}%`,
                          height: "100%",
                          background: gc(s.avg),
                          borderRadius: 3,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontFamily: F.serif,
                        fontSize: 15,
                        fontWeight: 600,
                        color: gc(s.avg),
                      }}
                    >
                      {s.avg}%
                    </span>
                  </div>
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
