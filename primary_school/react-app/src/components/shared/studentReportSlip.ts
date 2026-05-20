import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface StudentReportSubjectRow {
  subject: string;
  marks: string;
  cbcBand: string;
  points: string | number;
  remark: string;
}

export interface StudentReportSlipData {
  studentName: string;
  admissionNo: string;
  classLabel?: string;
  term: number | string;
  year: number | string;
  examType: string;
  rank?: string | number;
  rankingLabel?: string;
  subjects: StudentReportSubjectRow[];
  totalMarks: string | number;
  totalPoints: string | number;
}

export const buildStudentReportSlipPdf = (data: StudentReportSlipData) => {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.setTextColor(201, 150, 61);
  doc.text("STUDENT CBC REPORT SLIP", 105, 20, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(50, 50, 50);
  doc.text(`Name: ${data.studentName}`, 20, 40);
  doc.text(`Admission No: ${data.admissionNo || "-"}`, 20, 48);
  if (data.classLabel) {
    doc.text(`Class: ${data.classLabel}`, 20, 56);
    doc.text(`Term: ${data.term} | Year: ${data.year} | Phase: ${String(data.examType).toUpperCase()}`, 20, 64);
  } else {
    doc.text(`Term: ${data.term} | Year: ${data.year} | Phase: ${String(data.examType).toUpperCase()}`, 20, 56);
  }

  const rankY = data.classLabel ? 72 : 64;
  const dividerY = data.rank || data.rankingLabel ? rankY + 6 : rankY;
  if (data.rank || data.rankingLabel) {
    doc.text(
      `Class Position: ${data.rank ?? "-"}${data.rankingLabel ? ` | Ranked by: ${data.rankingLabel}` : ""}`,
      20,
      rankY,
    );
  }
  doc.line(20, dividerY, 190, dividerY);

  autoTable(doc, {
    head: [["Subject", "Marks", "CBC Band", "Points", "Remark"]],
    body: [
      ...data.subjects.map((subject) => [
        subject.subject,
        subject.marks,
        subject.cbcBand,
        subject.points,
        subject.remark,
      ]),
      ["TOTAL", String(data.totalMarks), "", String(data.totalPoints), ""],
    ],
    startY: dividerY + 6,
    theme: "grid",
    headStyles: { fillColor: [30, 30, 30], textColor: [255, 255, 255] },
    styles: { fontSize: 10, cellPadding: 4 },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 150;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Marks: ${data.totalMarks}`, 20, finalY + 15);
  doc.text(`Total Points: ${data.totalPoints}`, 20, finalY + 23);

  return doc;
};
