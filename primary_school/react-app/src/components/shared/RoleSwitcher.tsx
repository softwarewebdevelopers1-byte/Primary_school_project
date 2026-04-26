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
  
  // Robustly extract roles array
  let roles: string[] = [];
  if (user?.roles) {
    if (Array.isArray(user.roles)) {
      roles = user.roles;
    } else {
      // Handle object format { role1, role2, role3 }
      roles = [user.roles.role1, user.roles.role2, user.roles.role3].filter(Boolean);
    }
  }
  
  // Also include discriminator if not already present
  if (user?.__t && !roles.includes(user.__t)) {
    roles.push(user.__t);
  }
  if (user?.role && !roles.includes(user.role)) {
    roles.push(user.role);
  }

  // Remove duplicates
  roles = Array.from(new Set(roles));

  if (roles.length <= 1) return null;

  const currentPath = window.location.pathname;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", padding: "4px 8px", background: "var(--sand)", borderRadius: "12px", border: "1px solid var(--border)" }}>
      <span style={{ fontSize: "10px", fontWeight: 800, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Switch:</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
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
    </div>
  );
};
