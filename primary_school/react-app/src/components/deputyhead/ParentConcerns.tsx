// components/deputyhead/ParentConcerns.tsx
import React, { useState } from "react";
import { SectionHeader } from "./shared/SectionHeader";
import { Avatar } from "./shared/Avatar";
import { C, F } from "./shared/constants";
import { CONCERNS } from "./shared/data";
import { pColor, sColor } from "./shared/helpers";

export const ParentConcerns: React.FC = () => {
  const [filter, setFilter] = useState("All");
  const items =
    filter === "All" ? CONCERNS : CONCERNS.filter((c) => c.status === filter);
  const openCount = CONCERNS.filter((c) => c.status === "Open").length;
  const pendingCount = CONCERNS.filter((c) => c.status === "Pending").length;

  return (
    <div className="dh-anim">
      <SectionHeader
        eyebrow="Welfare"
        title="Parent concerns"
        sub={`${CONCERNS.length} total · ${openCount} open · ${pendingCount} pending`}
        action={
          <div style={{ display: "flex", gap: 6 }}>
            {["All", "Open", "Pending", "Resolved"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "7px 13px",
                  background: filter === f ? C.gold : C.sand,
                  color: filter === f ? "#fff" : C.textMid,
                  border: `1px solid ${filter === f ? C.gold : C.border}`,
                  borderRadius: 20,
                  fontFamily: F.sans,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all .18s",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        }
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((c) => {
          const pc = pColor(c.priority);
          const sc = sColor(c.status);
          return (
            <div
              key={c.id}
              style={{
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 13,
                padding: "1.2rem 1.4rem",
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
              }}
            >
              <Avatar name={c.parent} size={38} />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: 5,
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontFamily: F.sans,
                        fontSize: 13.5,
                        fontWeight: 700,
                        color: C.text,
                        margin: "0 0 2px",
                      }}
                    >
                      {c.parent}
                    </p>
                    <p
                      style={{
                        fontFamily: F.sans,
                        fontSize: 12,
                        color: C.textMuted,
                        margin: 0,
                      }}
                    >
                      Re: {c.student} · {c.class}
                    </p>
                  </div>
                  <div
                    style={{ display: "flex", gap: 7, alignItems: "center" }}
                  >
                    <span
                      style={{
                        padding: "2px 9px",
                        borderRadius: 10,
                        fontSize: 10,
                        fontWeight: 700,
                        background: pc.bg,
                        color: pc.text,
                      }}
                    >
                      {c.priority}
                    </span>
                    <span
                      style={{
                        padding: "2px 9px",
                        borderRadius: 10,
                        fontSize: 10,
                        fontWeight: 700,
                        background: sc.bg,
                        color: sc.text,
                      }}
                    >
                      {c.status}
                    </span>
                    <span
                      style={{
                        fontFamily: F.sans,
                        fontSize: 11,
                        color: C.textFaint,
                      }}
                    >
                      {c.date}
                    </span>
                  </div>
                </div>
                <p
                  style={{
                    fontFamily: F.sans,
                    fontSize: 13,
                    color: C.textMid,
                    margin: "0 0 10px",
                    lineHeight: 1.55,
                  }}
                >
                  {c.issue}
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="dh-pbtn"
                    style={{
                      padding: "6px 14px",
                      background: C.gold,
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      fontFamily: F.sans,
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all .22s",
                    }}
                  >
                    Respond
                  </button>
                  <button
                    className="dh-gbtn"
                    style={{
                      padding: "6px 14px",
                      background: C.sand,
                      color: C.textMid,
                      border: `1px solid ${C.border}`,
                      borderRadius: 8,
                      fontFamily: F.sans,
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "background .15s",
                    }}
                  >
                    Mark resolved
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
