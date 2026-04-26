import { createClient } from "@supabase/supabase-js";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { MarkModel, ArchiveModel, SubjectModel } from "../models/school.model.js";
import { studentModel } from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const bucketName = process.env.SUPABASE_BUCKET || "Carlos'sWorkSpace";

export async function archiveClassMarks(classGrade: string, classStream: string, term: number, year: number, examType: string) {
  try {
    console.log(`Archiving marks for ${classGrade} ${classStream} - Term ${term}, ${year} (${examType})...`);

    // 1. Fetch students in this class
    const students = await studentModel.find({ class: classGrade, classStream: classStream } as any);
    if (students.length === 0) return null;

    // 2. Fetch all marks for this class and period
    const studentIds = students.map(s => s._id);
    const marks = await MarkModel.find({
      studentId: { $in: studentIds },
      classGrade,
      classStream,
      term,
      year,
      examType
    } as any);

    if (marks.length === 0) return null;

    // 3. Fetch subjects to build the table
    const subjects = await SubjectModel.find();
    
    // 4. Generate PDF
    const doc = new jsPDF("landscape") as any;
    
    doc.setFontSize(18);
    doc.text(`Academic Report: ${classGrade} ${classStream}`, 14, 15);
    doc.setFontSize(12);
    doc.text(`Term ${term}, ${year} | Phase: ${examType.toUpperCase()}`, 14, 22);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 28);

    const tableColumn = ["Student", "ADM", ...subjects.map(s => s.name), "Average", "Grade"];
    const tableRows = students.map(s => {
      const studentMarks = marks.filter(m => m.studentId.toString() === s._id.toString());
      
      let total = 0;
      let count = 0;
      const rowData = [s.studentsName, s.ADM || "-"];
      
      subjects.forEach(sub => {
        const m = studentMarks.find(mark => mark.subjectId.toString() === sub._id.toString());
        if (m && m.finalScore != null) {
          rowData.push(m.finalScore.toString());
          total += m.finalScore;
          count++;
        } else {
          rowData.push("-");
        }
      });

      const avg = count > 0 ? Math.round(total / count) : 0;
      rowData.push(avg + "%");
      
      // Simple grading logic for the PDF
      let grade = "E";
      if (avg >= 80) grade = "A";
      else if (avg >= 70) grade = "B";
      else if (avg >= 60) grade = "C";
      else if (avg >= 50) grade = "D";
      
      rowData.push(grade);
      return rowData;
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [201, 150, 61] }
    });

    const pdfArrayBuffer = doc.output("arraybuffer");
    const fileName = `archives/${year}/Term${term}/${examType}/${classGrade}_${classStream}_${Date.now()}.pdf`.replace(/\s+/g, '_');

    // 5. Upload to Supabase
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, pdfArrayBuffer, {
        contentType: "application/pdf",
        upsert: true
      });

    if (error) throw error;

    // 6. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    // 7. Save to ArchiveModel
    const archive = await ArchiveModel.create({
      classGrade,
      classStream,
      term,
      year,
      examType,
      pdfUrl: publicUrl
    });

    return archive;
  } catch (error) {
    console.error(`Error archiving class ${classGrade} ${classStream}:`, error);
    return null;
  }
}
