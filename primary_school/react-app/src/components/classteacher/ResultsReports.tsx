import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { DlIcon } from "./shared/Icons";
import { C, FONT } from "./shared/constants";
import { averagePoints, gradeBg, gradeColor, getSubjectRemark, getSubId, isStudentSubject, marksForStudentSubjects, subjectsForStudent, sum, sumPoints } from "./shared/helpers";
import { Avatar } from "./shared/Avatar";
import { resolveCbcBand, resolveCbcBandByPoints, useCbcGradingBands } from "../../lib/cbcGrading";

interface ResultsReportsProps {
  students: any[];
  subjects: any[];
  term?: number;
  year?: number;
  examType?: string;
}

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
  const [rankingMode, setRankingMode] = React.useState<"total_points" | "total_marks">("total_points");

  const buildMetrics = (student: any) => {
    const marks = marksForStudentSubjects(student, subjects);
    const attempted = Object.keys(marks).length;
    const totalMarks = sum(marks);
    const averageMarks = attempted > 0 ? Math.round(totalMarks / attempted) : 0;
    const totalPoints = sumPoints(marks, cbcBands);
    const averagePoint = attempted > 0 ? averagePoints(marks, cbcBands) : 0;
    const cbcBand = attempted > 0 ? resolveCbcBandByPoints(averagePoint, cbcBands).cbcBand : "-";
    return { marks, attempted, totalMarks, averageMarks, totalPoints, averagePoint, cbcBand };
  };

  // Sort strictly by the chosen ranking field only
  const sortedStudents = [...students].sort((a, b) => {
    const left = buildMetrics(a);
    const right = buildMetrics(b);

    let diff = 0;
    if (rankingMode === "total_marks") {
      diff = right.totalMarks - left.totalMarks;
    } else {
      diff = right.totalPoints - left.totalPoints;
    }

    return diff || String(a.name || "").localeCompare(String(b.name || ""));
  });

  // Dense ranking: ties share the same rank, next position is consecutive (not skipped)
  let rank = 0;
  let previousValue: number | null = null;
  const rankedStudents = sortedStudents.map((student) => {
    const metrics = buildMetrics(student);
    const currentValue = rankingMode === "total_marks" ? metrics.totalMarks : metrics.totalPoints;

    if (currentValue !== previousValue) {
      rank += 1;
      previousValue = currentValue;
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
        doc.text(`Ranked by: ${rankingMode === "total_marks" ? "Total Marks" : "Total Points"} | Generated on ${new Date().toLocaleDateString()}`, 14, 22);

        autoTable(doc, {
          head: [["Rank", "Student", "ADM", ...subjects.map((s) => s.name.slice(0, 3).toUpperCase()), "Total Points", "Total Marks", "Average Points", "CBC Band"]],
          body: rankedStudents.map((student) => [
            student.rank,
            student.name,
            student.adm || student.admissionNumber || student.admissionNo || "-",
            ...subjects.map((subject) => {
              const mark = isStudentSubject(student, subject) ? student.metrics.marks[getSubId(subject.id)] : null;
              if (mark == null) return "-";
              return `${mark}%`;
            }),
            student.metrics.totalPoints,
            student.metrics.totalMarks,
            student.metrics.averagePoint,
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
            return [subject.name, `${mark}%`];
          })),
          "Total Points": student.metrics.totalPoints,
          "Total Marks": student.metrics.totalMarks,
          "Average Points": student.metrics.averagePoint,
          "CBC Band": student.metrics.cbcBand,
          "Ranked By": rankingMode === "total_marks" ? "Total Marks" : "Total Points",
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
        doc.text(`Class Position: ${slip.rank} | Ranked by: ${rankingMode === "total_marks" ? "Total Marks" : "Total Points"}`, 20, 64);
        doc.line(20, 70, 190, 70);

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
          startY: 76,
          theme: "grid",
          headStyles: { fillColor: [30, 30, 30], textColor: [255, 255, 255] },
          styles: { fontSize: 10, cellPadding: 4 },
        });

        const finalY = (doc as any).lastAutoTable.finalY || 150;
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.text(`CBC Band: ${slip.metrics.cbcBand}`, 20, finalY + 15);
        doc.text(`Total Points: ${slip.metrics.totalPoints}`, 20, finalY + 23);
        doc.text(`Average Points: ${slip.metrics.averagePoint}`, 20, finalY + 31);
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

      {/* Ranking Mode Selector */}
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "1rem 1.4rem", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <span style={{ fontFamily: FONT.sans, fontSize: 13, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Ranking Basis:
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          {([["total_points", "Total Points"], ["total_marks", "Total Marks"]] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setRankingMode(val)}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                border: `2px solid ${rankingMode === val ? C.gold : C.border}`,
                background: rankingMode === val ? C.gold : C.sand,
                color: rankingMode === val ? "#fff" : C.text,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.18s",
                fontFamily: FONT.sans,
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 12, color: C.textMuted, fontFamily: FONT.sans }}>
          {rankingMode === "total_marks"
            ? "Students ranked by sum of percentage marks across their subjects."
            : "Students ranked by sum of CBC points across their subjects."}
        </span>
      </div>

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
          {([[`Top Student`, topStudent, C.greenLight, C.green], [`Lowest ${rankingMode === "total_marks" ? "Total Marks" : "Total Points"}`, leastStudent, "#fdeaea", C.dangerText]] as any[]).map(([label, student, bg, color]: any) => (
            <div key={label} style={{ background: bg, border: `1px solid ${color}`, padding: 16, borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar name={student.name} size={40} />
              <div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color, textTransform: "uppercase" }}>{label}</p>
                <h4 style={{ margin: "2px 0", fontSize: 16, color: C.text, fontFamily: FONT.serif }}>{student.name}</h4>
                <p style={{ margin: 0, fontSize: 13, color: C.textMuted }}>
                  CBC Band: <strong>{student.metrics.cbcBand}</strong> | Points: <strong>{student.metrics.totalPoints}</strong>
                  {rankingMode === "total_marks" && <> | Marks: <strong>{student.metrics.totalMarks}</strong></>}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: C.white, border: `2px solid ${C.text}`, borderRadius: 14, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
        <div style={{ padding: "18px 24px", borderBottom: `2px solid ${C.text}`, background: "#f8f9fa", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div>
            <h3 style={{ fontFamily: FONT.serif, fontSize: "1.4rem", fontWeight: 700, color: C.text, margin: 0 }}>CBC Performance Index</h3>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: C.textMuted, fontFamily: FONT.sans }}>
              Ranked by: <strong>{rankingMode === "total_marks" ? "Total Marks" : "Total Points"}</strong>
            </p>
          </div>
          <button onClick={() => handleDownload("Full Merit List")} className="ct-actionbtn" style={{ padding: "8px 16px", background: C.text, border: "none", borderRadius: 8, color: C.white, cursor: "pointer" }}>
            <DlIcon /> Export CBC Report
          </button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 920 }}>
            <thead>
              <tr style={{ background: "#f1f3f5", borderBottom: `2px solid ${C.text}` }}>
                <th style={thStyle}>Rank</th>
                <th style={{ ...thStyle, position: "sticky", left: 0, top: 0, background: "#f1f3f5", zIndex: 10, boxShadow: "2px 0 5px rgba(0,0,0,0.05), inset 0 -1px 0 var(--borderL)" }}>Student Name</th>
                {subjects.map((subject) => <th key={subject.id} style={{ ...thStyle, textAlign: "center" }}>{subject.name.slice(0, 3).toUpperCase()}</th>)}
                <th style={{ ...thStyle, textAlign: "center", background: "#333", color: "#fff" }}>T.Pts</th>
                <th style={{ ...thStyle, textAlign: "center", background: rankingMode === "total_marks" ? C.gold : "#333", color: "#fff" }}>T.Marks</th>
                <th style={{ ...thStyle, textAlign: "center", background: "#333", color: "#fff" }}>Avg Pts</th>
                <th style={{ ...thStyle, textAlign: "center", background: "#333", color: "#fff" }}>CBC Band</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rankedStudents.map((student) => (
                <tr key={student.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ ...tdStyle, fontWeight: 700, textAlign: "center" }}>{student.rank}</td>
                  <td style={{ ...tdStyle, position: "sticky", left: 0, background: C.white, zIndex: 5, boxShadow: "2px 0 5px rgba(0,0,0,0.05)", minWidth: 200 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={student.name} size={28} />
                      <span style={{ fontWeight: 700, color: C.text }}>{student.name}</span>
                    </div>
                  </td>
                  {subjects.map((subject) => {
                    const mark = isStudentSubject(student, subject) ? student.metrics.marks[getSubId(subject.id)] : null;
                    const resolved = mark != null ? resolveCbcBand(mark, cbcBands) : null;
                    return <td key={subject.id} style={{ ...tdStyle, textAlign: "center" }}>{mark != null ? <span style={{ color: gradeColor(resolved!.cbcBand), fontWeight: 600 }}>{mark}%</span> : <span style={{ color: C.textFaint }}>-</span>}</td>;
                  })}
                  <td style={{ ...tdStyle, textAlign: "center", fontWeight: 900, background: rankingMode === "total_points" ? "#fff9eb" : undefined, color: C.text }}>{student.metrics.totalPoints}</td>
                  <td style={{ ...tdStyle, textAlign: "center", fontWeight: 900, background: rankingMode === "total_marks" ? "#fff9eb" : undefined }}>{student.metrics.totalMarks}</td>
                  <td style={{ ...tdStyle, textAlign: "center", fontWeight: 900 }}>{student.metrics.averagePoint}</td>
                  <td style={{ ...tdStyle, textAlign: "center", fontWeight: 900, color: gradeColor(student.metrics.cbcBand) }}>{student.metrics.cbcBand}</td>
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
