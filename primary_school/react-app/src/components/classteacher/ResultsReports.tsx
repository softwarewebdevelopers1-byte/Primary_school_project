// components/classteacher/ResultsReports.tsx
import React from "react";
import { DlIcon } from "./shared/Icons";
import { C, FONT } from "./shared/constants";
import { avg, sum, gradeColor, grade } from "./shared/helpers";
import { Avatar } from "./shared/Avatar";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface ResultsReportsProps {
  students: any[];
  subjects: any[];
  term?: number;
  year?: number;
  examType?: string;
}

const normalizeValue = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const isStudentSubject = (student: any, subject: any) => {
  if (subject.isOffered === false) {
    return false;
  }

  if ((subject.enrollmentMode || "compulsory") !== "elective") {
    return true;
  }

  const classGrade = normalizeValue(student?.classGrade);
  const classStream = normalizeValue(student?.classStream);
  const enrollments = Array.isArray(student?.enrolledSubjects)
    ? student.enrolledSubjects
    : [];

  return enrollments.some((entry: any) => {
    const enrollmentClassGrade = normalizeValue(entry?.classGrade) || classGrade;
    const enrollmentClassStream = normalizeValue(entry?.classStream) || classStream;

    return (
      entry?.isActive !== false &&
      String(entry?.subjectId || "").trim() === subject.id &&
      enrollmentClassGrade === classGrade &&
      enrollmentClassStream === classStream
    );
  });
};

const subjectsForStudent = (student: any, subjects: any[]) =>
  subjects.filter((subject) => isStudentSubject(student, subject));

const getEligibleSubjectCount = (student: any, subjects: any[]) => 
  subjectsForStudent(student, subjects).length;

const marksForStudentSubjects = (student: any, subjects: any[]) => {
  const eligibleSubjectIds = new Set(
    subjectsForStudent(student, subjects).map((subject) => subject.id),
  );
  const filteredMarks: Record<string, number> = {};

  Object.entries(student?.marks || {}).forEach(([subjectId, mark]) => {
    if (eligibleSubjectIds.has(subjectId) && typeof mark === "number") {
      filteredMarks[subjectId] = mark;
    }
  });

  return filteredMarks;
};

const SectionHeader: React.FC<{
  eyebrow: string;
  title: string;
  sub?: string;
}> = ({ eyebrow, title, sub }) => (
  <div style={{ marginBottom: "1.6rem" }}>
    <p
      style={{
        fontFamily: FONT.sans,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.09em",
        textTransform: "uppercase",
        color: C.gold,
        margin: "0 0 5px",
      }}
    >
      {eyebrow}
    </p>
    <h2
      style={{
        fontFamily: FONT.serif,
        fontSize: "1.9rem",
        fontWeight: 600,
        color: C.text,
        margin: "0 0 4px",
        letterSpacing: "-0.01em",
      }}
    >
      {title}
    </h2>
    {sub && (
      <p
        style={{
          fontFamily: FONT.sans,
          fontSize: 13,
          color: C.textMuted,
          margin: 0,
        }}
      >
        {sub}
      </p>
    )}
  </div>
);

