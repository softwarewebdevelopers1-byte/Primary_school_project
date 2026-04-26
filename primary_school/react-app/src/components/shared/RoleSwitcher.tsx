import React from "react";
import { useNavigate } from "react-router-dom";

interface RoleSwitcherProps {
  user: any;
}

const rolePaths: Record<string, string> = {
  admin: "/admin",
  superadmin: "/admin",
  headteacher: "/headteacher",
  deputyteacher: "/deputyHead",
  classteacher: "/classTeacher",
  subjectteacher: "/subjectTeacher",
  student: "/students",
};

const roleLabels: Record<string, string> = {
  admin: "Admin",
  superadmin: "Super Admin",
  headteacher: "Head Teacher",
  deputyteacher: "Deputy Head",
  classteacher: "Class Teacher",
  subjectteacher: "Subject Teacher",
  student: "Student",
};

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ user }) => {
  const navigate = useNavigate();
  const roles = user?.roles || [];

  if (roles.length <= 1) return null;

  const currentPath = window.location.pathname;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      {roles.map((r: string) => {
        const path = rolePaths[r];
        if (!path) return null;
        const isActive = currentPath.toLowerCase() === path.toLowerCase();
        
        return (
          <button
            key={r}
            onClick={() => navigate(path)}
            style={{
              padding: "6px 12px",
              borderRadius: 20,
              border: isActive ? "2px solid var(--gold)" : "1px solid var(--border)",
              background: isActive ? "var(--gold)" : "var(--white)",
              color: isActive ? "#fff" : "var(--text)",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: isActive ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
              whiteSpace: "nowrap"
            }}
          >
            {roleLabels[r] || r}
          </button>
        );
      })}
    </div>
  );
};
