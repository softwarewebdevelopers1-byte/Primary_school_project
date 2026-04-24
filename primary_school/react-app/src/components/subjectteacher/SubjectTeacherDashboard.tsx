// components/subjectteacher/SubjectTeacherDashboard.tsx
import React, { useState } from "react";
import styles from "./SubjectTeacherDashboard.module.css";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { SubjectsTab } from "./SubjectsTab";
import { MarksTab } from "./MarksTab";
import { AssessmentsTab } from "./AssessmentsTab";
import { ProgressTab } from "./ProgressTab";
import { ResourcesTab } from "./ResourcesTab";
import { Subject, Student, Assessment, Resource, MarksData } from "./types";
import { streamInfo } from "../classteacher/shared/data";
import { useDashboardTheme } from "../../lib/useDashboardTheme";

// Mock Data
const SUBJECTS: Subject[] = [
  {
    id: "S1",
    name: "Mathematics",
    grade: "Grade 7A",
    students: 35,
    avg: 78,
    pushed: true,
    term: 1,
    lastAssess: "Mid-term Exam",
  },
  {
    id: "S2",
    name: "Mathematics",
    grade: "Grade 8A",
    students: 33,
    avg: 81,
    pushed: false,
    term: 1,
    lastAssess: "CAT 2",
  },
  {
    id: "S3",
    name: "Mathematics",
    grade: "Grade 9B",
    students: 29,
    avg: 74,
    pushed: true,
    term: 1,
    lastAssess: "Mid-term Exam",
  },
];

const STUDENTS_MAP: Record<string, Student[]> = {
  S1: [
    {
      id: "L1",
      adm: "2024/001",
      name: "Emma Mwangi",
      gender: "F",
      marks: { cat1: 34, cat2: 30, exam: null },
      pushed: false,
    },
    {
      id: "L2",
      adm: "2024/002",
      name: "James Otieno",
      gender: "M",
      marks: { cat1: 28, cat2: 25, exam: null },
      pushed: false,
    },
    {
      id: "L3",
      adm: "2024/003",
      name: "Faith Njeri",
      gender: "F",
      marks: { cat1: 38, cat2: 36, exam: null },
      pushed: false,
    },
    {
      id: "L4",
      adm: "2024/004",
      name: "Kevin Mutua",
      gender: "M",
      marks: { cat1: 22, cat2: 20, exam: null },
      pushed: false,
    },
    {
      id: "L5",
      adm: "2024/005",
      name: "Sharon Achieng",
      gender: "F",
      marks: { cat1: 31, cat2: 29, exam: null },
      pushed: false,
    },
  ],
  S2: [
    {
      id: "L6",
      adm: "2023/045",
      name: "Aisha Hassan",
      gender: "F",
      marks: { cat1: 36, cat2: 34, exam: null },
      pushed: false,
    },
    {
      id: "L7",
      adm: "2023/046",
      name: "Brian Kipchoge",
      gender: "M",
      marks: { cat1: 24, cat2: 22, exam: null },
      pushed: false,
    },
    {
      id: "L8",
      adm: "2023/047",
      name: "Mercy Wanjiku",
      gender: "F",
      marks: { cat1: 33, cat2: 31, exam: null },
      pushed: false,
    },
  ],
  S3: [
    {
      id: "L9",
      adm: "2022/031",
      name: "David Kamau",
      gender: "M",
      marks: { cat1: 38, cat2: 37, exam: null },
      pushed: true,
    },
    {
      id: "L10",
      adm: "2022/032",
      name: "Cynthia Achieng",
      gender: "F",
      marks: { cat1: 26, cat2: 24, exam: null },
      pushed: false,
    },
    {
      id: "L11",
      adm: "2022/033",
      name: "Peter Maina",
      gender: "M",
      marks: { cat1: 30, cat2: 28, exam: null },
      pushed: true,
    },
  ],
};

const ASSESSMENTS: Assessment[] = [
  {
    title: "CAT 1 – Algebra",
    subject: "Grade 7A",
    date: "2024-08-15",
    max: 40,
    status: "Marked",
  },
  {
    title: "CAT 1 – Algebra",
    subject: "Grade 8A",
    date: "2024-08-15",
    max: 40,
    status: "Marked",
  },
  {
    title: "CAT 2 – Geometry",
    subject: "Grade 7A",
    date: "2024-09-10",
    max: 40,
    status: "Marked",
  },
  {
    title: "Mid-term Exam",
    subject: "Grade 9B",
    date: "2024-09-25",
    max: 100,
    status: "Pending marks",
  },
  {
    title: "CAT 2 – Statistics",
    subject: "Grade 9B",
    date: "2024-09-12",
    max: 40,
    status: "Marked",
  },
  {
    title: "End-term Prep",
    subject: "Grade 8A",
    date: "2024-10-20",
    max: 100,
    status: "Upcoming",
  },
];

const RESOURCES: Resource[] = [
  {
    title: "Form 1 Algebra Notes",
    type: "PDF",
    size: "2.4 MB",
    date: "2024-08-01",
  },
  {
    title: "KCSE Past Papers 2019–2023",
    type: "ZIP",
    size: "14 MB",
    date: "2024-07-20",
  },
  {
    title: "Geometry Worksheet Set",
    type: "DOCX",
    size: "1.1 MB",
    date: "2024-09-05",
  },
  {
    title: "Statistics Reference Sheet",
    type: "PDF",
    size: "0.8 MB",
    date: "2024-09-18",
  },
  {
    title: "CAT 2 Answer Scheme",
    type: "PDF",
    size: "0.5 MB",
    date: "2024-09-11",
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
];
const avatarColor = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return avatarColors[hash % avatarColors.length];
};

