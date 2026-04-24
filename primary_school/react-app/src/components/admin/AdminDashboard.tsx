// components/admin/AdminDashboard.tsx
import React, { useState } from "react";
import styles from "./AdminDashboard.module.css";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { OverviewTab } from "./OverviewTab";
import { ClassesTab } from "./ClassesTab";
import { SubjectsTab } from "./SubjectsTab";
import { AssignmentsTab } from "./AssignmentsTab";
import { TeachersTab } from "./TeachersTab";
import { Teacher, Subject, Class } from "./types";

// Mock Data
const initialTeachers: Teacher[] = [
  {
    id: "T1",
    name: "Peter Otieno",
    email: "peter@school.com",
    phone: "+254712345678",
    status: "Active",
    department: "Sciences",
  },
  {
    id: "T2",
    name: "Jane Wanjiku",
    email: "jane@school.com",
    phone: "+254723456789",
    status: "Active",
    department: "Languages",
  },
  {
    id: "T3",
    name: "James Kamau",
    email: "james@school.com",
    phone: "+254734567890",
    status: "Active",
    department: "Languages",
  },
  {
    id: "T4",
    name: "Mary Achieng",
    email: "mary@school.com",
    phone: "+254745678901",
    status: "Active",
    department: "Sciences",
  },
  {
    id: "T5",
    name: "John Mwangi",
    email: "john@school.com",
    phone: "+254756789012",
    status: "Active",
    department: "Humanities",
  },
  {
    id: "T6",
    name: "Grace Njeri",
    email: "grace@school.com",
    phone: "+254767890123",
    status: "Active",
    department: "Humanities",
  },
  {
    id: "T7",
    name: "David Odhiambo",
    email: "david@school.com",
    phone: "+254778901234",
    status: "Active",
    department: "Sciences",
  },
  {
    id: "T8",
    name: "Agnes Muthoni",
    email: "agnes@school.com",
    phone: "+254789012345",
    status: "On Leave",
    department: "Languages",
  },
];

const initialSubjects: Subject[] = [
  {
    id: "SUB1",
    name: "Mathematics",
    code: "MATH",
    department: "Sciences",
    periods: 6,
  },
  {
    id: "SUB2",
    name: "English",
    code: "ENG",
    department: "Languages",
    periods: 5,
  },
  {
    id: "SUB3",
    name: "Kiswahili",
    code: "KSW",
    department: "Languages",
    periods: 5,
  },
  {
    id: "SUB4",
    name: "Science",
    code: "SCI",
    department: "Sciences",
    periods: 5,
  },
  {
    id: "SUB5",
    name: "Social Studies",
    code: "SST",
    department: "Humanities",
    periods: 4,
  },
  {
    id: "SUB6",
    name: "CRE",
    code: "CRE",
    department: "Humanities",
    periods: 3,
  },
  {
    id: "SUB7",
    name: "Art & Craft",
    code: "ART",
    department: "Arts",
    periods: 3,
  },
  {
    id: "SUB8",
    name: "Physical Ed.",
    code: "PE",
    department: "Sports",
    periods: 4,
  },
];

const initialClasses: Class[] = [
  {
    id: "CL1",
    name: "Grade 7A",
    grade: "Grade 7",
    stream: "A",
    capacity: 40,
    students: 35,
    classTeacherId: "T1",
    subjectAssignments: {
      SUB1: "T1",
      SUB2: "T2",
      SUB3: "T3",
      SUB4: "T4",
      SUB5: "T5",
      SUB6: "T6",
    },
  },
  {
    id: "CL2",
    name: "Grade 7B",
    grade: "Grade 7",
    stream: "B",
    capacity: 40,
    students: 34,
    classTeacherId: "T3",
    subjectAssignments: {
      SUB1: "T1",
      SUB2: "T8",
      SUB3: "T3",
      SUB4: "T4",
      SUB5: "T5",
    },
  },
  {
    id: "CL3",
    name: "Grade 8A",
    grade: "Grade 8",
    stream: "A",
    capacity: 40,
    students: 33,
    classTeacherId: "T5",
    subjectAssignments: {
      SUB1: "T7",
      SUB2: "T2",
      SUB3: "T3",
      SUB4: "T4",
      SUB5: "T5",
      SUB6: "T6",
      SUB7: "T6",
    },
  },
  {
    id: "CL4",
    name: "Grade 8B",
    grade: "Grade 8",
    stream: "B",
    capacity: 40,
    students: 32,
    classTeacherId: "T2",
    subjectAssignments: {
      SUB1: "T1",
      SUB2: "T2",
      SUB3: "T3",
      SUB4: "T7",
      SUB5: "T5",
    },
  },
  {
    id: "CL5",
    name: "Grade 9A",
    grade: "Grade 9",
    stream: "A",
    capacity: 40,
    students: 30,
    classTeacherId: "T4",
    subjectAssignments: {
      SUB1: "T1",
      SUB2: "T2",
      SUB3: "T3",
      SUB4: "T4",
      SUB5: "T5",
      SUB6: "T6",
    },
  },
  {
    id: "CL6",
    name: "Grade 9B",
    grade: "Grade 9",
    stream: "B",
    capacity: 40,
    students: 29,
    classTeacherId: "T6",
    subjectAssignments: {
      SUB1: "T7",
      SUB2: "T2",
      SUB3: "T3",
      SUB4: "T4",
      SUB5: "T5",
      SUB6: "T6",
      SUB8: "T7",
    },
  },
];

