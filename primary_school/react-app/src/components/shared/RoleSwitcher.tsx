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
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  
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

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (roles.length <= 1) return null;

  const currentPath = window.location.pathname;
  const currentRole = roles.find(r => rolePaths[r]?.toLowerCase() === currentPath.toLowerCase()) || roles[0];

  return (
    <div ref={dropdownRef} style={{ position: "relative", zIndex: 100 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 14px",
          borderRadius: 8,
          border: "1.5px solid var(--gold)",
          background: "var(--white)",
          color: "var(--text)",
          fontSize: "12px",
          fontWeight: 700,
          cursor: "pointer",
          transition: "all 0.2s ease",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          whiteSpace: "nowrap"
        }}
      >
        <span style={{ color: "var(--gold)", fontSize: "10px", fontWeight: 800 }}>DASHBOARD:</span>
        {roleLabels[currentRole] || currentRole}
        <svg 
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div style={{
          position: "absolute",
          top: "120%",
          right: 0,
          background: "#fff",
          border: "1px solid var(--border)",
          borderRadius: 10,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          padding: "6px",
          minWidth: "180px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          animation: "scaleIn 0.2s ease-out"
        }}>
          {roles.map((r: string) => {
            const path = rolePaths[r];
            if (!path) return null;
            const isActive = currentPath.toLowerCase() === path.toLowerCase();
            
            return (
              <button
                key={r}
                onClick={() => {
                  navigate(path);
                  setIsOpen(false);
                }}
                style={{
                  padding: "10px 12px",
                  borderRadius: 6,
                  border: "none",
                  background: isActive ? "var(--sand)" : "transparent",
                  color: isActive ? "var(--gold)" : "var(--text)",
                  textAlign: "left",
                  fontSize: "12.5px",
                  fontWeight: isActive ? 700 : 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                {roleLabels[r] || r}
                {isActive && (
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold)" }} />
                )}
              </button>
            );
          })}
        </div>
      )}
      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};