const avatar = (name: string, size: number = 28): string => {
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${avatarColor(name)};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:${size * 0.32}px;flex-shrink:0">${initials(name)}</div>`;
};

const gc = (v: number): string => {
  return v >= 80 ? "var(--sText)" : v >= 65 ? "var(--wText)" : "var(--dText)";
};

const SubjectTeacherDashboard: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("subjects");
  const [activeSubjectId, setActiveSubjectId] = useState("S1");
  const [marksData, setMarksData] = useState<MarksData>(() => {
    const initial: MarksData = {};
    Object.keys(STUDENTS_MAP).forEach((sid) => {
      initial[sid] = {};
      STUDENTS_MAP[sid].forEach((s) => {
        initial[sid][s.id] = { ...s.marks };
      });
    });
    return initial;
  });
  const [pushedSubjects, setPushedSubjects] = useState<Set<string>>(
    new Set(SUBJECTS.filter((s) => s.pushed).map((s) => s.id)),
  );
  const [pushedStudents, setPushedStudents] = useState<Set<string>>(new Set());
  const { theme, toggleTheme } = useDashboardTheme();

  const teacherName = streamInfo.classTeacher;
  const teacherInitials = initials(teacherName);
  const teacherAvatarColor = avatarColor(teacherName);
  const streamsCount = SUBJECTS.length;
  const totalStudents = SUBJECTS.reduce((sum, s) => sum + s.students, 0);
  const department = "Sciences";
  const currentStudents = STUDENTS_MAP[activeSubjectId] || [];
  const canSwitchToClassDashboard = teacherName === streamInfo.classTeacher;

  const handleMarkUpdate = (
    subjectId: string,
    studentId: string,
    key: string,
    value: string,
  ) => {
    setMarksData((prev) => {
      const newData = { ...prev };
      if (!newData[subjectId]) newData[subjectId] = {};
      if (!newData[subjectId][studentId])
        newData[subjectId][studentId] = { cat1: null, cat2: null, exam: null };
      newData[subjectId][studentId][
        key as keyof (typeof newData)[string][string]
      ] =
        value === ""
          ? null
          : Math.min(parseInt(value) || 0, key === "exam" ? 100 : 40);
      return newData;
    });
  };

  const handleSaveMarks = (_subjectId: string) => {
    alert("Marks saved successfully!");
  };

  const handlePushMarks = (subjectId: string) => {
    setPushedSubjects((prev) => new Set(prev).add(subjectId));
    const subjectMarks = marksData[subjectId] || {};
    const students = STUDENTS_MAP[subjectId] || [];
    students.forEach((s) => {
      const m = subjectMarks[s.id];
      if (m && m.cat1 !== null && m.cat2 !== null && m.exam !== null) {
        setPushedStudents((prev) => new Set(prev).add(s.id));
      }
    });
    alert(
      `Marks pushed for ${SUBJECTS.find((s) => s.id === subjectId)?.grade}`,
    );
  };

  const getTabTitle = () => {
    const titles: Record<string, string> = {
      subjects: "My Subjects",
      marks: "Mark Entry",
      assessments: "Assessments",
      progress: "Student Progress",
      resources: "Resources",
    };
    return titles[activeTab] || "My Subjects";
  };

  const renderContent = () => {
    switch (activeTab) {
      case "subjects":
        return (
          <SubjectsTab
            subjects={SUBJECTS}
            onSelectSubject={setActiveSubjectId}
            onEnterMarks={(id) => {
              setActiveSubjectId(id);
              setActiveTab("marks");
            }}
            pushedSubjects={pushedSubjects}
            gc={gc}
          />
        );
      case "marks":
        return (
          <MarksTab
            subjects={SUBJECTS}
            activeSubjectId={activeSubjectId}
            students={currentStudents}
            marksData={marksData}
            pushedSubjects={pushedSubjects}
            pushedStudents={pushedStudents}
            onSubjectChange={setActiveSubjectId}
            onMarkUpdate={handleMarkUpdate}
            onSaveMarks={handleSaveMarks}
            onPushMarks={handlePushMarks}
            avatar={avatar}
          />
        );
      case "assessments":
        return <AssessmentsTab assessments={ASSESSMENTS} />;
      case "progress":
        return (
          <ProgressTab
            subjects={SUBJECTS}
            activeSubjectId={activeSubjectId}
            students={currentStudents}
            marksData={marksData}
            onSubjectChange={setActiveSubjectId}
            avatar={avatar}
            gc={gc}
          />
        );
      case "resources":
        return <ResourcesTab resources={RESOURCES} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.dashboard} data-theme={theme}>
      <Sidebar
        collapsed={collapsed}
        activeTab={activeTab}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        onSelectTab={setActiveTab}
        teacherName={teacherName}
        teacherInitials={teacherInitials}
        teacherAvatarColor={teacherAvatarColor}
        streamsCount={streamsCount}
        totalStudents={totalStudents}
        department={department}
      />

      <div className={styles.mainContent}>
        <TopBar
          title={getTabTitle()}
          teacherName={teacherName}
          teacherInitials={teacherInitials}
          teacherAvatarColor={teacherAvatarColor}
          role="Subject Teacher"
          canSwitchToClassDashboard={canSwitchToClassDashboard}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        <div className={styles.contentArea}>{renderContent()}</div>
      </div>
    </div>
  );
};

export default SubjectTeacherDashboard;
