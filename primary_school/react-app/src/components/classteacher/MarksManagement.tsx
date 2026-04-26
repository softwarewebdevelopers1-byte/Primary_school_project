// components/classteacher/MarksManagement.tsx
import React, { useState, useEffect, useCallback } from "react";
import { C } from "./shared/constants";
import { api } from "../../lib/api";
import { MarksEntry } from "../shared/MarksEntry";
import { avatar } from "../../lib/dashboardHelpers";
import { MarksData, Subject, Student } from "../subjectteacher/types";

interface MarksManagementProps {
  students: any[];
  subjects: any[];
  onRefresh?: () => void;
  user: any;
}

export const MarksManagement: React.FC<MarksManagementProps> = ({ students, subjects, onRefresh, user }) => {
  const [activeSubjectId, setActiveSubjectId] = useState("");
  const [marksData, setMarksData] = useState<MarksData>({});
  const [msg, setMsg] = useState<{ text: string, type: "success" | "error" } | null>(null);
  const [term, setTerm] = useState<number>(user?.term || 1);
  const [year, setYear] = useState<number>(user?.year || 2024);
  const [examType, setExamType] = useState<string>(user?.examType || "opener");

  // Sync with global user state (e.g. after Admin update)
  useEffect(() => {
    if (user) {
      setTerm(user.term || 1);
      setYear(user.year || 2024);
      setExamType(user.examType || "opener");
    }
  }, [user]);

  useEffect(() => {
    if (subjects.length > 0 && !activeSubjectId) {
      setActiveSubjectId(subjects[0].id || subjects[0]._id);
    }
  }, [subjects, activeSubjectId]);

  const loadDetailedMarks = useCallback(async () => {
    if (!activeSubjectId) return;
    try {
      const data: any[] = await api.get("/marks", {
        subjectId: activeSubjectId,
        classGrade: user.classGrade,
        classStream: user.classStream,
        term: term,
        year: year,
        examType: examType
      });

      setMarksData(prev => ({
        ...prev,
        [activeSubjectId]: data.reduce((acc, item) => {
          const sid = item.studentId.toString();
          acc[sid] = item.marks;
          return acc;
        }, {} as any)
      }));
    } catch (err) {
      console.error("Failed to load detailed marks", err);
    }
  }, [activeSubjectId, user.classGrade, user.classStream, term, year, examType]);

  // Clear marks when switching period to ensure "Specific term specific exam at specific year"
  useEffect(() => {
    setMarksData({});
  }, [term, year, examType]);

  useEffect(() => {
    if (activeSubjectId) loadDetailedMarks();
  }, [activeSubjectId, loadDetailedMarks, term, examType]);

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

  const handleSaveMarks = async (subjectId: string, catConfigs?: any) => {
    const subjectMarks = marksData[subjectId];
    if (!subjectMarks) return;

    setMsg(null);
    try {
      const data = Object.entries(subjectMarks).map(([studentId, marks]) => ({
        studentId,
        ...marks
      }));

      await api.post("/marks/save", {
        subjectId,
        classGrade: user.classGrade,
        classStream: user.classStream,
        term: term,
        year: year,
        examType: examType,
        marksData: data,
        catConfigs
      });
      setMsg({ text: "Marks saved successfully!", type: "success" });
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setMsg({ text: "Failed to save: " + err.message, type: "error" });
    }
  };

  // Map students and subjects to the expected types for MarksEntry
  const mappedStudents: Student[] = students.map(s => {
    const sid = (s.id || s._id || "").toString();
    const studentMarks = (marksData[activeSubjectId] && marksData[activeSubjectId][sid]) || {
      cat1: null, cat2: null, cat3: null, cat4: null, cat5: null, 
      cat1Max: 40, cat2Max: 40, cat3Max: 40, cat4Max: 40, cat5Max: 40,
      exam: null, examMax: 100, finalScore: null
    };

    return {
      id: sid,
      name: s.name || s.studentsName,
      adm: s.admissionNo || s.ADM,
      gender: s.gender || "N/A",
      marks: studentMarks,
      pushed: false
    };
  });

  const mappedSubjects: Subject[] = subjects.map(s => ({
    id: s.id || s._id,
    name: s.name,
    grade: `${user.classGrade}${user.classStream}`,
    subjectId: s.id || s._id,
    classGrade: user.classGrade,
    classStream: user.classStream,
    students: students.length,
    avg: 0,
    pushed: false,
    term: 1,
    lastAssess: "N/A"
  } as Subject));

  if (subjects.length === 0) {
    return <div style={{ padding: 40, textAlign: "center" }}>No subjects found.</div>;
  }

  return (
    <div className="ct-anim">
      {msg && (
        <div style={{ 
          padding: "10px 20px", 
          marginBottom: 15, 
          borderRadius: 8, 
          background: msg.type === "success" ? C.greenLight : "#fdeaea",
          color: msg.type === "success" ? C.successText : C.dangerText,
          fontSize: 13,
          fontWeight: 600
        }}>
          {msg.text}
        </div>
      )}
      
      <MarksEntry
        mode="class"
        subjects={mappedSubjects}
        activeSubjectId={activeSubjectId}
        students={mappedStudents}
        marksData={marksData}
        onSubjectChange={setActiveSubjectId}
        onMarkUpdate={handleMarkUpdate}
        onSaveMarks={handleSaveMarks}
        onConfigUpdate={handleConfigUpdate}
        onRemoveCat={handleRemoveCat}
        avatar={avatar}
        term={term}
        year={year}
        examType={examType}
        onTermChange={setTerm}
        onExamTypeChange={setExamType}
      />
    </div>
  );
};
