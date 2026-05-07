import React, { useEffect, useState, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { api } from "../../lib/api";
import { Class, Student, Subject } from "./types";

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
  stream: string;
  marks: Record<string, number | null>;
  total: number;
  points: number;
  scoredSubjects: number;
  average: number;
  avgPoints: number;
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

const tableCellStyle: React.CSSProperties = {
  padding: "12px",
  color: "var(--text)",
  verticalAlign: "middle",
};

const tableHeadStyle: React.CSSProperties = {
  ...tableCellStyle,
  color: "var(--textM)",
  fontSize: 11,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: ".04em",
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

const markToPoints = (v: number): number => {
  if (v >= 80) return 8;
  if (v >= 65) return 7;
  if (v >= 55) return 6;
  if (v >= 45) return 5;
  if (v >= 35) return 4;
  if (v >= 25) return 3;
  if (v >= 15) return 2;
  return 1;
};

const pointsToGrade = (avgPoints: number): string => {
  const roundedPoints = Math.max(1, Math.min(8, Math.round(avgPoints)));
  if (roundedPoints >= 8) return "EE1";
  if (roundedPoints >= 7) return "EE2";
  if (roundedPoints >= 6) return "ME1";
  if (roundedPoints >= 5) return "ME2";
  if (roundedPoints >= 4) return "AE1";
  if (roundedPoints >= 3) return "AE2";
  if (roundedPoints >= 2) return "BE1";
  return "BE2";
};

export const PerformanceTab: React.FC<PerformanceTabProps> = ({ classes, students, subjects }) => {
  const [selectedId, setSelectedId] = useState(() => {
    const saved = sessionStorage.getItem("selectedPerformanceTarget");
    return saved ? JSON.parse(saved) : "";
  });
  const [performanceRows, setPerformanceRows] = useState<ClassPerformanceRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const uniqueGrades = useMemo(() => {
    const grades = Array.from(new Set(classes.map(c => c.grade)));
    return grades.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [classes]);

  useEffect(() => {
    if (!selectedId && classes.length > 0) {
      setSelectedId(classes[0].id);
    }
  }, [classes, selectedId]);

  const isGradeSelected = selectedId.startsWith("grade:");
  const currentGrade = isGradeSelected ? selectedId.replace("grade:", "") : "";
  const currentClass = !isGradeSelected ? classes.find(c => c.id === selectedId) : null;

  // For grade-wide, we combine all subjects offered in any stream of that grade
  const targetClasses = isGradeSelected ? classes.filter(c => c.grade === currentGrade) : (currentClass ? [currentClass] : []);
  const availableSubjects = useMemo(() => {
    const ids = Array.from(new Set(targetClasses.flatMap(c => c.offeredSubjectIds)));
    return subjects.filter(s => ids.includes(s.id));
  }, [targetClasses, subjects]);

  const targetStudents = useMemo(() => {
    if (isGradeSelected) return students.filter(s => s.classGrade === currentGrade && s.status === "Active");
    return currentClass ? students.filter(s => s.classId === currentClass.id && s.status === "Active") : [];
  }, [isGradeSelected, currentGrade, currentClass, students]);

  const loadPerformance = async () => {
    if (targetStudents.length === 0 || targetClasses.length === 0) {
      setPerformanceRows([]);
      return;
    }
    setIsLoading(true);
    try {
      const rowsByStudent = new Map<string, ClassPerformanceRow>();
      targetStudents.forEach(s => {
        rowsByStudent.set(s.id, {
          id: s.id,
          name: s.name,
          admissionNo: s.adm || s.admissionNo || "-",
          stream: s.classStream || "",
          marks: {},
          total: 0,
          points: 0,
          scoredSubjects: 0,
          average: 0,
          avgPoints: 0,
          rank: 0
        });
      });

      // To speed up, we fetch marks for each class-subject combo
      for (const cls of targetClasses) {
        const clsSubjects = subjects.filter(s => cls.offeredSubjectIds.includes(s.id));
        for (const sub of clsSubjects) {
          const data: any[] = await api.get("/marks", {
            subjectId: sub.id,
            classGrade: cls.grade,
            classStream: cls.stream || "",
            term: cls.term,
            year: cls.year,
            examType: cls.examType
          });
          data.forEach(item => {
            const sid = item.studentId?.toString();
            const row = rowsByStudent.get(sid);
            if (row) row.marks[sub.id] = computeMarkPercentage(item.marks);
          });
        }
      }

      const ranked = Array.from(rowsByStudent.values()).map(row => {
        const scores = Object.values(row.marks).filter((m): m is number => typeof m === "number");
        const total = scores.reduce((a, b) => a + b, 0);
        const points = scores.reduce((a, b) => a + markToPoints(b), 0);
        const avg = scores.length > 0 ? Math.round(total / scores.length) : 0;
        const avgPoints = scores.length > 0 ? Number((points / scores.length).toFixed(1)) : 0;
        return { ...row, total, points, scoredSubjects: scores.length, average: avg, avgPoints };
      }).sort(
        (a, b) =>
          b.avgPoints - a.avgPoints ||
          b.average - a.average ||
          b.points - a.points ||
          b.total - a.total ||
          a.name.localeCompare(b.name)
      );

      let rank = 0;
      let prevAvgPoints = -1;
      let prevAverage = -1;
      let prevPoints = -1;
      let prevTotal = -1;
      ranked.forEach(row => {
        if (
          row.avgPoints !== prevAvgPoints ||
          row.average !== prevAverage ||
          row.points !== prevPoints ||
          row.total !== prevTotal
        ) {
          rank += 1;
          prevAvgPoints = row.avgPoints;
          prevAverage = row.average;
          prevPoints = row.points;
          prevTotal = row.total;
        }
        row.rank = rank;
      });
      setPerformanceRows(ranked);
    } catch (err: any) {
      setMsg({ text: err.message || "Failed to load performance.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPerformance();
  }, [selectedId, targetClasses[0]?.term, targetClasses[0]?.year, targetClasses[0]?.examType]);

  const handleDownloadExcel = () => {
    if (performanceRows.length === 0) return;
    const worksheetData = performanceRows.map(row => {
      const data: any = {
        Rank: row.rank,
        Student: row.name,
        "Adm No": row.admissionNo,
        Stream: row.stream
      };
      availableSubjects.forEach(sub => {
        data[sub.name] = row.marks[sub.id] ?? "-";
      });
      data.Total = row.total;
      data.Points = row.points.toFixed(1);
      data["Avg Pts"] = row.avgPoints.toFixed(1);
      data.Average = `${row.average}%`;
      data.Grade = pointsToGrade(row.avgPoints);
      return data;
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Performance");
    const name = isGradeSelected ? `Grade_${currentGrade}_Combined` : (currentClass?.name || "Class");
    XLSX.writeFile(workbook, `Performance_${name}_${Date.now()}.xlsx`);
    setMsg({ text: "Excel report downloaded successfully.", type: "success" });
  };

  const handleDownloadPDF = () => {
    if (performanceRows.length === 0) return;
    const doc = new jsPDF("landscape");
    const title = isGradeSelected ? `Grade ${currentGrade} (All Streams) Performance Report` : `${currentClass?.name} Performance Report`;
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    const firstCls = targetClasses[0];
    if (firstCls) {
       doc.text(`Term ${firstCls.term}, ${firstCls.year} (${firstCls.examType?.toUpperCase()})`, 14, 22);
    }
    
    autoTable(doc, {
      head: [["Rank", "Student", "Adm No", "Stream", ...availableSubjects.map(s => s.name), "Total", "Pts", "Avg Pts", "Avg", "Grade"]],
      body: performanceRows.map(row => [
        row.rank,
        row.name,
        row.admissionNo,
        row.stream,
        ...availableSubjects.map(s => row.marks[s.id] ?? "-"),
        row.total,
        row.points.toFixed(1),
        row.avgPoints.toFixed(1),
        `${row.average}%`,
        pointsToGrade(row.avgPoints)
      ]),
      startY: 30,
      theme: "grid",
      styles: { fontSize: 7 },
      headStyles: { fillColor: [201, 150, 61] }
    });
    const name = isGradeSelected ? `Grade_${currentGrade}_Combined` : (currentClass?.name || "Class");
    doc.save(`Performance_${name}.pdf`);
  };

  const scoredRows = performanceRows.filter(r => r.scoredSubjects > 0);
  const classAvg = scoredRows.length > 0 ? Math.round(scoredRows.reduce((a, b) => a + b.average, 0) / scoredRows.length) : 0;
  const topStudent = performanceRows[0] || null;

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
          Review performance trends, rankings, and download reports for specific streams or entire grades.
        </p>
      </div>

      <div
        style={{
          ...panelStyle,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: 12,
          alignItems: "stretch",
        }}
      >
        <label style={{ display: "grid", gap: 6 }}>
          <span style={labelStyle}>Select Scope</span>
          <select value={selectedId} onChange={e => { setSelectedId(e.target.value); sessionStorage.setItem("selectedPerformanceTarget", JSON.stringify(e.target.value)); }} style={inputStyle}>
            <optgroup label="Grade-wide (All Streams)">
              {uniqueGrades.map(g => (
                <option key={`grade:${g}`} value={`grade:${g}`}>Grade {g} - Combined</option>
              ))}
            </optgroup>
            <optgroup label="Specific Streams">
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </optgroup>
          </select>
        </label>
        <div style={statBoxStyle}>
          <p style={labelStyle}>{isGradeSelected ? "Grade Average" : "Stream Average"}</p>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--text)" }}>{isLoading ? "..." : `${classAvg}%`}</p>
        </div>
        <div style={statBoxStyle}>
          <p style={labelStyle}>Top Learner</p>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text)", overflowWrap: "anywhere" }}>{isLoading ? "..." : topStudent ? `${topStudent.name} (${topStudent.average}%)` : "N/A"}</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
           <button onClick={handleDownloadExcel} style={{ ...inputStyle, background: "var(--gold)", color: "#fff", cursor: "pointer", fontWeight: 700 }}>Download Excel</button>
           <button onClick={handleDownloadPDF} style={{ ...inputStyle, background: "var(--white)", color: "var(--text)", cursor: "pointer", fontWeight: 700 }}>Download PDF</button>
        </div>
      </div>

      {msg && (
        <div style={{ padding: "10px 14px", borderRadius: 10, background: msg.type === "success" ? "#eaf3de" : "#fdeaea", color: msg.type === "success" ? "#3b6d11" : "#a32d2d", fontSize: 13, fontWeight: 600 }}>
          {msg.text}
        </div>
      )}

      <div style={{ ...panelStyle, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <table style={{ width: "100%", minWidth: 760, borderCollapse: "collapse", color: "var(--text)" }}>
          <thead>
            <tr style={{ textAlign: "left", background: "var(--sand)" }}>
              <th style={tableHeadStyle}>Rank</th>
              <th style={tableHeadStyle}>Student</th>
              <th style={tableHeadStyle}>Adm No</th>
              <th style={tableHeadStyle}>Stream</th>
              <th style={tableHeadStyle}>Points</th>
              <th style={tableHeadStyle}>Avg Pts</th>
              <th style={tableHeadStyle}>Average</th>
              <th style={tableHeadStyle}>Grade</th>
              <th style={{ ...tableHeadStyle, textAlign: "right" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={9} style={{ ...tableCellStyle, padding: "40px", textAlign: "center" }}>Loading performance data...</td></tr>
            ) : performanceRows.length === 0 ? (
              <tr><td colSpan={9} style={{ ...tableCellStyle, padding: "40px", textAlign: "center", color: "var(--textMut)" }}>No results found for this scope.</td></tr>
            ) : performanceRows.map(row => (
              <tr key={row.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={tableCellStyle}>{row.rank}</td>
                <td style={{ ...tableCellStyle, fontWeight: 600 }}>{row.name}</td>
                <td style={{ ...tableCellStyle, color: "var(--textMut)" }}>{row.admissionNo}</td>
                <td style={{ ...tableCellStyle, fontSize: 12 }}>{row.stream}</td>
                <td style={{ ...tableCellStyle, fontWeight: 700, color: "var(--gold)" }}>{row.points.toFixed(1)}</td>
                <td style={{ ...tableCellStyle, fontWeight: 700 }}>{row.avgPoints.toFixed(1)}</td>
                <td style={tableCellStyle}>{row.average}%</td>
                <td style={{ ...tableCellStyle, fontWeight: 700 }}>{pointsToGrade(row.avgPoints)}</td>
                <td style={{ ...tableCellStyle, textAlign: "right", fontWeight: 700 }}>{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
