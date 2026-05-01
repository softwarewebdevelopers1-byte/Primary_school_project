import React, { useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { admissionNo, avg, grade, rankByTotal, sum } from "../classteacher/shared/helpers";
import { Class, Student, Subject } from "./types";

interface GradePerformanceTabProps {
  classes: Class[];
  students: Student[];
  subjects: Subject[];
}

const panelStyle: React.CSSProperties = {
  background: "var(--white)",
  border: "1px solid var(--border)",
  borderRadius: 13,
  padding: "1.1rem 1.2rem",
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

export const GradePerformanceTab: React.FC<GradePerformanceTabProps> = ({ classes, students, subjects }) => {
  const gradeOptions = useMemo(
    () =>
      Array.from(new Set(classes.map((current) => current.grade))).sort((left, right) =>
        left.localeCompare(right, undefined, { numeric: true }),
      ),
    [classes],
  );
  const [selectedGrade, setSelectedGrade] = useState(gradeOptions[0] || "");
  const activeGrade = selectedGrade || gradeOptions[0] || "";
  const rankedStudents = rankByTotal(students.filter((student) => student.classGrade === activeGrade));
  const gradeClasses = classes.filter((current) => current.grade === activeGrade);
  const gradeSubjectIds = Array.from(new Set(gradeClasses.flatMap((current) => current.offeredSubjectIds)));
  const gradeSubjects = subjects.filter((subject) => gradeSubjectIds.includes(subject.id));

  const downloadGradePerformance = () => {
    const doc = new jsPDF("landscape");
    doc.setFontSize(16);
    doc.text(`Grade ${activeGrade} Performance Ranking`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Best to least | Generated ${new Date().toLocaleDateString()}`, 14, 22);

    autoTable(doc, {
      head: [["Rank", "Student", "Admission No", "Stream", ...gradeSubjects.map((subject) => subject.name), "Total", "Average", "Grade"]],
      body: rankedStudents.map((student) => [
        student.rank,
        student.name,
        admissionNo(student),
        student.classStream || "-",
        ...gradeSubjects.map((subject) => (student.marks || {})[subject.id] ?? "-"),
        sum(student.marks || {}),
        `${avg(student.marks || {})}%`,
        grade(avg(student.marks || {})),
      ]),
      startY: 28,
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [201, 150, 61] },
    });

    doc.save(`Grade_${activeGrade}_Performance_${Date.now()}.pdf`);
  };

  return (
    <div className="anim" style={{ display: "grid", gap: 16 }}>
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: ".09em", margin: "0 0 4px" }}>
          Grade performance
        </p>
        <h2 style={{ margin: 0, fontFamily: "var(--serif)", fontSize: "1.8rem", color: "var(--text)" }}>
          Student ranking across streams
        </h2>
      </div>

      <div style={{ ...panelStyle, display: "flex", justifyContent: "space-between", alignItems: "end", gap: 12, flexWrap: "wrap" }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={labelStyle}>Grade</span>
          <select value={activeGrade} onChange={(event) => setSelectedGrade(event.target.value)} style={{ ...inputStyle, width: 180 }}>
            {gradeOptions.map((gradeValue) => (
              <option key={gradeValue} value={gradeValue}>
                Grade {gradeValue}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={downloadGradePerformance} disabled={rankedStudents.length === 0} style={{ ...inputStyle, width: "auto", cursor: rankedStudents.length ? "pointer" : "not-allowed", fontWeight: 700 }}>
          Download combined marks
        </button>
      </div>

      <div style={{ ...panelStyle, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}>
          <thead>
            <tr style={{ background: "var(--sand)" }}>
              {["Rank", "Student", "Adm. No", "Stream", "Total", "Average", "Grade"].map((heading) => (
                <th key={heading} style={{ padding: "9px 11px", textAlign: "left", fontSize: 10, color: "var(--textMut)", textTransform: "uppercase" }}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rankedStudents.map((student) => (
              <tr key={student.id} style={{ borderTop: "1px solid var(--borderL)" }}>
                <td style={{ padding: "9px 11px", fontWeight: 700 }}>{student.rank}</td>
                <td style={{ padding: "9px 11px" }}>{student.name}</td>
                <td style={{ padding: "9px 11px" }}>{admissionNo(student)}</td>
                <td style={{ padding: "9px 11px" }}>{student.classStream || "-"}</td>
                <td style={{ padding: "9px 11px", fontWeight: 700 }}>{student.total}</td>
                <td style={{ padding: "9px 11px" }}>{avg(student.marks || {})}%</td>
                <td style={{ padding: "9px 11px" }}>{grade(avg(student.marks || {}))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rankedStudents.length === 0 && (
          <p style={{ margin: 0, padding: 18, textAlign: "center", color: "var(--textMut)" }}>
            No students found for this grade.
          </p>
        )}
      </div>
    </div>
  );
};
