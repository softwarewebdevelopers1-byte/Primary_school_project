// components/classteacher/ClassTeacherDashboard.tsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { GlobalStyles } from "./shared/GlobalStyles";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { StudentRecords } from "./StudentRecords";
import { StudentDetails } from "./StudentDetails";
import { MarksManagement } from "./MarksManagement";
import { ResultsReports } from "./ResultsReports";
import { Analytics } from "./Analytics";
import { Settings } from "./Settings";
import { SubjectAssignments } from "./SubjectAssignments";
import { ArchivesView } from "../shared/ArchivesView";
import {
  UsersIcon,
  MarkIcon,
  FileIcon,
  BarIcon,
  SettIcon,
  HomeIcon,
  ArchiveIcon,
} from "./shared/Icons";
import { C, FONT } from "./shared/constants";
import { useDashboardTheme } from "../../lib/useDashboardTheme";
import { api } from "../../lib/api";

const NAV = [
  { id: "students", label: "Student records", desc: "Rosters, contacts, and learner profiles.", Icon: UsersIcon },
  { id: "marks", label: "Marks management", desc: "Capture marks and review class performance.", Icon: MarkIcon },
  { id: "assignments", label: "Subject assignments", desc: "See subjects and the assigned teachers.", Icon: HomeIcon },
  { id: "results", label: "Results & reports", desc: "Downloadable reports for this stream.", Icon: FileIcon },
  { id: "analytics", label: "Analytics", desc: "Averages, rankings, and class trends.", Icon: BarIcon },
  { id: "archives", label: "Archives", desc: "Past performance reports (PDF).", Icon: ArchiveIcon },
  { id: "settings", label: "Settings", desc: "Stream details and reporting preferences.", Icon: SettIcon },
];

