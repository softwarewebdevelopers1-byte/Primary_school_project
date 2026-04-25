// components/classteacher/MarksManagement.tsx
import React, { useState, useEffect, useCallback } from "react";
import { C, FONT } from "./shared/constants";
import { api } from "../../lib/api";
import { MarksEntry } from "../shared/MarksEntry";
import { avatar } from "../../lib/dashboardHelpers";
import { MarksData, Subject, Student } from "../subjectteacher/types";

interface MarksManagementProps {
  students: any[];
  subjects: any[];
}

export const MarksManagement: React.FC<MarksManagementProps> = ({ students, subjects }) => {
  const [activeSubjectId, setActiveSubjectId] = useState("");
  const [marksData, setMarksData] = useState<MarksData>({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string, type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (subjects.length > 0 && !activeSubjectId) {
      setActiveSubjectId(subjects[0].id || subjects[0]._id);
    }
  }, [subjects, activeSubjectId]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const loadDetailedMarks = useCallback(async () => {
    if (!activeSubjectId) return;
    setLoading(true);
    try {
      const data: any[] = await api.get("/marks", {
        params: {
          subjectId: activeSubjectId,
          classGrade: user.classGrade,
          classStream: user.classStream,
          term: 1,
          year: 2024
        }
      });

      setMarksData(prev => ({
        ...prev,
        [activeSubjectId]: data.reduce((acc, item) => {
          acc[item.studentId] = item.marks;
          return acc;
        }, {} as any)
      }));
    } catch (err) {
      console.error("Failed to load detailed marks", err);
    } finally {
      setLoading(false);
    }
  }, [activeSubjectId, user.classGrade, user.classStream]);

  useEffect(() => {
    loadDetailedMarks();
  }, [loadDetailedMarks]);

  const handleMarkUpdate = (subjectId: string, studentId: string, key: string, value: string) => {
    setMarksData((prev) => {
      const newData = { ...prev };
      if (!newData[subjectId]) newData[subjectId] = {};
      if (!newData[subjectId][studentId]) newData[subjectId][studentId] = { 
        cat1: null, cat2: null, cat3: null, cat4: null, cat5: null, 
        cat1Max: 40, cat2Max: 40, cat3Max: 40, cat4Max: 40, cat5Max: 40,
        exam: null, examMax: 100, finalScore: null 
      };
      
      let n: number | null = value === "" ? null : Number(value);
      if (n !== null && isNaN(n)) n = null;

      // Only clamp if not 'finalScore'
      if (key !== "finalScore") {
        const maxKey = `${key}Max`;
        const max = (newData[subjectId][studentId] as any)[maxKey] || (key === "exam" ? 100 : 40);
        if (n !== null) n = Math.max(0, Math.min(n, max));
      } else if (n !== null) {
        n = Math.max(0, Math.min(n, 100));
      }

      newData[subjectId][studentId][key as any] = n;
      return newData;
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
        term: 1,
        year: 2024,
        marksData: data,
        catConfigs
      });
      setMsg({ text: "Marks saved successfully!", type: "success" });
    } catch (err: any) {
      setMsg({ text: "Failed to save: " + err.message, type: "error" });
    }
  };

  // Map students and subjects to the expected types for MarksEntry
  const mappedStudents: Student[] = students.map(s => ({
    id: s.id || s._id,
    name: s.name || s.studentsName,
    adm: s.admissionNo || s.ADM,
    marks: (marksData[activeSubjectId] && marksData[activeSubjectId][s.id || s._id]) || {
      cat1: null, cat2: null, cat3: null, cat4: null, cat5: null, exam: null, finalScore: null
    },
    pushed: false
  }));

  const mappedSubjects: Subject[] = subjects.map(s => ({
    id: s.id || s._id,
    name: s.name,
    grade: `${user.classGrade}${user.classStream}`,
    subjectId: s.id || s._id,
    classGrade: user.classGrade,
    classStream: user.classStream,
    studentCount: students.length
  }));

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
        avatar={avatar}
      />
    </div>
  );
};
