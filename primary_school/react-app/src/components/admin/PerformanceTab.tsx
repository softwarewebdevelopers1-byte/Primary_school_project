import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { api } from "../../lib/api";
import { Class, Student, Subject } from "./types";
import { C } from "../classteacher/shared/constants";

interface PerformanceTabProps {
  classes: Class[];
  students: Student[];
  subjects: Subject[];
  avatar: (name: string, size: number) => string;
}

interface ClassPerformanceRow {
  id: string;
  name: string;
  admissionNo: string;
  marks: Record<string, number | null>;
  total: number;
  scoredSubjects: number;
  average: number;
  rank: number;
}

const panelStyle: React.CSSProperties = {
  background: "var(--white)",
  border: "1px solid var(--border)",
  borderRadius: 13,
  padding: "1.1rem 1.2rem",
};

const statBoxStyle: React.CSSProperties = {
  background: "var(--sand)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: "10px 12px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1.5px solid var(--border)",
  borderRadius: 8,
  fontSize: 13.5,
  color: "var(--text)",
  background: "var(--cream)",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: "var(--textMut)",
  textTransform: "uppercase",
  letterSpacing: ".05em",
  marginBottom: 6,
};

const toFiniteNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : null;
};

const computeMarkPercentage = (marks: any): number | null => {
  const finalScore = toFiniteNumber(marks?.finalScore);
  if (finalScore !== null) return Math.min(100, Math.max(0, Math.round(finalScore)));

  const cats = [marks?.cat1, marks?.cat2, marks?.cat3, marks?.cat4, marks?.cat5];
  const catMaxes = [marks?.cat1Max, marks?.cat2Max, marks?.cat3Max, marks?.cat4Max, marks?.cat5Max];
  const exam = toFiniteNumber(marks?.exam);
  const examMax = toFiniteNumber(marks?.examMax) ?? 100;
  
  let totalScore = 0;
  let totalMax = 0;

  cats.forEach((cat, i) => {
    const score = toFiniteNumber(cat);
    if (score !== null) {
      totalScore += score;
      totalMax += toFiniteNumber(catMaxes[i]) ?? 40;
    }
  });

  if (exam !== null) {
    totalScore += exam;
    totalMax += examMax;
  }

  return totalMax <= 0 ? null : Math.round((totalScore / totalMax) * 100);
};

const gradeFromAverage = (avg: number): string => {
  if (avg >= 80) return "A";
  if (avg >= 75) return "A-";
  if (avg >= 70) return "B+";
  if (avg >= 65) return "B";
  if (avg >= 60) return "B-";
  if (avg >= 55) return "C+";
  if (avg >= 50) return "C";
  if (avg >= 45) return "C-";
  if (avg >= 40) return "D+";
  if (avg >= 35) return "D";
  if (avg >= 30) return "D-";
  return "E";
};