export default function ClassTeacherDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.user || parsed;
      } catch (e) {}
    }
    return null;
  });

  const [tab, setTab] = useState("students");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 900);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme, toggleTheme } = useDashboardTheme();

  const loadData = useCallback(async () => {
    if (!currentUser?.classGrade || !currentUser?.classStream) {
      setError("No class assigned to your profile.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const [studentsData, subjectsData, staffData] = (await Promise.all([
        api.get(`/users/class/${currentUser.classGrade}/${currentUser.classStream}`, {
          term: currentUser.term,
          year: currentUser.year
        }),
        api.get("/school/subjects"),
        api.get("/users") // Get assignments and staff names
      ])) as [any[], any[], any];
      setStudents(studentsData);
      setSubjects(subjectsData.map((s: any) => ({ ...s, id: s._id })));

    
      // Filter assignments for THIS class
      const classAssignments = (staffData.assignments || []).filter(
        (a: any) => a.classGrade === currentUser.classGrade && a.classStream === currentUser.classStream
      ).map((a: any) => {
        const teacher = staffData.staff.find((s: any) => s.id === a.teacherId);
        return {
          ...a,
          teacherName: teacher ? teacher.name : "Unknown"
        };
      });
      setAssignments(classAssignments);
    } catch (err: any) {
      
      setError(err.message || "Failed to load records.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshUser = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const freshUser: any = await api.get(`/users/${currentUser.id}`);
      if (freshUser) {
        // Ensure roles is always an array (backend may return object from DB)
        let rolesArr = freshUser.roles;
        if (rolesArr && !Array.isArray(rolesArr)) {
          rolesArr = [rolesArr.role1, rolesArr.role2, rolesArr.role3].filter(Boolean);
        }
        const updated = { ...currentUser, ...freshUser, id: freshUser._id || freshUser.id, roles: rolesArr || currentUser.roles || [] };
        const savedItem = localStorage.getItem("user"); if (savedItem) { const parsed = JSON.parse(savedItem); parsed.user = updated; localStorage.setItem("user", JSON.stringify(parsed)); }
        setCurrentUser(updated);
      }
    } catch (e) {}
  }, [currentUser?.id]);

  useEffect(() => {
    refreshUser();
    const interval = setInterval(refreshUser, 15000);
    return () => clearInterval(interval);
  }, [refreshUser]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Roles check — guard against roles being a non-array
  const rolesArray = Array.isArray(currentUser?.roles) ? currentUser.roles : [];
  const isSubjectTeacher = rolesArray.includes("subjectteacher");
  const hasSubjectAssignments = currentUser?.subjects?.length > 0;
  const canSwitchToSubjectDashboard = isSubjectTeacher && hasSubjectAssignments;

  useEffect(() => {
    if (!currentUser || !rolesArray.includes("classteacher")) {
      navigate("/login");
    }
  }, [currentUser, navigate, rolesArray]);

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

  const activeNav = NAV.find((n) => n.id === tab) || NAV[0];
  const classAvg = students.length > 0 ? 75 : 0; // Simple placeholder

  const handleSelectTab = (t: string) => {
    setTab(t);
    setSelectedStudent(null);
    setMobileMenuOpen(false);
  };

  const renderContent = () => {
    if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading records...</div>;
    if (error) return <div style={{ padding: 40, textAlign: "center", color: C.dangerText }}>{error}</div>;

    if (selectedStudent && tab === "students") {
      return (
        <StudentDetails
          student={selectedStudent}
          subjects={subjects}
          onBack={() => setSelectedStudent(null)}
        />
      );
    }
    switch (tab) {
      case "students":
        return <StudentRecords students={students} subjects={subjects} onViewStudent={setSelectedStudent} classInfo={`Grade ${currentUser?.classGrade}${currentUser?.classStream}`} />;
      case "marks":
        return <MarksManagement students={students} subjects={subjects} onRefresh={loadData} user={currentUser} />;
      case "assignments":
        return (
          <SubjectAssignments
            subjects={subjects}
            assignments={assignments}
            classGrade={currentUser.classGrade}
            classStream={currentUser.classStream}
            classTeacherName={currentUser.name}
            canSwitchToSubjectDashboard={canSwitchToSubjectDashboard}
            onSwitchToSubjectDashboard={() => navigate("/subjectTeacher")}
          />
        );
      case "results":
        return <ResultsReports students={students} subjects={subjects} term={currentUser.term} year={currentUser.year} examType={currentUser.examType} />;
      case "analytics":
        return <Analytics students={students} subjects={subjects} classGrade={currentUser.classGrade} classStream={currentUser.classStream} term={currentUser.term} year={currentUser.year} />;
      case "archives":
        return <ArchivesView classGrade={currentUser.classGrade} classStream={currentUser.classStream} title="Class Performance Archives" />;
      case "settings":
        return <Settings user={currentUser} studentsCount={students.length} onUserUpdate={() => {
          window.location.reload(); // Simplest way to refresh everything with new term info
        }} />;
      default:
        return null;
    }
  };

  return (
    <>
      <GlobalStyles />
      {mobileMenuOpen && (
        <div
          className="ct-mobileOverlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <div
        className="ct-dashboardShell"
        data-theme={theme}
        style={{
          display: "flex",
          height: "100vh",
          fontFamily: FONT.sans,
          background: C.sand,
          overflow: "hidden",
        }}
      >
        <Sidebar
          navItems={NAV}
          activeTab={tab}
          collapsed={isMobile ? false : collapsed}
          mobileOpen={mobileMenuOpen}
          isMobile={isMobile}
          onToggleCollapse={() => {
            if (isMobile) {
              setMobileMenuOpen(false);
              return;
            }
            setCollapsed(!collapsed);
          }}
          onSelectTab={handleSelectTab}
          classAvg={classAvg}
          user={currentUser}
          onLogout={handleLogout}
        />

        <div
          className="ct-mainPanel"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          <TopBar
            activeLabel={activeNav.label}
            isMobile={isMobile}
            onOpenMenu={() => setMobileMenuOpen(true)}
            theme={theme}
            onToggleTheme={toggleTheme}
            onLogout={handleLogout}
            user={currentUser}
          />

          {/* Hero panel */}
          {tab === "students" && !selectedStudent && (
            <div
              style={{
                background: C.green,
                padding: "22px 24px",
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
                    id="hg"
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
                <rect width="100%" height="100%" fill="url(#hg)" />
              </svg>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 16,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: FONT.sans,
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: C.gold,
                      textTransform: "uppercase",
                      letterSpacing: "0.09em",
                      margin: "0 0 5px",
                    }}
                  >
                    Today's focus
                  </p>
                  <h1
                    style={{
                      fontFamily: FONT.serif,
                      fontSize: "1.6rem",
                      fontWeight: 600,
                      color: "#fdf9f2",
                      margin: "0 0 6px",
                      letterSpacing: "-0.01em",
                      lineHeight: 1.25,
                    }}
                  >
                    Keep Grade {currentUser?.classGrade || ""} {currentUser?.classStream || ""} organized and
                    ready for reporting.
                  </h1>
                  <p
                    style={{
                      fontFamily: FONT.sans,
                      fontSize: 13,
                      color: "#9eb8aa",
                      margin: 0,
                      maxWidth: 520,
                    }}
                  >
                    {students.length} learners enrolled · Term {currentUser?.term || 1} well underway
                  </p>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {[
                    { label: "Subject assignments", tab: "assignments" },
                    { label: "Review marks", tab: "marks" },
                    { label: "Download results", tab: "results" },
                  ].map(({ label, tab: t }) => (
                    <button
                      key={t}
                      onClick={() => handleSelectTab(t)}
                      style={{
                        padding: "9px 16px",
                        background: "rgba(201,150,61,0.15)",
                        border: `1px solid rgba(201,150,61,0.3)`,
                        borderRadius: 9,
                        fontFamily: FONT.sans,
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: "#e8dcc8",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "background 0.18s",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                  {canSwitchToSubjectDashboard && (
                    <button
                      onClick={() => navigate("/subjectTeacher")}
                      style={{
                        padding: "9px 16px",
                        background: C.gold,
                        border: `1px solid ${C.gold}`,
                        borderRadius: 9,
                        fontFamily: FONT.sans,
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: "#fff",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "background 0.18s",
                      }}
                    >
                      Subject dashboard
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Metric strip */}
          {tab === "students" && !selectedStudent && (
            <div
              className="ct-metricStrip"
              style={{
                padding: "14px 24px",
                background: C.cream,
                borderBottom: `1px solid ${C.border}`,
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 12,
                flexShrink: 0,
              }}
            >
              {[
                {
                  label: "Students enrolled",
                  value: students.length,
                  note: "Full roster visibility",
                },
                {
                  label: "Active roles",
                  value: currentUser?.roles?.length || 0,
                  note: "Management scope",
                },
                {
                  label: "Report readiness",
                  value: "85%",
                  note: "Grading on track",
                },
                {
                  label: "Class average",
                  value: `${classAvg}%`,
                  note: "Across all subjects",
                },
              ].map(({ label, value, note }) => (
                <div
                  key={label}
                  style={{
                    background: C.white,
                    border: `1px solid ${C.border}`,
                    borderRadius: 11,
                    padding: "12px 14px",
                  }}
                >
                  <p
                    style={{
                      fontFamily: FONT.sans,
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: C.textFaint,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      margin: "0 0 4px",
                    }}
                  >
                    {label}
                  </p>
                  <p
                    style={{
                      fontFamily: FONT.serif,
                      fontSize: "1.7rem",
                      fontWeight: 600,
                      color: C.text,
                      margin: "0 0 2px",
                      lineHeight: 1,
                    }}
                  >
                    {value}
                  </p>
                  <p
                    style={{
                      fontFamily: FONT.sans,
                      fontSize: 11.5,
                      color: C.textFaint,
                      margin: 0,
                    }}
                  >
                    {note}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Content area */}
          <div
            className="ct-contentArea"
            style={{ flex: 1, overflowY: "auto", padding: "24px" }}
          >
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
}
