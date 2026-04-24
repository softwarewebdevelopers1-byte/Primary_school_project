// components/classteacher/ClassTeacherDashboard.tsx
import  { useState } from "react";
import { GlobalStyles } from "./shared/GlobalStyles";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { StudentRecords } from "./StudentRecords";
import { StudentDetails } from "./StudentDetails";
import { MarksManagement } from "./MarksManagement";
import { ResultsReports } from "./ResultsReports";
import { Analytics } from "./Analytics";
import { Settings } from "./Settings";
import { students, streamInfo, subjects } from "./shared/data";
import { avg } from "./shared/helpers";
import {
  UsersIcon,
  MarkIcon,
  FileIcon,
  BarIcon,
  SettIcon,
} from "./shared/Icons";
import { C, FONT } from "./shared/constants";

const NAV = [
  {
    id: "students",
    label: "Student records",
    desc: "Rosters, contacts, and learner profiles.",
    Icon: UsersIcon,
  },
  {
    id: "marks",
    label: "Marks management",
    desc: "Capture marks and review class performance.",
    Icon: MarkIcon,
  },
  {
    id: "results",
    label: "Results & reports",
    desc: "Downloadable reports for this stream.",
    Icon: FileIcon,
  },
  {
    id: "analytics",
    label: "Analytics",
    desc: "Averages, rankings, and class trends.",
    Icon: BarIcon,
  },
  {
    id: "settings",
    label: "Settings",
    desc: "Stream details and reporting preferences.",
    Icon: SettIcon,
  },
];

export default function ClassTeacherDashboard() {
  const [tab, setTab] = useState("students");
  const [collapsed, setCollapsed] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const activeNav = NAV.find((n) => n.id === tab) || NAV[0];
  const classAvg = Math.round(
    students.reduce((acc, s) => acc + avg(s.marks), 0) / students.length,
  );

  const handleSelectTab = (t: string) => {
    setTab(t);
    setSelectedStudent(null);
  };

  const renderContent = () => {
    if (selectedStudent && tab === "students") {
      return (
        <StudentDetails
          student={selectedStudent}
          onBack={() => setSelectedStudent(null)}
        />
      );
    }
    switch (tab) {
      case "students":
        return <StudentRecords onViewStudent={setSelectedStudent} />;
      case "marks":
        return <MarksManagement />;
      case "results":
        return <ResultsReports />;
      case "analytics":
        return <Analytics />;
      case "settings":
        return <Settings />;
      default:
        return null;
    }
  };

  return (
    <>
      <GlobalStyles />
      <div
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
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          onSelectTab={handleSelectTab}
          classAvg={classAvg}
        />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <TopBar activeLabel={activeNav.label} />

          {/* Hero panel - shown only on students/home tab */}
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
                <div>
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
                    Keep {streamInfo.className} {streamInfo.name} organized and
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
                    {students.length} learners · {subjects.length} subjects ·
                    Term {streamInfo.term} well underway
                  </p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  {[
                    { label: "Review marks", tab: "marks" },
                    { label: "Download results", tab: "results" },
                    { label: "Analytics", tab: "analytics" },
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
                </div>
              </div>
            </div>
          )}

          {/* Metric strip */}
          {tab === "students" && !selectedStudent && (
            <div
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
                  label: "Subject coverage",
                  value: subjects.length,
                  note: "Subject teachers aligned",
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
          <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
}
