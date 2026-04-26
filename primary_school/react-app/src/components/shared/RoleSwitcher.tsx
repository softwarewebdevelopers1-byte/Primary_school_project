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
    <div style={{ position: "relative", display: "inline-block" }}>
      <select
        value={currentPath}
        onChange={(e) => {
          const path = e.target.value;
          if (path) navigate(path);
        }}
        style={{
          padding: "6px 12px",
          borderRadius: 8,
          border: "1px solid var(--border)",
          background: "var(--white)",
          color: "var(--text)",
          fontSize: "12px",
          fontWeight: 600,
          cursor: "pointer",
          outline: "none",
          appearance: "none",
          WebkitAppearance: "none",
          paddingRight: "28px",
          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 8px center",
          backgroundSize: "14px",
        }}
      >
        <option disabled>Switch Role</option>
        {roles.map((r: string) => (
          <option key={r} value={rolePaths[r]}>
            {roleLabels[r] || r}
          </option>
        ))}
      </select>
    </div>
  );
};
