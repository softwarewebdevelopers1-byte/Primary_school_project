// components/deputyhead/ParentConcerns.tsx
import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Avatar } from "./shared/Avatar";
import { C, F } from "./shared/constants";
import { pColor, sColor } from "./shared/helpers";
import { SectionHeader } from "./shared/SectionHeader";

type ParentConcern = {
  id: string;
  parent: string;
  parentPhone: string;
  student: string;
  admissionNo: string;
  class: string;
  issue: string;
  date: string;
  status: "Open" | "Pending" | "Resolved";
  priority: "Low" | "Medium" | "High";
  expiresAt?: string;
};

export const ParentConcerns: React.FC = () => {
  const [filter, setFilter] = useState("All");
  const [concerns, setConcerns] = useState<ParentConcern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const items =
    filter === "All" ? concerns : concerns.filter((c) => c.status === filter);
  const openCount = concerns.filter((c) => c.status === "Open").length;
  const pendingCount = concerns.filter((c) => c.status === "Pending").length;

  const loadConcerns = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await api.get<ParentConcern[]>("/users/parent-concerns");
      setConcerns(data);
    } catch (err: any) {
      setError(err.message || "Unable to load parent concerns.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConcerns();
  }, []);

  const updateStatus = async (id: string, status: ParentConcern["status"]) => {
    try {
      setError("");
      await api.put(`/users/parent-concerns/${id}/status`, { status });
      setConcerns((current) =>
        current.map((concern) =>
          concern.id === id ? { ...concern, status } : concern,
        ),
      );
    } catch (err: any) {
      setError(err.message || "Unable to update concern status.");
    }
  };

  return (
    <div className="dh-anim">
      <SectionHeader
        eyebrow="Welfare"
        title="Parent concerns"
        sub={`${concerns.length} total - ${openCount} open - ${pendingCount} pending`}
        action={
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
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

      {error && (
        <div
          style={{
            background: "#fdeaea",
            border: "1px solid #e8b1b1",
            borderRadius: 10,
            color: "#a32d2d",
            fontFamily: F.sans,
            fontSize: 13,
            marginBottom: 12,
            padding: "10px 12px",
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 24, textAlign: "center", color: C.textMuted }}>
          Loading parent concerns...
        </div>
      ) : items.length === 0 ? (
        <div
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 13,
            color: C.textMuted,
            fontFamily: F.sans,
            padding: "1.4rem",
            textAlign: "center",
          }}
        >
          No parent concerns found for this filter.
        </div>
      ) : (
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
                <div style={{ flex: 1, minWidth: 0 }}>
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
                        Re: {c.student} - {c.class}
                      </p>
                      {c.parentPhone && (
                        <p
                          style={{
                            fontFamily: F.sans,
                            fontSize: 11.5,
                            color: C.textFaint,
                            margin: "3px 0 0",
                          }}
                        >
                          {c.parentPhone}
                        </p>
                      )}
                    </div>
                    <div
                      style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}
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
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {c.issue}
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      className="dh-pbtn"
                      onClick={() => updateStatus(c.id, "Pending")}
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
                      Mark pending
                    </button>
                    <button
                      className="dh-gbtn"
                      onClick={() => updateStatus(c.id, "Resolved")}
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
      )}
    </div>
  );
};
