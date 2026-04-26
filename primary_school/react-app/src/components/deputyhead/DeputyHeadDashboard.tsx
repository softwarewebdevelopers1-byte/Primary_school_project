// components/deputyhead/DeputyHeadDashboard.tsx
import { useEffect, useState } from "react";
import { GlobalStyles } from "./shared/GlobalStyles";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { SchoolOverview } from "./SchoolOverview";
import { TeacherManagement } from "./TeacherManagement";
import { ClassManagement } from "./ClassManagement";
import { StudentManagement } from "./StudentManagement";
import { Analytics } from "./Analytics";
import { Reports } from "./Reports";
import { ParentConcerns } from "./ParentConcerns";
import { C, F } from "./shared/constants";
import { NAV_ALL } from "./shared/data";
import { useDashboardTheme } from "../../lib/useDashboardTheme";
import { api } from "../../lib/api";

export type UserRoleType = "deputy" | "headteacher";

interface DeputyHeadDashboardProps {
  userRole?: UserRoleType;
}

export default function DeputyHeadDashboard({
  userRole = "deputy",
}: DeputyHeadDashboardProps) {
  const [tab, setTab] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 900);
  const [roleToggle, setRoleToggle] = useState<UserRoleType>(userRole);
  const { theme, toggleTheme } = useDashboardTheme();

  const [students, setStudents] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data: any = await api.get("/users");
      setStudents(data.students || []);
      setStaff(data.staff || []);
      setSubjects(data.subjects || []);
      setAssignments(data.assignments || []);
      
      // Derive classes from students and assignments
      const classMap = new Map();
      (data.students || []).forEach((s: any) => {
        if (!s.classGrade) return;
        const key = `${s.classGrade}${s.classStream || ""}`;
        if (!classMap.has(key)) {
          classMap.set(key, {
            id: key,
            name: `Grade ${s.classGrade} ${s.classStream || ""}`.trim(),
            grade: s.classGrade,
            stream: s.classStream,
            students: 0,
            subjects: 0,
            avg: 0,
            term: 1,
            teacher: "Unassigned",
          });
        }
        classMap.get(key).students += 1;
      });

      // Find class teachers from staff
      (data.staff || []).forEach((t: any) => {
        if (
          (t.roleLabel?.toLowerCase() === "classteacher" || t.role === "classTeacher") &&
          t.classGrade
        ) {
          const key = `${t.classGrade}${t.classStream || ""}`;
          if (classMap.has(key)) {
            classMap.get(key).teacher = t.name;
          }
        }
      });

      // Count subjects per class from assignments
      (data.assignments || []).forEach((a: any) => {
        const key = `${a.classGrade}${a.classStream || ""}`;
        if (classMap.has(key)) {
          classMap.get(key).subjects += 1;
        }
      });

      setClasses(Array.from(classMap.values()));
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setCollapsed(false);
    } else {
      setMobileMenuOpen(false);
    }
  }, [isMobile]);

  const isHT = roleToggle === "headteacher";
  const user = {
    name: isHT ? "Mr. John Mwangi" : "Mrs. Jane Wanjiku",
    role: isHT ? "Head Teacher" : "Deputy Head Teacher",
  };

  const nav = NAV_ALL.filter((n) => n.roles.includes(roleToggle));
  const active = nav.find((n) => n.id === tab) || nav[0];
  const date = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleRoleToggle = (role: UserRoleType) => {
    setRoleToggle(role);
    setTab("overview");
    setMobileMenuOpen(false);
  };

  const handleSelectTab = (nextTab: string) => {
    setTab(nextTab);
    setMobileMenuOpen(false);
  };

  const renderContent = () => {
    if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading dashboard...</div>;

    switch (tab) {
      case "overview":
        return <SchoolOverview isHT={isHT} classes={classes} students={students} staff={staff} />;
      case "teachers":
        return <TeacherManagement staff={staff} />;
      case "classes":
        return <ClassManagement classes={classes} students={students} staff={staff} />;
      case "students":
        return <StudentManagement students={students} subjects={subjects} />;
      case "analytics":
        return <Analytics />;
      case "reports":
        return <Reports />;
      case "concerns":
        return <ParentConcerns />;
      default:
        return null;
    }
  };

  return (
    <>
      <GlobalStyles />
      {mobileMenuOpen && (
        <div
          className="dh-mobileOverlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <div
        className="dh-dashboardShell"
        data-theme={theme}
        style={{
          display: "flex",
          height: "100vh",
          fontFamily: F.sans,
          background: C.sand,
          overflow: "hidden",
        }}
      >
        <Sidebar
          navItems={nav}
          activeTab={tab}
          collapsed={isMobile ? false : collapsed}
          mobileOpen={mobileMenuOpen}
          isMobile={isMobile}
          roleToggle={roleToggle}
          onToggleCollapse={() => {
            if (isMobile) {
              setMobileMenuOpen(false);
              return;
            }
            setCollapsed(!collapsed);
          }}
          onSelectTab={handleSelectTab}
          onRoleToggle={handleRoleToggle}
          userName={user.name}
          userRole={user.role}
          onLogout={handleLogout}
        />

        <div
          className="dh-mainPanel"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          <TopBar
            activeLabel={active.label}
            userName={user.name}
            userRole={user.role}
            date={date}
            isMobile={isMobile}
            onOpenMenu={() => setMobileMenuOpen(true)}
            theme={theme}
            onToggleTheme={toggleTheme}
            onLogout={handleLogout}
          />

          {/* Hero — only on overview */}
          {tab === "overview" && (
            <div
              style={{
                background: C.green,
                padding: "20px 22px",
                flexShrink: 0,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <svg
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  opacity: 0.05,
                  pointerEvents: "none",
                }}
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern
                    id="dhg"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke="#c9963d"
                      strokeWidth=".8"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dhg)" />
              </svg>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 14,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: F.sans,
                      fontSize: 10,
                      fontWeight: 700,
                      color: C.gold,
                      textTransform: "uppercase",
                      letterSpacing: ".09em",
                      margin: "0 0 4px",
                    }}
                  >
                    School operations
                  </p>
                  <h1
                    style={{
                      fontFamily: F.serif,
                      fontSize: "1.55rem",
                      fontWeight: 600,
                      color: "#fdf9f2",
                      margin: "0 0 5px",
                      letterSpacing: "-.01em",
                      lineHeight: 1.2,
                    }}
                  >
                    Lead with a calmer, clearer view of school performance.
                  </h1>
                  <p
                    style={{
                      fontFamily: F.sans,
                      fontSize: 12.5,
                      color: "#9eb8aa",
                      margin: 0,
                    }}
                  >
                    {classes.length} streams · {staff.length} teachers ·{" "}
                    {isHT ? "Full" : "Deputy"} access active
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    { l: "Staff", t: "teachers" },
                    { l: "Analytics", t: "analytics" },
                    { l: "Concerns", t: "concerns" },
                  ].map(({ l, t }) => (
                    <button
                      key={t}
                      onClick={() => handleSelectTab(t)}
                      className="dh-hbtn"
                      style={{
                        padding: "8px 14px",
                        background: "rgba(201,150,61,.15)",
                        border: "1px solid rgba(201,150,61,.3)",
                        borderRadius: 8,
                        fontFamily: F.sans,
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: "#e8dcc8",
                        cursor: "pointer",
                        transition: "background .18s",
                      }}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div
            className="dh-contentArea"
            style={{ flex: 1, overflowY: "auto", padding: "22px" }}
          >
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
}
