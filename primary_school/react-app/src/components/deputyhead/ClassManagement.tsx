// components/deputyhead/ClassManagement.tsx
import React from "react";
import { SectionHeader } from "./shared/SectionHeader";
import { C, F } from "./shared/constants";
import { CLASSES } from "./shared/data";
import { gc } from "./shared/helpers";

export const ClassManagement: React.FC = () => (
  <div className="dh-anim">
    <SectionHeader
      eyebrow="Classes"
      title="Class management"
      sub={`${CLASSES.length} streams · Grades 7–9 · Term 1, 2024`}
    />
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
        gap: 14,
      }}
    >
      {CLASSES.map((c) => (
        <div
          key={c.id}
          className="dh-card"
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            borderRadius: 13,
            padding: "1.3rem",
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
  </div>
);
