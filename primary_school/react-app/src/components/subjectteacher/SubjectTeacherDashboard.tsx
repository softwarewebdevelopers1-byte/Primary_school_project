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

import { initials, avatarColor, avatar, gc } from "../../lib/dashboardHelpers";

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
        students: a.studentCount || 0,
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
        id: item.studentId.toString(),
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
          const sid = item.studentId.toString();
          acc[sid] = item.marks;
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
  const canSwitchToClassDashboard = isClassTeacher;

  const handleMarkUpdate = (subjectId: string, studentId: string, key: string, value: string) => {
    setMarksData((prev) => {
      const updatedSubjectMarks = { ...(prev[subjectId] || {}) };
      const updatedStudentMarks = { 
        ...(updatedSubjectMarks[studentId] || {
          cat1: null, cat2: null, cat3: null, cat4: null, cat5: null, 
          cat1Max: 40, cat2Max: 40, cat3Max: 40, cat4Max: 40, cat5Max: 40,
          exam: null, examMax: 100, finalScore: null 
        })
      };

      let n: string | number | null = value;
      if (n === "") {
        n = null;
      } else {
        const num = Number(n);
        if (!isNaN(num)) {
          const maxKey = `${key}Max`;
          const max = key === "finalScore" ? 100 : (updatedStudentMarks as any)[maxKey] || (key === "exam" ? 100 : 40);
          if (num > max) {
            n = max;
          } else if (num < 0) {
            n = 0;
          }
        } else {
          n = null;
        }
      }

      updatedStudentMarks[key as any] = n as any;
      updatedSubjectMarks[studentId] = updatedStudentMarks;

      return {
        ...prev,
        [subjectId]: updatedSubjectMarks
      };
    });
  };

  const handleConfigUpdate = (subjectId: string, key: string, value: number | string | null) => {
    setMarksData((prev) => {
      const newData = { ...prev };
      if (!newData[subjectId]) return prev;
      
      const updatedSubjectMarks = { ...newData[subjectId] };
      Object.keys(updatedSubjectMarks).forEach(studentId => {
        updatedSubjectMarks[studentId] = {
          ...updatedSubjectMarks[studentId],
          [key]: value
        };
      });
      newData[subjectId] = updatedSubjectMarks;
      return newData;
    });
  };

  const handleRemoveCat = (subjectId: string, catIndex: number) => {
    setMarksData(prev => {
      const updatedSubjectMarks = { ...(prev[subjectId] || {}) };
      Object.keys(updatedSubjectMarks).forEach(studentId => {
        updatedSubjectMarks[studentId] = {
          ...updatedSubjectMarks[studentId],
          [`cat${catIndex}`]: null,
          [`cat${catIndex}Max`]: 40
        };
      });
      return {
        ...prev,
        [subjectId]: updatedSubjectMarks
      };
    });
  };

  const handleSaveMarks = async (assignmentId: string, catConfigs?: any) => {
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
        subjectId: currentSubject.subjectId,
        classGrade: currentSubject.classGrade,
        classStream: currentSubject.classStream,
        term: 1,
        year: 2024,
        marksData: data,
        catConfigs
      });
      alert("Marks saved successfully!");
    } catch (err) {
      alert("Failed to save marks.");
    }
  };


  const handlePushMarks = async (subjectId: string) => {
    const currentSubject = subjects.find(s => s.id === subjectId);
    if (!currentSubject) return;

    const subjectMarks = marksData[subjectId];
    if (!subjectMarks) return;

    const data = Object.entries(subjectMarks).map(([studentId, marks]) => ({
      studentId,
      ...marks
    }));

    try {
      await api.post("/marks/save", {
        subjectId: currentSubject.subjectId,
        classGrade: currentSubject.classGrade,
        classStream: currentSubject.classStream,
        term: 1,
        year: 2024,
        marksData: data
      });
      setPushedSubjects((prev) => new Set(prev).add(subjectId));
      alert(`Marks saved and pushed for ${currentSubject.grade}`);
    } catch (err) {
      alert("Failed to push marks.");
    }
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
        return <MarksTab subjects={subjects} activeSubjectId={activeSubjectId} students={students} marksData={marksData} pushedSubjects={pushedSubjects} pushedStudents={pushedStudents} onSubjectChange={setActiveSubjectId} onMarkUpdate={handleMarkUpdate} onSaveMarks={handleSaveMarks} onConfigUpdate={handleConfigUpdate} onRemoveCat={handleRemoveCat} onPushMarks={handlePushMarks} avatar={avatar} />;
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
