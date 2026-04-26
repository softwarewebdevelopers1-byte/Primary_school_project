import { createClient } from "@supabase/supabase-js";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
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

  // 3. Fetch subjects and Class Teacher
  const [subjects, classTeacher] = await Promise.all([
    SubjectModel.find(),
    studentModel.findOne({ 
      class: classGrade, 
      classStream: classStream,
      $or: [
        { "roles.role1": "classteacher" },
        { "roles.role2": "classteacher" },
        { "roles.role3": "classteacher" }
      ]
    } as any)
  ]);

  const teacherName = (classTeacher as any)?.teachersName || "N/A";
  
  // 4. Generate PDF
  const doc = new jsPDF("landscape");
  
  doc.setFontSize(22);
  doc.setTextColor(20, 50, 40);
  doc.text(`Primary School Academic Report`, 14, 15);
  
  doc.setFontSize(14);
  doc.setTextColor(100);
  doc.text(`Class: ${classGrade} ${classStream} | Teacher: ${teacherName}`, 14, 23);
  doc.text(`Term ${term}, ${year} | Phase: ${examType.toUpperCase()}`, 14, 30);
  doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 37);

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
    
    let grade = "E";
    if (avg >= 80) grade = "A";
    else if (avg >= 70) grade = "B";
    else if (avg >= 60) grade = "C";
    else if (avg >= 50) grade = "D";
    
    rowData.push(grade);
    return rowData;
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 45,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [201, 150, 61], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [250, 248, 242] }
  });

  const pdfOutput = doc.output("arraybuffer");
  const uint8Array = new Uint8Array(pdfOutput);
  const fileName = `archives/${year}/Term${term}/${examType}/${classGrade}_${classStream}_${Date.now()}.pdf`.replace(/\s+/g, '_');

  const sanitizedBucket = bucketName.replace(/['"]+/g, '');

  // 5. Upload to Supabase
  const { error: uploadError } = await supabase.storage
    .from(sanitizedBucket)
    .upload(fileName, uint8Array, {
      contentType: "application/pdf",
      upsert: true
    });

  if (uploadError) {
    throw new Error(`Supabase Storage Error: ${uploadError.message} (Bucket: ${sanitizedBucket})`);
  }

  // 6. Get Public URL
  const { data: { publicUrl } } = supabase.storage
    .from(sanitizedBucket)
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
}