export const PerformanceTab: React.FC<PerformanceTabProps> = ({ classes, students, subjects }) => {
  const [selectedClassId, setSelectedClassId] = useState(() => {
    const saved = sessionStorage.getItem("selectedClass");
    return saved ? JSON.parse(saved) : "";
  });
  const [classPerformanceRows, setClassPerformanceRows] = useState<ClassPerformanceRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!selectedClassId && classes.length > 0) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const availableSubjects = currentClass ? subjects.filter(s => currentClass.offeredSubjectIds.includes(s.id)) : [];
  const classStudents = currentClass ? students.filter(s => s.classId === currentClass.id) : [];

  const loadPerformance = async () => {
    if (!currentClass || classStudents.length === 0) return;
    setIsLoading(true);
    try {
      const rowsByStudent = new Map<string, ClassPerformanceRow>();
      classStudents.forEach(s => {
        rowsByStudent.set(s.id, {
          id: s.id,
          name: s.name,
          admissionNo: s.adm || s.admissionNo || "-",
          marks: {},
          total: 0,
          scoredSubjects: 0,
          average: 0,
          rank: 0
        });
      });

      for (const sub of availableSubjects) {
        const data: any[] = await api.get("/marks", {
          subjectId: sub.id,
          classGrade: currentClass.grade,
          classStream: currentClass.stream || "",
          term: currentClass.term,
          year: currentClass.year,
          examType: currentClass.examType
        });
        data.forEach(item => {
          const sid = item.studentId?.toString();
          const row = rowsByStudent.get(sid);
          if (row) row.marks[sub.id] = computeMarkPercentage(item.marks);
        });
      }

      const ranked = Array.from(rowsByStudent.values()).map(row => {
        const scores = Object.values(row.marks).filter((m): m is number => typeof m === "number");
        const total = scores.reduce((a, b) => a + b, 0);
        const avg = scores.length > 0 ? Math.round(total / scores.length) : 0;
        return { ...row, total, scoredSubjects: scores.length, average: avg };
      }).sort((a, b) => b.average - a.average || b.total - a.total || a.name.localeCompare(b.name));

      let rank = 0;
      let prevAvg = -1;
      let prevTotal = -1;
      ranked.forEach(row => {
        if (row.average !== prevAvg || row.total !== prevTotal) {
          rank += 1;
          prevAvg = row.average;
          prevTotal = row.total;
        }
        row.rank = rank;
      });
      setClassPerformanceRows(ranked);
    } catch (err: any) {
      setMsg({ text: err.message || "Failed to load performance.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPerformance();
  }, [selectedClassId, currentClass?.term, currentClass?.year, currentClass?.examType]);

  const handleDownloadExcel = () => {
    if (classPerformanceRows.length === 0) return;
    const worksheetData = classPerformanceRows.map(row => {
      const data: any = {
        Rank: row.rank,
        Student: row.name,
        "Adm No": row.admissionNo,
      };
      availableSubjects.forEach(sub => {
        data[sub.name] = row.marks[sub.id] ?? "-";
      });
      data.Total = row.total;
      data.Average = `${row.average}%`;
      data.Grade = gradeFromAverage(row.average);
      return data;
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Performance");
    XLSX.writeFile(workbook, `Performance_${currentClass?.name}_${Date.now()}.xlsx`);
    setMsg({ text: "Excel report downloaded successfully.", type: "success" });
  };

  const handleDownloadPDF = () => {
    if (!currentClass || classPerformanceRows.length === 0) return;
    const doc = new jsPDF("landscape");
    doc.setFontSize(16);
    doc.text(`${currentClass.name} Performance Report`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Term ${currentClass.term}, ${currentClass.year} (${currentClass.examType?.toUpperCase()})`, 14, 22);
    
    autoTable(doc, {
      head: [["Rank", "Student", "Adm No", ...availableSubjects.map(s => s.name), "Total", "Avg", "Grade"]],
      body: classPerformanceRows.map(row => [
        row.rank,
        row.name,
        row.admissionNo,
        ...availableSubjects.map(s => row.marks[s.id] ?? "-"),
        row.total,
        `${row.average}%`,
        gradeFromAverage(row.average)
      ]),
      startY: 30,
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [201, 150, 61] }
    });
    doc.save(`Performance_${currentClass.name}.pdf`);
  };

  const scoredRows = classPerformanceRows.filter(r => r.scoredSubjects > 0);
  const classAvg = scoredRows.length > 0 ? Math.round(scoredRows.reduce((a, b) => a + b.average, 0) / scoredRows.length) : 0;
  const topStudent = classPerformanceRows[0] || null;

  return (
    <div className="anim" style={{ display: "grid", gap: 16 }}>
       <div style={{ display: "grid", gap: 6 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: ".09em", margin: 0 }}>
          Analytics
        </p>
        <h2 style={{ margin: 0, fontFamily: "var(--serif)", fontSize: "1.8rem", color: "var(--text)" }}>
          Performance & Reports
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: "var(--textMut)" }}>
          Review class performance trends, rankings, and download consolidated reports in Excel or PDF format.
        </p>
      </div>

      <div style={{ ...panelStyle, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={labelStyle}>Select Class</span>
          <select value={selectedClassId} onChange={e => { setSelectedClassId(e.target.value); sessionStorage.setItem("selectedClass", JSON.stringify(e.target.value)); }} style={inputStyle}>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <div style={statBoxStyle}>
          <p style={labelStyle}>Class Average</p>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{isLoading ? "..." : `${classAvg}%`}</p>
        </div>
        <div style={statBoxStyle}>
          <p style={labelStyle}>Top Learner</p>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{isLoading ? "..." : topStudent ? `${topStudent.name} (${topStudent.average}%)` : "N/A"}</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
           <button onClick={handleDownloadExcel} style={{ ...inputStyle, background: "var(--gold)", color: "#fff", cursor: "pointer", fontWeight: 700 }}>Excel</button>
           <button onClick={handleDownloadPDF} style={{ ...inputStyle, background: "var(--white)", cursor: "pointer", fontWeight: 700 }}>PDF</button>
        </div>
      </div>

      {msg && (
        <div style={{ padding: "10px 14px", borderRadius: 10, background: msg.type === "success" ? "#eaf3de" : "#fdeaea", color: msg.type === "success" ? "#3b6d11" : "#a32d2d", fontSize: 13, fontWeight: 600 }}>
          {msg.text}
        </div>
      )}

      <div style={{ ...panelStyle, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", background: "var(--sand)" }}>
              <th style={{ padding: "12px" }}>Rank</th>
              <th style={{ padding: "12px" }}>Student</th>
              <th style={{ padding: "12px" }}>Adm No</th>
              <th style={{ padding: "12px" }}>Average</th>
              <th style={{ padding: "12px" }}>Grade</th>
              <th style={{ padding: "12px", textAlign: "right" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} style={{ padding: "40px", textAlign: "center" }}>Loading class performance...</td></tr>
            ) : classPerformanceRows.map(row => (
              <tr key={row.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "12px" }}>{row.rank}</td>
                <td style={{ padding: "12px", fontWeight: 600 }}>{row.name}</td>
                <td style={{ padding: "12px", color: "var(--textMut)" }}>{row.admissionNo}</td>
                <td style={{ padding: "12px", fontWeight: 700, color: "var(--gold)" }}>{row.average}%</td>
                <td style={{ padding: "12px" }}>{gradeFromAverage(row.average)}</td>
                <td style={{ padding: "12px", textAlign: "right", fontWeight: 700 }}>{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