// Helper Functions
const initials = (name: string): string => {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const avatarColors = [
  "#1D9E75",
  "#BA7517",
  "#993C1D",
  "#185FA5",
  "#3B6D11",
  "#993556",
  "#4A6DA8",
  "#7A4E12",
];
const avatarColor = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return avatarColors[hash % avatarColors.length];
};

const avatar = (name: string, size: number = 30): string => {
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${avatarColor(name)};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:${Math.round(size * 0.32)}px;color:#fff;flex-shrink:0">${initials(name)}</div>`;
};

const pill = (text: string, color: string = "gold"): string => {
  const colorMap: Record<string, [string, string]> = {
    gold: ["#f5ead4", "#C9963D"],
    green: ["#eaf3de", "#3b6d11"],
    red: ["#fcebeb", "#a32d2d"],
    amber: ["#faeeda", "#854f0b"],
    gray: ["#f0e9dc", "#7a6040"],
    blue: ["#e8f0fb", "#1a4a99"],
  };
  const [bg, textColor] = colorMap[color] || colorMap.gold;
  return `<span style="display:inline-block;padding:2px 10px;border-radius:20px;font-size:10px;font-weight:700;background:${bg};color:${textColor}">${text}</span>`;
};

const navItems = [
  {
    id: "overview",
    label: "Overview",
    svg: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  },
  {
    id: "classes",
    label: "Classes",
    svg: '<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>',
  },
  {
    id: "subjects",
    label: "Subjects",
    svg: '<path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>',
  },
  {
    id: "assignments",
    label: "Assignments",
    svg: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>',
  },
  {
    id: "teachers",
    label: "Teacher directory",
    svg: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>',
  },
];

