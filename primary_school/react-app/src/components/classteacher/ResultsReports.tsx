import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { DlIcon } from "./shared/Icons";
import { C, FONT } from "./shared/constants";
import { gradeBg, gradeColor, getSubjectRemark, getSubId, isStudentSubject, marksForStudentSubjects, subjectsForStudent, sum, sumPoints } from "./shared/helpers";
import { Avatar } from "./shared/Avatar";
import { resolveCbcBand, useCbcGradingBands } from "../../lib/cbcGrading";

interface ResultsReportsProps {
  students: any[];
  subjects: any[];
  term?: number;
  year?: number;
  examType?: string;
}

<<<<<<< HEAD
=======
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
    (a, b) => {
      const aMarks = marksForStudentSubjects(a, subjects);
      const bMarks = marksForStudentSubjects(b, subjects);
      return sumPoints(bMarks) - sumPoints(aMarks);
    }
  );
  let rank = 0;
  let previousPoints: number | null = null;
  const rankedStudents = sortedStudents.map((student) => {
    const studentMarks = marksForStudentSubjects(student, subjects);
    const totalPoints = sumPoints(studentMarks);
    if (totalPoints !== previousPoints) {
      rank += 1;
      previousPoints = totalPoints;
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

        const tableColumn = ["Rank", "Student", "ADM", ...subjects.map(s => s.name.slice(0,3).toUpperCase()), "T.Pts", "Avg.Pts", "Grade"];
        const tableRows = rankedStudents.map((s) => {
          const studentMarks = marksForStudentSubjects(s, subjects);
          const attemptedCount = getAttemptedSubjectCount(s, subjects);
          const totalPoints = sumPoints(studentMarks);
          const avgPoints = totalPoints / (attemptedCount || 1);

          return [
            s.rank,
            s.name,
            s.adm || s.admissionNumber || s.admissionNo || "-",
            ...subjects.map((sub) => {
              const m = isStudentSubject(s, sub) ? studentMarks[getSubId(sub.id)] : null;
              return m != null ? `${m}` : "-";
            }),
            totalPoints.toFixed(1),
            avgPoints.toFixed(1),
            pointsToGrade(avgPoints),
          ];
        });

        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 28,
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [30, 30, 30], textColor: [255, 255, 255], fontStyle: 'bold' },
          columnStyles: {
            0: { fontStyle: 'bold', halign: 'center' },
            [tableColumn.length - 3]: { fontStyle: 'bold', fillColor: [230, 230, 230] },
            [tableColumn.length - 2]: { fontStyle: 'bold', fillColor: [230, 230, 230] },
            [tableColumn.length - 1]: { fontStyle: 'bold' }
          }
        });

        doc.save(`CBC_MeritList_Term${term}_${Date.now()}.pdf`);
      } else if (type === "Excel Report") {
        const worksheetData = rankedStudents.map((s) => {
          const studentMarks = marksForStudentSubjects(s, subjects);
          const totalPoints = sumPoints(studentMarks);
          const attemptedCount = getAttemptedSubjectCount(s, subjects);
          const avgPoints = totalPoints / (attemptedCount || 1);
          
          return [
            s.rank,
            s.name,
            s.adm || s.admissionNumber || s.admissionNo || "-",
            ...subjects.map(sub => isStudentSubject(s, sub) ? (studentMarks[getSubId(sub.id)] ?? "-") : "N/A"),
            totalPoints.toFixed(1),
            avgPoints.toFixed(1),
            pointsToGrade(avgPoints)
          ];
        });

        const worksheet = XLSX.utils.aoa_to_sheet([
          ["Rank", "Student Name", "ADM", ...subjects.map(s => s.name), "Total Pts", "Avg Pts", "Grade"],
          ...worksheetData
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, worksheet, "Class Report");
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

        const tableCol = ["Subject", "Score (%)", "Pts", "Remark"];
        const slipSubjects = subjectsForStudent(slip, subjects);
        const slipMarks = marksForStudentSubjects(slip, subjects);
        const slipTotalMarks = sum(slipMarks);
        const slipTotalPoints = sumPoints(slipMarks);

        const tableData = slipSubjects.map(sub => {
          const m = slipMarks[getSubId(sub.id)];
          const p = m != null ? gradePoints(m).toFixed(1) : "-";
          const remark = m != null ? getSubjectRemark(m) : "-";
          return [
            sub.name,
            m != null ? `${m}%` : "-",
            p,
            remark
          ];
        });

        // Add Summary Row
        tableData.push([
          { content: "TOTAL", styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } },
          { content: `${slipTotalMarks}%`, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } },
          { content: slipTotalPoints.toFixed(1), styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } },
          { content: "", styles: { fillColor: [240, 240, 240] } }
        ]);

        autoTable(doc, {
          head: [tableCol],
          body: tableData,
          startY: 68,
          theme: 'grid',
          headStyles: { fillColor: [30, 30, 30], textColor: [255, 255, 255] },
          styles: { fontSize: 10, cellPadding: 4 },
          columnStyles: {
            3: { cellWidth: 60 }
          }
        });

        const finalY = (doc as any).lastAutoTable.finalY || 150;
        
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        const slipAttemptedCount = getAttemptedSubjectCount(slip, subjects);
        const slipAvgPoints = slipTotalPoints / (slipAttemptedCount || 1);

        doc.text(`Mean Grade: ${pointsToGrade(slipAvgPoints)}`, 20, finalY + 15);
        doc.text(`Total Points: ${slipTotalPoints.toFixed(1)}`, 20, finalY + 23);
        doc.text(`Average Points: ${slipAvgPoints.toFixed(1)}`, 20, finalY + 31);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.text("CBC Grading Scale: EE1=8, EE2=7, ME1=6, ME2=5, AE1=4, AE2=3, BE1=2, BE2=1", 105, 280, { align: "center" });

        doc.save(`${slip.name.replace(/\s+/g, '_')}_Report.pdf`);
      }
      setMsg({ text: `Successfully downloaded ${type}${studentName ? ` for ${studentName}` : ""}`, type: "success" });
    } catch (err) {
      setMsg({ text: `Failed to download ${type}`, type: "error" });
    }
    setTimeout(() => setMsg(null), 3500);
  };

  return (
    <div className="ct-anim" style={{ display: "grid", gap: 30 }}>
      <div>
        <SectionHeader
          eyebrow="Reports"
          title="Results & reports"
          sub={`Download and review performance summaries for Term ${term}, ${year} (${examType}).`}
        />
        {msg && (
          <div style={{ 
            padding: "10px 20px", 
            marginBottom: 15, 
            borderRadius: 8, 
            background: msg.type === "success" ? "#eaf3de" : "#fdeaea",
            color: msg.type === "success" ? "#3b6d11" : "#a32d2d",
            fontSize: 13,
            fontWeight: 600
          }}>
            {msg.text}
          </div>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {reports.map(({ title, desc, tag }) => (
            <div
              key={title}
              className="ct-card ct-metric"
              style={{
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: "1.4rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 10,
                }}
              >
                <h3
                  style={{
                    fontFamily: FONT.serif,
                    fontSize: "1.15rem",
                    fontWeight: 600,
                    color: C.text,
                  }}
                >
                  {title}
                </h3>
                <span
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    background: C.goldLight,
                    color: C.gold,
                    padding: "3px 9px",
                    borderRadius: 12,
                    flexShrink: 0,
                  }}
                >
                  {tag}
                </span>
              </div>
              <p
                style={{
                  fontFamily: FONT.sans,
                  fontSize: 13,
                  color: C.textMuted,
                  lineHeight: 1.6,
                  marginBottom: "1.2rem",
                }}
              >
                {desc}
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="ct-actionbtn"
                  onClick={() => handleDownload(title === "Individual result slips" ? title : "Excel Report")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "9px 12px",
                    background: C.sand,
                    border: `1px solid ${C.border}`,
                    borderRadius: 9,
                    fontFamily: FONT.sans,
                    fontSize: 12,
                    fontWeight: 600,
                    color: C.textMid,
                    cursor: "pointer",
                    flex: 1,
                    justifyContent: "center",
                  }}
                >
                  <DlIcon /> {title === "Individual result slips" ? "Download PDF" : "Excel"}
                </button>
                {title !== "Individual result slips" && (
                  <button
                    className="ct-actionbtn"
                    onClick={() => handleDownload(title)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "9px 12px",
                      background: C.white,
                      border: `1px solid ${C.border}`,
                      borderRadius: 9,
                      fontFamily: FONT.sans,
                      fontSize: 12,
                      fontWeight: 600,
                      color: C.textMid,
                      cursor: "pointer",
                      flex: 1,
                      justifyContent: "center",
                    }}
                  >
                    <DlIcon /> PDF
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {sortedStudents.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          <div style={{ background: C.greenLight, border: `1px solid ${C.green}`, padding: "16px", borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar name={topStudent!.name} size={40} />
            <div>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: C.green, textTransform: "uppercase" }}>Top Student</p>
              <h4 style={{ margin: "2px 0", fontSize: 16, color: C.text, fontFamily: FONT.serif }}>{topStudent!.name}</h4>
              <p style={{ margin: 0, fontSize: 13, color: C.textMuted }}>
                Grade: <strong>{pointsToGrade(sumPoints(marksForStudentSubjects(topStudent!, subjects)) / (getEligibleSubjectCount(topStudent!, subjects) || 1))}</strong>
                {" "}| Points: <strong>{sumPoints(marksForStudentSubjects(topStudent!, subjects)).toFixed(1)}</strong>
              </p>
            </div>
          </div>
          <div style={{ background: "#fdeaea", border: `1px solid ${C.dangerBg}`, padding: "16px", borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar name={leastStudent!.name} size={40} />
            <div>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: C.dangerText, textTransform: "uppercase" }}>Least Student</p>
              <h4 style={{ margin: "2px 0", fontSize: 16, color: C.text, fontFamily: FONT.serif }}>{leastStudent!.name}</h4>
              <p style={{ margin: 0, fontSize: 13, color: C.textMuted }}>
                Grade: <strong>{pointsToGrade(sumPoints(marksForStudentSubjects(leastStudent!, subjects)) / (getEligibleSubjectCount(leastStudent!, subjects) || 1))}</strong>
                {" "}| Points: <strong>{sumPoints(marksForStudentSubjects(leastStudent!, subjects)).toFixed(1)}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @media print {
            @page { size: A4 landscape; margin: 10mm; }
            .ct-dashboardShell { background: #fff !important; }
            .ct-sidebar, .ct-topbar, .ct-actionbtn, .ct-pill { display: none !important; }
            .ct-contentArea { padding: 0 !important; overflow: visible !important; }
            table { width: 100% !important; border: 1px solid #000 !important; }
            th, td { border: 1px solid #000 !important; padding: 4px !important; font-size: 10px !important; }
          }
        `}
      </style>
      <div
        style={{
          background: C.white,
          border: `2px solid ${C.text}`,
          borderRadius: 14,
          overflow: "auto",
          maxHeight: "70vh",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
        }}
      >
        <div style={{ padding: "18px 24px", borderBottom: `2px solid ${C.text}`, background: "#f8f9fa", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, left: 0, zIndex: 20 }}>
          <h3 style={{ fontFamily: FONT.serif, fontSize: "1.4rem", fontWeight: 700, color: C.text, margin: 0 }}>
            Academic Performance Index (CBC Mode)
          </h3>
          <button
            onClick={() => handleDownload("Full Merit List")}
            className="ct-actionbtn"
            style={{
              padding: "8px 16px",
              background: C.text,
              border: "none",
              borderRadius: 8,
              fontFamily: FONT.sans,
              fontSize: 13,
              fontWeight: 700,
              color: C.white,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8
            }}
          >
            <DlIcon /> Export CBC Report
          </button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
            <thead>
              <tr style={{ background: "#f1f3f5", borderBottom: `2px solid ${C.text}` }}>
                <th scope="col" style={{ ...thStyle, position: "sticky", top: 68, background: "#f1f3f5", zIndex: 10, boxShadow: `inset 0 -1px 0 ${C.text}` }}>Rank</th>
                <th scope="col" style={{ ...thStyle, position: "sticky", top: 68, background: "#f1f3f5", zIndex: 10, boxShadow: `inset 0 -1px 0 ${C.text}` }}>Student Name</th>
                {subjects.map(s => (
                  <th scope="col" key={s.id} style={{ ...thStyle, textAlign: "center", position: "sticky", top: 68, background: "#f1f3f5", zIndex: 10, boxShadow: `inset 0 -1px 0 ${C.text}` }}>{s.name.slice(0, 3).toUpperCase()}</th>
                ))}
                <th scope="col" style={{ ...thStyle, textAlign: "center", background: "#333", color: "#fff", position: "sticky", top: 68, zIndex: 10, boxShadow: `inset 0 -1px 0 ${C.text}` }}>T.Pts</th>
                <th scope="col" style={{ ...thStyle, textAlign: "center", background: "#333", color: "#fff", position: "sticky", top: 68, zIndex: 10, boxShadow: `inset 0 -1px 0 ${C.text}` }}>Avg.Pts</th>
                <th scope="col" style={{ ...thStyle, textAlign: "center", background: "#333", color: "#fff", position: "sticky", top: 68, zIndex: 10, boxShadow: `inset 0 -1px 0 ${C.text}` }}>Grade</th>
                <th scope="col" style={{ ...thStyle, textAlign: "right", position: "sticky", top: 68, background: "#f1f3f5", zIndex: 10, boxShadow: `inset 0 -1px 0 ${C.text}` }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rankedStudents.map((s) => {
                const studentMarks = marksForStudentSubjects(s, subjects);
                const attemptedCount = getAttemptedSubjectCount(s, subjects);
                const totalPoints = sumPoints(studentMarks);
                const avgPoints = totalPoints / (attemptedCount || 1);
                const g = pointsToGrade(avgPoints);
                
                return (
                  <tr 
                    key={s.id} 
                    style={{ borderBottom: `1px solid ${C.border}`, transition: "background 0.2s" }} 
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--ct-hover, rgba(0,0,0,0.02))"} 
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ ...tdStyle, fontWeight: 700, textAlign: "center" }}>{s.rank}</td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar name={s.name} size={28} />
                        <span style={{ fontWeight: 700, color: C.text }}>{s.name}</span>
                      </div>
                    </td>
                    {subjects.map(sub => {
                      const mark = isStudentSubject(s, sub) ? studentMarks[getSubId(sub.id)] : null;
                      return (
                        <td key={sub.id} style={{ ...tdStyle, textAlign: "center" }}>
                          {mark != null ? (
                            <span style={{ 
                              color: gradeColor(mark), 
                              fontWeight: 600,
                              fontSize: 12
                            }}>
                              {mark}
                            </span>
                          ) : (
                            <span style={{ color: C.textFaint }}>-</span>
                          )}
                        </td>
                      );
                    })}
                    <td style={{ ...tdStyle, textAlign: "center", fontWeight: 900, background: "var(--cream, #fff9eb)", color: C.text }}>{totalPoints.toFixed(1)}</td>
                    <td style={{ ...tdStyle, textAlign: "center", fontWeight: 900, background: "var(--cream, #fff9eb)", color: gradeColor(g) }}>{avgPoints.toFixed(1)}</td>
                    <td style={{ ...tdStyle, textAlign: "center", fontWeight: 900, background: "var(--cream, #fff9eb)", color: gradeColor(g) }}>{g}</td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>

                      <button
                        onClick={() => handleDownload("Report Slip", s.name)}
                        className="ct-pill"
                        style={{
                          padding: "6px 12px",
                          background: gradeBg(g),
                          border: `1px solid ${gradeColor(g)}`,
                          borderRadius: 20,
                          fontFamily: FONT.sans,
                          fontSize: 11,
                          fontWeight: 700,
                          color: gradeColor(g),
                          cursor: "pointer"
                        }}
                      >
                        Print Slip
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
      </div>
    </div>
  );
};

>>>>>>> cba98d0467c8e9b1c2bcb541daaaab117ba973fd
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

const SectionHeader: React.FC<{ eyebrow: string; title: string; sub?: string }> = ({ eyebrow, title, sub }) => (
  <div style={{ marginBottom: "1.6rem" }}>
    <p style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: C.gold, margin: "0 0 5px" }}>{eyebrow}</p>
    <h2 style={{ fontFamily: FONT.serif, fontSize: "1.9rem", fontWeight: 600, color: C.text, margin: "0 0 4px" }}>{title}</h2>
    {sub && <p style={{ fontFamily: FONT.sans, fontSize: 13, color: C.textMuted, margin: 0 }}>{sub}</p>}
  </div>
);

export const ResultsReports: React.FC<ResultsReportsProps> = ({
  students,
  subjects,
  term = 1,
  year = 2024,
  examType = "opener",
}) => {
  const { bands: cbcBands } = useCbcGradingBands();
  const [msg, setMsg] = React.useState<{ text: string; type: "success" | "error" } | null>(null);

  const buildMetrics = (student: any) => {
    const marks = marksForStudentSubjects(student, subjects);
    const attempted = Object.keys(marks).length;
    const totalMarks = sum(marks);
    const averageMarks = attempted > 0 ? Math.round(totalMarks / attempted) : 0;
    const totalPoints = sumPoints(marks, cbcBands);
    const cbcBand = attempted > 0 ? resolveCbcBand(averageMarks, cbcBands).cbcBand : "-";
    return { marks, attempted, totalMarks, averageMarks, totalPoints, cbcBand };
  };

  const sortedStudents = [...students].sort((a, b) => {
    const left = buildMetrics(a);
    const right = buildMetrics(b);
    return (
      right.totalPoints - left.totalPoints ||
      right.totalMarks - left.totalMarks ||
      right.averageMarks - left.averageMarks ||
      String(a.name || "").localeCompare(String(b.name || ""))
    );
  });

  let rank = 0;
  let previousKey = "";
  const rankedStudents = sortedStudents.map((student) => {
    const metrics = buildMetrics(student);
    const key = `${metrics.totalPoints}:${metrics.totalMarks}:${metrics.averageMarks}`;
    if (key !== previousKey) {
      rank += 1;
      previousKey = key;
    }
    return { ...student, rank, metrics };
  });

  const topStudent = rankedStudents[0] || null;
  const leastStudent = rankedStudents[rankedStudents.length - 1] || null;

  const handleDownload = (type: string, studentName?: string) => {
    try {
      if (type === "Full Merit List" || type === "Full class report" || type === "Subject summary") {
        const doc = new jsPDF("landscape");
        doc.setFontSize(16);
        doc.text(`CBC Class Merit List - Term ${term}, ${year} (${examType.toUpperCase()})`, 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 22);

        autoTable(doc, {
          head: [["Rank", "Student", "ADM", ...subjects.map((s) => s.name.slice(0, 3).toUpperCase()), "Total Points", "Total Marks", "Average Marks", "CBC Band"]],
          body: rankedStudents.map((student) => [
            student.rank,
            student.name,
            student.adm || student.admissionNumber || student.admissionNo || "-",
            ...subjects.map((subject) => {
              const mark = isStudentSubject(student, subject) ? student.metrics.marks[getSubId(subject.id)] : null;
              if (mark == null) return "-";
              const resolved = resolveCbcBand(mark, cbcBands);
              return `${mark} | ${resolved.cbcBand} | ${resolved.points}`;
            }),
            student.metrics.totalPoints,
            student.metrics.totalMarks,
            `${student.metrics.averageMarks}%`,
            student.metrics.cbcBand,
          ]),
          startY: 28,
          theme: "grid",
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [30, 30, 30], textColor: [255, 255, 255], fontStyle: "bold" },
        });
        doc.save(`CBC_MeritList_Term${term}_${Date.now()}.pdf`);
      } else if (type === "Excel Report") {
        const worksheetData = rankedStudents.map((student) => ({
          Rank: student.rank,
          "Student Name": student.name,
          ADM: student.adm || student.admissionNumber || student.admissionNo || "-",
          ...Object.fromEntries(subjects.map((subject) => {
            const mark = isStudentSubject(student, subject) ? student.metrics.marks[getSubId(subject.id)] : null;
            if (mark == null) return [subject.name, "N/A"];
            const resolved = resolveCbcBand(mark, cbcBands);
            return [subject.name, `${mark} | ${resolved.cbcBand} | ${resolved.points}`];
          })),
          "Total Points": student.metrics.totalPoints,
          "Total Marks": student.metrics.totalMarks,
          "Average Marks": `${student.metrics.averageMarks}%`,
          "CBC Band": student.metrics.cbcBand,
        }));
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, worksheet, "CBC Class Report");
        XLSX.writeFile(wb, `CBC_Term${term}_Report_${Date.now()}.xlsx`);
      } else if (type === "Report Slip" || type === "Individual result slips") {
        const slip = rankedStudents.find((student) => student.name === studentName);
        if (!slip) {
          setMsg({ text: "Individual slip download requires a student selection.", type: "error" });
          setTimeout(() => setMsg(null), 3500);
          return;
        }

        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.setTextColor(201, 150, 61);
        doc.text("STUDENT CBC REPORT SLIP", 105, 20, { align: "center" });
        doc.setFontSize(12);
        doc.setTextColor(50, 50, 50);
        doc.text(`Name: ${slip.name}`, 20, 40);
        doc.text(`Admission No: ${slip.adm || slip.admissionNumber || slip.admissionNo || "-"}`, 20, 48);
        doc.text(`Term: ${term} | Year: ${year} | Phase: ${examType.toUpperCase()}`, 20, 56);
        doc.line(20, 62, 190, 62);

        const slipSubjects = subjectsForStudent(slip, subjects);
        const tableData = slipSubjects.map((subject) => {
          const mark = slip.metrics.marks[getSubId(subject.id)];
          const resolved = mark != null ? resolveCbcBand(mark, cbcBands) : null;
          return [
            subject.name,
            mark != null ? `${mark}%` : "-",
            resolved?.cbcBand || "-",
            resolved?.points ?? "-",
            mark != null ? getSubjectRemark(mark, cbcBands) : "-",
          ];
        });
        tableData.push(["TOTAL", `${slip.metrics.totalMarks}`, "", `${slip.metrics.totalPoints}`, ""]);

        autoTable(doc, {
          head: [["Subject", "Marks", "CBC Band", "Points", "Remark"]],
          body: tableData,
          startY: 68,
          theme: "grid",
          headStyles: { fillColor: [30, 30, 30], textColor: [255, 255, 255] },
          styles: { fontSize: 10, cellPadding: 4 },
        });

        const finalY = (doc as any).lastAutoTable.finalY || 150;
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.text(`CBC Band: ${slip.metrics.cbcBand}`, 20, finalY + 15);
        doc.text(`Total Points: ${slip.metrics.totalPoints}`, 20, finalY + 23);
        doc.text(`Average Marks: ${slip.metrics.averageMarks}%`, 20, finalY + 31);
        doc.save(`${slip.name.replace(/\s+/g, "_")}_CBC_Report.pdf`);
      }
      setMsg({ text: `Successfully downloaded ${type}${studentName ? ` for ${studentName}` : ""}`, type: "success" });
    } catch (_err) {
      setMsg({ text: `Failed to download ${type}`, type: "error" });
    }
    setTimeout(() => setMsg(null), 3500);
  };

  return (
    <div className="ct-anim" style={{ display: "grid", gap: 30 }}>
      <SectionHeader eyebrow="Reports" title="Results & reports" sub={`Download and review CBC summaries for Term ${term}, ${year} (${examType}).`} />
      {msg && <div style={{ padding: "10px 20px", borderRadius: 8, background: msg.type === "success" ? "#eaf3de" : "#fdeaea", color: msg.type === "success" ? "#3b6d11" : "#a32d2d", fontSize: 13, fontWeight: 600 }}>{msg.text}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        {["Full class report", "Individual result slips", "Subject summary"].map((title) => (
          <div key={title} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "1.4rem" }}>
            <h3 style={{ fontFamily: FONT.serif, fontSize: "1.15rem", fontWeight: 600, color: C.text, marginTop: 0 }}>{title}</h3>
            <p style={{ fontFamily: FONT.sans, fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>CBC bands, points, totals, and average marks for configured subjects.</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="ct-actionbtn" onClick={() => handleDownload(title === "Individual result slips" ? title : "Excel Report")} style={{ flex: 1, padding: "9px 12px", background: C.sand, border: `1px solid ${C.border}`, borderRadius: 9, cursor: "pointer" }}>
                <DlIcon /> {title === "Individual result slips" ? "Download PDF" : "Excel"}
              </button>
              {title !== "Individual result slips" && (
                <button className="ct-actionbtn" onClick={() => handleDownload(title)} style={{ flex: 1, padding: "9px 12px", background: C.white, border: `1px solid ${C.border}`, borderRadius: 9, cursor: "pointer" }}>
                  <DlIcon /> PDF
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {topStudent && leastStudent && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {[["Top Student", topStudent, C.greenLight, C.green], ["Lowest Total Points", leastStudent, "#fdeaea", C.dangerText]].map(([label, student, bg, color]: any) => (
            <div key={label} style={{ background: bg, border: `1px solid ${color}`, padding: 16, borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar name={student.name} size={40} />
              <div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color, textTransform: "uppercase" }}>{label}</p>
                <h4 style={{ margin: "2px 0", fontSize: 16, color: C.text, fontFamily: FONT.serif }}>{student.name}</h4>
                <p style={{ margin: 0, fontSize: 13, color: C.textMuted }}>CBC Band: <strong>{student.metrics.cbcBand}</strong> | Points: <strong>{student.metrics.totalPoints}</strong></p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: C.white, border: `2px solid ${C.text}`, borderRadius: 14, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
        <div style={{ padding: "18px 24px", borderBottom: `2px solid ${C.text}`, background: "#f8f9fa", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontFamily: FONT.serif, fontSize: "1.4rem", fontWeight: 700, color: C.text, margin: 0 }}>CBC Performance Index</h3>
          <button onClick={() => handleDownload("Full Merit List")} className="ct-actionbtn" style={{ padding: "8px 16px", background: C.text, border: "none", borderRadius: 8, color: C.white, cursor: "pointer" }}><DlIcon /> Export CBC Report</button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 920 }}>
            <thead>
              <tr style={{ background: "#f1f3f5", borderBottom: `2px solid ${C.text}` }}>
                <th style={thStyle}>Rank</th>
                <th style={{ ...thStyle, position: "sticky", left: 0, background: "#f1f3f5", zIndex: 2 }}>Student Name</th>
                {subjects.map((subject) => <th key={subject.id} style={{ ...thStyle, textAlign: "center" }}>{subject.name.slice(0, 3).toUpperCase()}</th>)}
                <th style={{ ...thStyle, textAlign: "center", background: "#333", color: "#fff" }}>T.Pts</th>
                <th style={{ ...thStyle, textAlign: "center", background: "#333", color: "#fff" }}>Average</th>
                <th style={{ ...thStyle, textAlign: "center", background: "#333", color: "#fff" }}>CBC Band</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rankedStudents.map((student) => (
                <tr key={student.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ ...tdStyle, fontWeight: 700, textAlign: "center" }}>{student.rank}</td>
                  <td style={{ ...tdStyle, position: "sticky", left: 0, background: C.white, zIndex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={student.name} size={28} />
                      <span style={{ fontWeight: 700, color: C.text }}>{student.name}</span>
                    </div>
                  </td>
                  {subjects.map((subject) => {
                    const mark = isStudentSubject(student, subject) ? student.metrics.marks[getSubId(subject.id)] : null;
                    const resolved = mark != null ? resolveCbcBand(mark, cbcBands) : null;
                    return <td key={subject.id} style={{ ...tdStyle, textAlign: "center" }}>{mark != null ? <span style={{ color: gradeColor(resolved!.cbcBand), fontWeight: 600 }}>{mark} | {resolved!.cbcBand} | {resolved!.points}</span> : <span style={{ color: C.textFaint }}>-</span>}</td>;
                  })}
                  <td style={{ ...tdStyle, textAlign: "center", fontWeight: 900, background: "#fff9eb", color: C.text }}>{student.metrics.totalPoints}</td>
                  <td style={{ ...tdStyle, textAlign: "center", fontWeight: 900, background: "#fff9eb" }}>{student.metrics.averageMarks}%</td>
                  <td style={{ ...tdStyle, textAlign: "center", fontWeight: 900, background: "#fff9eb", color: gradeColor(student.metrics.cbcBand) }}>{student.metrics.cbcBand}</td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    <button onClick={() => handleDownload("Report Slip", student.name)} className="ct-pill" style={{ padding: "6px 12px", background: gradeBg(student.metrics.cbcBand), border: `1px solid ${gradeColor(student.metrics.cbcBand)}`, borderRadius: 20, fontSize: 11, fontWeight: 700, color: gradeColor(student.metrics.cbcBand), cursor: "pointer" }}>Print Slip</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
