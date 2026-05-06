import React from "react";
import { useNavigate } from "react-router-dom";
import { ChangePassword } from "./ChangePassword";

const dashboardPaths: Record<string, string> = {
  superadmin: "/admin",
  admin: "/admin",
  headteacher: "/headteacher",
  deputyteacher: "/deputyHead",
  classteacher: "/classTeacher",
  subjectteacher: "/subjectTeacher",
  student: "/students",
};

const getReturnPath = () => {
  try {
    const saved = JSON.parse(localStorage.getItem("user") || "{}");
    const role = saved?.user?.primaryRole || saved?.primaryRole;
    return dashboardPaths[role] || "/admin";
  } catch {
    return "/admin";
  }
};

export const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const returnPath = getReturnPath();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--sand, #f4efe6)",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <section
        style={{
          width: "min(100%, 520px)",
          background: "var(--cream, #fffaf1)",
          border: "1px solid var(--border, #e4d8c4)",
          borderRadius: 8,
          boxShadow: "0 18px 48px rgba(11, 32, 24, 0.12)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "18px 22px",
            borderBottom: "1px solid var(--border, #e4d8c4)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 700,
                color: "var(--gold, #b98a31)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Account Security
            </p>
            <h1
              style={{
                margin: "3px 0 0",
                fontFamily: "var(--serif)",
                fontSize: "1.4rem",
                color: "var(--text, #163326)",
              }}
            >
              Update Password
            </h1>
          </div>
          <button
            type="button"
            onClick={() => navigate(returnPath)}
            style={{
              padding: "9px 13px",
              borderRadius: 8,
              border: "1px solid var(--border, #e4d8c4)",
              background: "var(--white, #fff)",
              color: "var(--text, #163326)",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Back
          </button>
        </div>
        <ChangePassword onClose={() => navigate(returnPath)} />
      </section>
    </main>
  );
};

