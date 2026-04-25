// components/subjectteacher/SubjectTeacherDashboard.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SubjectTeacherDashboard.module.css";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { SubjectsTab } from "./SubjectsTab";
import { MarksTab } from "./MarksTab";
import { AssessmentsTab } from "./AssessmentsTab";
import { ProgressTab } from "./ProgressTab";
import { ResourcesTab } from "./ResourcesTab";
import { Subject, Student, Assessment, Resource, MarksData } from "./types";
import { useDashboardTheme } from "../../lib/useDashboardTheme";
import { api } from "../../lib/api";

// Helper Functions
const initials = (name: string): string => name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
const avatarColor = (name: string): string => {
  const colors = ["#1D9E75", "#BA7517", "#993C1D", "#185FA5", "#3B6D11", "#993556", "#4A6DA8"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return colors[hash % colors.length];
};
const avatar = (name: string, size: number = 28): string => `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${avatarColor(name)};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:${size * 0.32}px;flex-shrink:0">${initials(name)}</div>`;
const gc = (v: number): string => v >= 80 ? "var(--sText)" : v >= 65 ? "var(--wText)" : "var(--dText)";

const SubjectTeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("subjects");
  const [activeSubjectId, setActiveSubjectId] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [marksData, setMarksData] = useState<MarksData>({});
  const [pushedSubjects, setPushedSubjects] = useState<Set<string>>(new Set());
  const [pushedStudents, setPushedStudents] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { theme, toggleTheme } = useDashboardTheme();

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const loadAssignments = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data: any[] = await api.get(`/school/assignments/teacher/${user.id}`);
      const mapped: Subject[] = data.map((a: any) => ({
        id: a._id, // Use assignment ID
        subjectId: a.subjectId._id,
        name: a.subjectId.name,
        grade: `Grade ${a.classGrade}${a.classStream}`,
        classGrade: a.classGrade,
        classStream: a.classStream,
        students: 0,
        avg: 0,
        pushed: false,
        term: 1,
        lastAssess: "N/A"
      }));
      setSubjects(mapped);
      if (mapped.length > 0) setActiveSubjectId(mapped[0].id);

    } catch (err) {
      console.error("Failed to load assignments", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const loadStudentsAndMarks = useCallback(async () => {
    const currentSubject = subjects.find(s => s.id === activeSubjectId);
    if (!currentSubject) return;

    try {
      // Ensure we send params in a way that matches what the backend expects
      const data: any[] = await api.get("/marks", {
        subjectId: currentSubject.subjectId, // Use the actual subject ID
        classGrade: currentSubject.classGrade,
        classStream: currentSubject.classStream,
        term: 1,
        year: 2024
      });

      if (!Array.isArray(data)) {
        console.error("Unexpected response from /marks:", data);
        setStudents([]);
        return;
      }

      const mappedStudents: Student[] = data.map(item => ({
        id: item.studentId,
        adm: item.admissionNo,
        name: item.name,
        gender: "N/A",
        marks: item.marks,
        pushed: false
      }));

      setStudents(mappedStudents);

      // Update marksData
      setMarksData(prev => ({
        ...prev,
        [activeSubjectId]: data.reduce((acc, item) => {
          acc[item.studentId] = item.marks;
          return acc;
        }, {} as any)
      }));
    } catch (err) {
      console.error("Failed to load students and marks", err);
      setStudents([]);
    }
  }, [activeSubjectId, subjects]);

  useEffect(() => {
    if (activeSubjectId) loadStudentsAndMarks();
  }, [activeSubjectId, loadStudentsAndMarks]);

  const teacherName = user?.name || "Teacher";
  const teacherInitials = initials(teacherName);
  const teacherAvatarColor = avatarColor(teacherName);
  
  const isClassTeacher = user?.roles?.includes("classteacher");
  const hasClassAssignment = user?.classGrade !== null;
  const canSwitchToClassDashboard = isClassTeacher && hasClassAssignment;

  const handleMarkUpdate = (subjectId: string, studentId: string, key: string, value: string) => {
    setMarksData((prev) => {
      const newData = { ...prev };
      if (!newData[subjectId]) newData[subjectId] = {};
      if (!newData[subjectId][studentId]) newData[subjectId][studentId] = { cat1: null, cat2: null, exam: null };
      newData[subjectId][studentId][key as keyof (typeof newData)[string][string]] = value === "" ? null : Math.min(parseInt(value) || 0, key === "exam" ? 100 : 40);
      return newData;
    });
  };

  const handleSaveMarks = async (assignmentId: string) => {
    const currentSubject = subjects.find(s => s.id === assignmentId);
    if (!currentSubject) return;

    const subjectMarks = marksData[assignmentId];
    if (!subjectMarks) return;

    const data = Object.entries(subjectMarks).map(([studentId, marks]) => ({
      studentId,
      ...marks
    }));

    try {
      await api.post("/marks/save", {
        subjectId: currentSubject.subjectId, // Use subject ID
        classGrade: currentSubject.classGrade,
        classStream: currentSubject.classStream,
        term: 1,
        year: 2024,
        marksData: data
      });
      alert("Marks saved successfully!");
    } catch (err) {
      alert("Failed to save marks.");
    }
  };


  const handlePushMarks = (subjectId: string) => {
    setPushedSubjects((prev) => new Set(prev).add(subjectId));
    alert(`Marks pushed for ${subjects.find(s => s.id === subjectId)?.grade}`);
  };

  const getTabTitle = () => {
    const titles: Record<string, string> = { subjects: "My Subjects", marks: "Mark Entry", assessments: "Assessments", progress: "Student Progress", resources: "Resources" };
    return titles[activeTab] || "My Subjects";
  };

  const renderContent = () => {
    if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading dashboard...</div>;
    if (subjects.length === 0) return <div style={{ padding: 40, textAlign: "center" }}>No subjects assigned yet.</div>;

    switch (activeTab) {
      case "subjects":
        return <SubjectsTab subjects={subjects} onSelectSubject={setActiveSubjectId} onEnterMarks={(id) => { setActiveSubjectId(id); setActiveTab("marks"); }} pushedSubjects={pushedSubjects} gc={gc} />;
      case "marks":
        return <MarksTab subjects={subjects} activeSubjectId={activeSubjectId} students={students} marksData={marksData} pushedSubjects={pushedSubjects} pushedStudents={pushedStudents} onSubjectChange={setActiveSubjectId} onMarkUpdate={handleMarkUpdate} onSaveMarks={handleSaveMarks} onPushMarks={handlePushMarks} avatar={avatar} />;
      case "assessments":
        return <AssessmentsTab assessments={[]} />;
      case "progress":
        return <ProgressTab subjects={subjects} activeSubjectId={activeSubjectId} students={students} marksData={marksData} onSubjectChange={setActiveSubjectId} avatar={avatar} gc={gc} />;
      case "resources":
        return <ResourcesTab resources={[]} />;
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
        streamsCount={subjects.length}
        totalStudents={students.length}
        department={user?.department || "General"}
        onLogout={handleLogout}
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
          onLogout={handleLogout}
        />
        <div className={styles.contentArea}>{renderContent()}</div>
      </div>
    </div>
  );
};

export default SubjectTeacherDashboard;