const AdminDashboard: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [teachers, setTeachers] = useState(initialTeachers);
  const [subjects, setSubjects] = useState(initialSubjects);
  const [classes, setClasses] = useState(initialClasses);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

  const unassignedCount = classes.filter((c) => !c.classTeacherId).length;
  const assignedCT = classes.filter((c) => c.classTeacherId).length;
  const totalClasses = classes.length;

  const showModal = (content: React.ReactNode) => setModalContent(content);
  const closeModal = () => setModalContent(null);

  const showConfirm = (
    msg: string,
    onOk: () => void,
    danger: boolean = true,
  ) => {
    showModal(
      <div>
        <div
          style={{
            padding: "18px 22px 14px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--serif)",
              fontSize: "1.2rem",
              fontWeight: 600,
              color: "var(--text)",
            }}
          >
            Confirm {danger ? "removal" : "action"}
          </h3>
          <button
            onClick={closeModal}
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: "var(--sand)",
              border: "none",
              cursor: "pointer",
              fontSize: 16,
              fontWeight: 700,
              color: "var(--textMut)",
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: "18px 22px 22px" }}>
          <p
            style={{
              fontSize: 13.5,
              color: "var(--textM)",
              lineHeight: 1.65,
              marginBottom: "1.3rem",
            }}
            dangerouslySetInnerHTML={{ __html: msg }}
          />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              onClick={closeModal}
              style={{
                padding: "8px 16px",
                background: "var(--sand)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                color: "var(--textM)",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onOk();
                closeModal();
              }}
              style={{
                padding: "8px 16px",
                background: danger ? "var(--dText)" : "var(--gold)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {danger ? "Remove" : "Confirm"}
            </button>
          </div>
        </div>
      </div>,
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab
            classes={classes}
            subjects={subjects}
            teachers={teachers}
            onSwitchTab={setActiveTab}
            pill={pill}
            avatar={avatar}
          />
        );
      case "classes":
        return (
          <ClassesTab
            classes={classes}
            teachers={teachers}
            subjects={subjects}
            onUpdateClasses={setClasses}
            onUpdateSidebarStats={() => {}}
            pill={pill}
            avatar={avatar}
            showModal={showModal}
            closeModal={closeModal}
            showConfirm={showConfirm}
          />
        );
      case "subjects":
        return (
          <SubjectsTab
            subjects={subjects}
            classes={classes}
            onUpdateSubjects={setSubjects}
            onUpdateClasses={setClasses}
            onUpdateSidebarStats={() => {}}
            pill={pill}
            showModal={showModal}
            closeModal={closeModal}
            showConfirm={showConfirm}
          />
        );
      case "assignments":
        return (
          <AssignmentsTab
            classes={classes}
            teachers={teachers}
            subjects={subjects}
            onUpdateClasses={setClasses}
            avatar={avatar}
            pill={pill}
          />
        );
      case "teachers":
        return (
          <TeachersTab
            teachers={teachers}
            classes={classes}
            onUpdateTeachers={setTeachers}
            onUpdateSidebarStats={() => {}}
            avatar={avatar}
            pill={pill}
            showModal={showModal}
            closeModal={closeModal}
          />
        );
      default:
        return null;
    }
  };

  const teacherInitials = initials("Admin User");
  const teacherAvatarColor = avatarColor("Admin User");

  return (
    <div className={styles.dashboard}>
      <Sidebar
        collapsed={collapsed}
        activeTab={activeTab}
        navItems={navItems}
        classesCount={classes.length}
        subjectsCount={subjects.length}
        teachersCount={teachers.length}
        assignedCT={assignedCT}
        totalClasses={totalClasses}
        unassignedCount={unassignedCount}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        onSelectTab={setActiveTab}
        teacherInitials={teacherInitials}
        teacherAvatarColor={teacherAvatarColor}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        <TopBar
          title={navItems.find((n) => n.id === activeTab)?.label || "Overview"}
          unassignedCount={unassignedCount}
          onSwitchTab={setActiveTab}
          teacherInitials={teacherInitials}
          teacherAvatarColor={teacherAvatarColor}
        />

        {/* Hero Area - only on overview */}
        {activeTab === "overview" && (
          <div
            style={{
              background: "var(--cg)",
              padding: "16px 20px",
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
                  id="ag"
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
              <rect width="100%" height="100%" fill="url(#ag)" />
            </svg>
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 9.5,
                    fontWeight: 700,
                    color: "var(--gold)",
                    textTransform: "uppercase",
                    letterSpacing: ".09em",
                    margin: "0 0 3px",
                  }}
                >
                  Administration
                </p>
                <h1
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "1.4rem",
                    fontWeight: 600,
                    color: "#fdf9f2",
                    margin: "0 0 3px",
                    lineHeight: 1.2,
                  }}
                >
                  Manage your school's structure from one place.
                </h1>
                <p style={{ fontSize: 12, color: "#9eb8aa", margin: 0 }}>
                  {classes.length} classes · {subjects.length} subjects ·{" "}
                  {teachers.filter((t) => t.status === "Active").length} active
                  teachers
                </p>
              </div>
              <div style={{ display: "flex", gap: 7 }}>
                <button
                  onClick={() => setActiveTab("classes")}
                  style={{
                    padding: "7px 13px",
                    background: "rgba(201,150,61,.15)",
                    border: "1px solid rgba(201,150,61,.3)",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#e8dcc8",
                    cursor: "pointer",
                  }}
                >
                  Add class
                </button>
                <button
                  onClick={() => setActiveTab("subjects")}
                  style={{
                    padding: "7px 13px",
                    background: "rgba(201,150,61,.15)",
                    border: "1px solid rgba(201,150,61,.3)",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#e8dcc8",
                    cursor: "pointer",
                  }}
                >
                  Add subject
                </button>
                <button
                  onClick={() => setActiveTab("assignments")}
                  style={{
                    padding: "7px 13px",
                    background: "rgba(201,150,61,.15)",
                    border: "1px solid rgba(201,150,61,.3)",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#e8dcc8",
                    cursor: "pointer",
                  }}
                >
                  Assignments
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div
          style={{ flex: 1, overflowY: "auto", padding: "18px 20px" }}
          className={styles.contentArea}
        >
          {renderContent()}
        </div>
      </div>

      {/* Modal Container */}
      {modalContent && (
        <div
          className={styles.modalBg}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className={styles.modalBox}>{modalContent}</div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