export const ResultsReports: React.FC<ResultsReportsProps> = ({ 
  students, 
  subjects,
  term = 1,
  year = 2024,
  examType = "opener"
}) => {
  const reports = [
    {
      title: "Full class report",
      desc: `Complete results for all ${students.length} students across all subjects.`,
      tag: "XLSX / PDF",
    },
    {
      title: "Individual result slips",
      desc: "One slip per learner — ready for printing or digital distribution.",
      tag: "PDF",
    },
    {
      title: "Subject summary",
      desc: "Subject-by-subject performance table with class averages.",
      tag: "XLSX",
    },
  ];

  const sortedStudents = [...students].sort(
    (a, b) =>
      avg(marksForStudentSubjects(b, subjects), getEligibleSubjectCount(b, subjects)) -
      avg(marksForStudentSubjects(a, subjects), getEligibleSubjectCount(a, subjects)),
  );
  let rank = 0;
  let previousAverage: number | null = null;
  const rankedStudents = sortedStudents.map((student) => {
    const eligibleCount = getEligibleSubjectCount(student, subjects);
    const studentAverage = avg(marksForStudentSubjects(student, subjects), eligibleCount);
    if (studentAverage !== previousAverage) {
      rank += 1;
      previousAverage = studentAverage;
    }

    return { ...student, rank };
  });
  const topStudent = sortedStudents.length > 0 ? sortedStudents[0] : null;
  const leastStudent = sortedStudents.length > 0 ? sortedStudents[sortedStudents.length - 1] : null;

  const [msg, setMsg] = React.useState<{ text: string, type: "success" | "error" } | null>(null);

  const handleDownload = (type: string, studentName?: string) => {
    try {
      if (type === "Full Merit List" || type === "Full class report" || type === "Subject summary") {
        const doc = new jsPDF("landscape");
        
        doc.setFontSize(16);
        doc.text(`Class Merit List - Term ${term}, ${year} (${examType.toUpperCase()})`, 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 22);

        const tableColumn = ["Rank", "Student", "Admission No", ...subjects.map(s => s.name), "Total", "Avg", "Grade"];
        const tableRows = rankedStudents.map((s) => {
          const studentMarks = marksForStudentSubjects(s, subjects);

          return [
            s.rank,
            s.name,
            s.adm || s.admissionNumber || s.admissionNo || "-",
            ...subjects.map((sub) =>
              isStudentSubject(s, sub) ? studentMarks[sub.id] ?? "-" : "-",
            ),
            sum(studentMarks),
            `${avg(studentMarks, getEligibleSubjectCount(s, subjects))}%`,
            grade(avg(studentMarks, getEligibleSubjectCount(s, subjects))),
          ];
        });

        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 28,
          theme: 'grid',
          styles: { fontSize: 9 },
          headStyles: { fillColor: [201, 150, 61] } // var(--gold)
        });

        doc.save(`Term${term}_Report_${Date.now()}.pdf`);
      } else if (type === "Excel Report") {
        const worksheetData = rankedStudents.map((s) => {
          const studentMarks = marksForStudentSubjects(s, subjects);
          const eligibleCount = getEligibleSubjectCount(s, subjects);
          const average = avg(studentMarks, eligibleCount);
          
          const row: any = {
            Rank: s.rank,
            Student: s.name,
            "Admission No": s.adm || s.admissionNumber || s.admissionNo || "-",
          };
          
          subjects.forEach(sub => {
            row[sub.name] = isStudentSubject(s, sub) ? studentMarks[sub.id] ?? "-" : "N/A";
          });
          
          row.Total = sum(studentMarks);
          row.Average = `${average}%`;
          row.Grade = grade(average);
          
          return row;
        });

        const ws = XLSX.utils.json_to_sheet(worksheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Class Report");
        XLSX.writeFile(wb, `Term${term}_Report_${Date.now()}.xlsx`);
      } else if (type === "Report Slip" || type === "Individual result slips") {
        if (!studentName) {
           setMsg({ text: "Individual slip download requires student selection from the Merit List table.", type: "error" });
           setTimeout(() => setMsg(null), 3500);
           return;
        }
        const slip = sortedStudents.find(s => s.name === studentName);
        if (!slip) return;

        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(20);
        doc.setTextColor(201, 150, 61); // Gold
        doc.text("STUDENT REPORT SLIP", 105, 20, { align: "center" });
        
        doc.setFontSize(12);
        doc.setTextColor(50, 50, 50);
        doc.text(`Name: ${slip.name}`, 20, 40);
        doc.text(`Admission No: ${slip.adm || slip.admissionNumber || slip.admissionNo || "-"}`, 20, 48);
        doc.text(`Term: ${term} | Year: ${year} | Phase: ${examType.toUpperCase()}`, 20, 56);
        
        doc.setLineWidth(0.5);
        doc.line(20, 62, 190, 62);

        const tableCol = ["Subject", "Score (%)", "Grade"];
        const slipSubjects = subjectsForStudent(slip, subjects);
        const slipMarks = marksForStudentSubjects(slip, subjects);
        const tableData = slipSubjects.map(sub => {
          const m = slipMarks[sub.id];
          return [
            sub.name,
            m != null ? m.toString() : "-",
            m != null ? grade(m) : "-"
          ];
        });

        autoTable(doc, {
          head: [tableCol],
          body: tableData,
          startY: 68,
          theme: 'striped',
          headStyles: { fillColor: [201, 150, 61] }
        });

        const finalY = (doc as any).lastAutoTable.finalY || 150;
        
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        const slipEligibleCount = getEligibleSubjectCount(slip, subjects);
        doc.text(`Total Marks: ${sum(slipMarks)}`, 20, finalY + 15);
        doc.text(`Average Score: ${avg(slipMarks, slipEligibleCount)}%`, 20, finalY + 23);
        doc.text(`Final Grade: ${grade(avg(slipMarks, slipEligibleCount))}`, 20, finalY + 31);
        style={{
          background: C.white,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, background: C.goldPale, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontFamily: FONT.serif, fontSize: "1.3rem", fontWeight: 600, color: C.text, margin: 0 }}>
            Class Merit List (Real-time Preview)
          </h3>
          <button
            onClick={() => handleDownload("Full Merit List")}
            style={{
              padding: "7px 12px",
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              fontFamily: FONT.sans,
              fontSize: 12,
              fontWeight: 600,
              color: C.textMid,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <DlIcon /> Download List
          </button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
            <thead>
              <tr style={{ background: C.sand }}>
                <th style={thStyle}>Rank</th>
                <th style={thStyle}>Student</th>
                {subjects.slice(0, 5).map(s => (
                  <th key={s.id} style={{ ...thStyle, textAlign: "center" }}>{s.name.slice(0, 3)}</th>
                ))}
                <th style={{ ...thStyle, textAlign: "center" }}>Total</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Avg</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {rankedStudents.map((s) => {
                const studentMarks = marksForStudentSubjects(s, subjects);
                const eligibleCount = getEligibleSubjectCount(s, subjects);
                const a = avg(studentMarks, eligibleCount);
                return (
                  <tr key={s.id} style={{ borderTop: `1px solid ${C.borderLight}` }}>
                    <td style={tdStyle}>{s.rank}</td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Avatar name={s.name} size={24} />
                        <span style={{ fontWeight: 600 }}>{s.name}</span>
                      </div>
                    </td>
                    {subjects.slice(0, 5).map(sub => {
                      const mark = isStudentSubject(s, sub)
                        ? studentMarks[sub.id]
                        : null;
                      return (
                        <td key={sub.id} style={{ ...tdStyle, textAlign: "center", color: gradeColor(mark || 0) }}>
                          {mark != null ? `${mark}%` : "-"}
                        </td>
                      );
                    })}
                    <td style={{ ...tdStyle, textAlign: "center", fontWeight: 700, color: C.text }}>{sum(studentMarks)}</td>
                    <td style={{ ...tdStyle, textAlign: "center", fontWeight: 700, color: gradeColor(a) }}>{a}%</td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <button
                        onClick={() => handleDownload("Report Slip", s.name)}
                        style={{
                          padding: "5px 10px",
                          background: "transparent",
                          border: `1px solid ${C.border}`,
                          borderRadius: 6,
                          fontFamily: FONT.sans,
                          fontSize: 11,
                          fontWeight: 600,
                          color: C.textMid,
                          cursor: "pointer"
                        }}
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  padding: "11px 16px",
  textAlign: "left",
  fontFamily: FONT.sans,
  fontSize: 10.5,
  fontWeight: 700,
  color: C.textFaint,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
  fontFamily: FONT.sans,
  fontSize: 13,
  color: C.textMid,
};
