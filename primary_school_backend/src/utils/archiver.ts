import { createClient } from "@supabase/supabase-js";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { ArchiveModel, MarkModel, SubjectModel } from "../models/school.model.js";
import { rolesMapped, studentModel, userModel } from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

const allowedExamTypes = new Set(["opener", "midterm", "closing"]);
const SUPABASE_URL = process.env.SUPABASE_URL?.trim();
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET?.trim();

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_BUCKET) {
  throw new Error("Missing Supabase environment variables.");
}

const supabaseUrl = SUPABASE_URL;
const supabaseServiceRoleKey = SUPABASE_SERVICE_ROLE_KEY;
const supabaseBucket = SUPABASE_BUCKET;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export interface ArchiveClassMarksResult {
  archiveId: string;
  classGrade: string;
  classStream: string;
  fileName: string;
  storagePath: string;
  pdfUrl: string;
  markCount: number;
  studentCount: number;
}

const CBC_GRADE_SCALE = [
  { grade: "EE1", points: 8, min: 80, max: 100, remark: "Exceeding Expectations" },
  { grade: "EE2", points: 7, min: 65, max: 79, remark: "Exceeding Expectations" },
  { grade: "ME1", points: 6, min: 55, max: 64, remark: "Meeting Expectations" },
  { grade: "ME2", points: 5, min: 45, max: 54, remark: "Meeting Expectations" },
  { grade: "AE1", points: 4, min: 35, max: 44, remark: "Approaching Expectations" },
  { grade: "AE2", points: 3, min: 25, max: 34, remark: "Approaching Expectations" },
  { grade: "BE1", points: 2, min: 15, max: 24, remark: "Below Expectations" },
  { grade: "BE2", points: 1, min: 0, max: 14, remark: "Below Expectations" },
] as const;
const DEFAULT_GRADE_BAND = CBC_GRADE_SCALE[CBC_GRADE_SCALE.length - 1]!;

const resolveGradeBand = (average: number) => {
  const normalizedAverage = Math.max(0, Math.min(100, Math.round(average)));
  return CBC_GRADE_SCALE.find((band) => normalizedAverage >= band.min) || DEFAULT_GRADE_BAND;
};

const markToPoints = (score: number) => resolveGradeBand(score).points;

const pointsToGrade = (avgPoints: number) => {
  const roundedPoints = Math.max(1, Math.min(8, Math.round(avgPoints)));
  const band = CBC_GRADE_SCALE.find((entry) => entry.points === roundedPoints);
  return band?.grade || DEFAULT_GRADE_BAND.grade;
};

const toFiniteNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue =
    typeof value === "number" ? value : Number(typeof value === "string" ? value.trim() : value);

  return Number.isFinite(numericValue) ? numericValue : null;
};

const resolveMarkPercentage = (mark: any): number | null => {
  const explicitFinalScore = toFiniteNumber(mark?.finalScore);
  if (explicitFinalScore !== null) {
    return Math.max(0, Math.min(100, Math.round(explicitFinalScore)));
  }

  const components = [
    { score: toFiniteNumber(mark?.cat1), max: toFiniteNumber(mark?.cat1Max) },
    { score: toFiniteNumber(mark?.cat2), max: toFiniteNumber(mark?.cat2Max) },
    { score: toFiniteNumber(mark?.cat3), max: toFiniteNumber(mark?.cat3Max) },
    { score: toFiniteNumber(mark?.cat4), max: toFiniteNumber(mark?.cat4Max) },
    { score: toFiniteNumber(mark?.cat5), max: toFiniteNumber(mark?.cat5Max) },
    { score: toFiniteNumber(mark?.exam), max: toFiniteNumber(mark?.examMax) },
  ];

  let totalScore = 0;
  let totalMax = 0;

  for (const component of components) {
    if (component.score === null) {
      continue;
    }

    const componentMax = component.max !== null && component.max > 0 ? component.max : null;
    if (componentMax === null) {
      continue;
    }

    totalScore += component.score;
    totalMax += componentMax;
  }

  if (totalMax <= 0) {
    return null;
  }

  const calculatedPercentage = Math.round((totalScore / totalMax) * 100);
  return Math.max(0, Math.min(100, calculatedPercentage));
};

const removeStoredFiles = async (fileNames: string[]) => {
  if (fileNames.length === 0) return;

  const { error } = await supabase.storage.from(supabaseBucket).remove(fileNames);

  if (error) {
    throw new Error(`Supabase cleanup failed: ${error.message}`);
  }
};

const getClassLabel = (classGrade: string, classStream: string) =>
  `${classGrade} ${classStream}`.trim();

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const resolveArchiveStoragePath = (archive: { storagePath?: string | null; pdfUrl?: string | null }) => {
  const directPath = archive.storagePath?.trim();
  if (directPath) {
    return directPath;
  }

  const pdfUrl = archive.pdfUrl?.trim();
  if (!pdfUrl) {
    return null;
  }

  try {
    const parsedUrl = new URL(pdfUrl);
    const decodedPathname = decodeURIComponent(parsedUrl.pathname);
    const marker = `/object/public/${supabaseBucket}/`;
    const markerIndex = decodedPathname.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    const storagePath = decodedPathname.slice(markerIndex + marker.length).replace(/^\/+/, "");
    return storagePath || null;
  } catch (_error) {
    return null;
  }
};

export function buildArchiveSearchQuery(searchValue: string) {
  const trimmedSearch = searchValue.trim();
  if (!trimmedSearch) {
    return {};
  }

  const regex = new RegExp(escapeRegExp(trimmedSearch), "i");
  const numericSearch = Number(trimmedSearch);
  const queryParts: any[] = [
    { classGrade: regex },
    { classStream: regex },
    { examType: regex },
  ];

  if (Number.isInteger(numericSearch)) {
    queryParts.push({ term: numericSearch });
    queryParts.push({ year: numericSearch });
  }

  const termMatch = trimmedSearch.match(/term\s*(\d+)/i);
  if (termMatch) {
    queryParts.push({ term: Number(termMatch[1]) });
  }

  const yearMatch = trimmedSearch.match(/\b(20\d{2}|19\d{2})\b/);
  if (yearMatch) {
    queryParts.push({ year: Number(yearMatch[1]) });
  }

  return { $or: queryParts };
}

export async function archiveClassMarks(
  classGrade: string,
  classStream: string,
  term: number,
  year: number,
  examType: string,
): Promise<ArchiveClassMarksResult | null> {
  const normalizedExamType = examType.trim().toLowerCase();
  const classLabel = getClassLabel(classGrade, classStream);

  if (!classGrade?.trim() || !classStream?.trim()) {
    throw new Error(`Class grade and stream are required to archive marks. Received "${classLabel || "unknown class"}".`);
  }

  if (!allowedExamTypes.has(normalizedExamType)) {
    throw new Error(`Invalid exam phase "${examType}" for ${classLabel}.`);
  }

  const marks = await MarkModel.find({
    classGrade,
    classStream,
    term,
    year,
    examType: normalizedExamType,
  } as any);

  if (marks.length === 0) return null;

  const markStudentIds = Array.from(new Set(marks.map((mark) => mark.studentId.toString())));
  const students = await studentModel
    .find({ class: classGrade, classStream } as any)
    .sort({ studentsName: 1 });

  const knownStudentIds = new Set(students.map((student) => student._id.toString()));
  const missingStudentIds = markStudentIds.filter((studentId) => !knownStudentIds.has(studentId));

  if (missingStudentIds.length > 0) {
    const missingStudents = await studentModel
      .find({ _id: { $in: missingStudentIds } } as any)
      .sort({ studentsName: 1 });

    for (const student of missingStudents) {
      const studentId = student._id.toString();
      if (!knownStudentIds.has(studentId)) {
        students.push(student);
        knownStudentIds.add(studentId);
      }
    }
  }

  if (students.length === 0) {
    throw new Error(`Could not find student records for ${classLabel} while preparing the archive.`);
  }

  const [subjects, classTeacher] = await Promise.all([
    SubjectModel.find({ _id: { $in: Array.from(new Set(marks.map((mark) => mark.subjectId.toString()))) } } as any),
    userModel.findOne({
      class: classGrade,
      classStream,
      $or: [
        { "roles.role1": rolesMapped.CT },
        { "roles.role2": rolesMapped.CT },
        { "roles.role3": rolesMapped.CT },
      ],
    } as any),
  ]);

  const teacherName = (classTeacher as any)?.teachersName || "N/A";
  const subjectNameMap = new Map(subjects.map((subject) => [subject._id.toString(), subject.name]));
  const subjectColumns = Array.from(new Set(marks.map((mark) => mark.subjectId.toString())))
    .map((subjectId) => ({
      id: subjectId,
      name: subjectNameMap.get(subjectId) || `Subject ${subjectId.slice(-6)}`,
    }))
    .sort((left, right) => left.name.localeCompare(right.name));

  const marksByStudent = new Map<string, Map<string, (typeof marks)[number]>>();
  for (const mark of marks) {
    const studentId = mark.studentId.toString();
    const subjectId = mark.subjectId.toString();
    const studentMarks = marksByStudent.get(studentId) || new Map<string, (typeof marks)[number]>();
    studentMarks.set(subjectId, mark);
    marksByStudent.set(studentId, studentMarks);
  }

  const doc = new jsPDF("landscape");
  doc.setFontSize(22);
  doc.setTextColor(20, 50, 40);
  doc.text("Primary School Academic Report", 14, 15);

  doc.setFontSize(14);
  doc.setTextColor(100);
  doc.text(`Class: ${classLabel} | Teacher: ${teacherName}`, 14, 23);
  doc.text(`Term ${term}, ${year} | Phase: ${normalizedExamType.toUpperCase()}`, 14, 30);
  doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 37);

  const tableColumns = [
    "Student",
    "ADM",
    ...subjectColumns.map((subject) => subject.name),
    "Average",
    "Points",
    "Avg Pts",
    "Grade",
  ];
  let hasAtLeastOneScore = false;
  const tableRows = students.map((student) => {
    const studentMarks = marksByStudent.get(student._id.toString()) || new Map();
    let total = 0;
    let totalPoints = 0;
    let count = 0;
    const rowData = [student.studentsName || "Unknown Student", student.ADM || "-"];

    for (const subject of subjectColumns) {
      const mark = studentMarks.get(subject.id);
      const percentage = resolveMarkPercentage(mark);

      if (percentage !== null) {
        rowData.push(String(percentage));
        total += percentage;
        totalPoints += markToPoints(percentage);
        count += 1;
        hasAtLeastOneScore = true;
      } else {
        rowData.push("-");
      }
    }

    const average = count > 0 ? Math.round(total / count) : 0;
    const avgPoints = count > 0 ? Number((totalPoints / count).toFixed(1)) : 0;
    rowData.push(`${average}%`);
    rowData.push(totalPoints.toFixed(1));
    rowData.push(avgPoints.toFixed(1));
    rowData.push(pointsToGrade(avgPoints));
    return rowData;
  });

  if (!hasAtLeastOneScore) {
    throw new Error(
      `No usable scores were found for ${classLabel} in Term ${term}, ${year} (${normalizedExamType}). Upload cancelled to prevent empty archives.`,
    );
  }

  autoTable(doc, {
    head: [tableColumns],
    body: tableRows,
    startY: 45,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [201, 150, 61], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [250, 248, 242] },
  });

  const pdfOutput = doc.output("arraybuffer");
  const pdfBuffer = Buffer.from(pdfOutput);
  const fileName = `archives/${year}/Term${term}/${normalizedExamType}/${classGrade}_${classStream}_${Date.now()}.pdf`
    .replace(/\s+/g, "_");
  const storagePath = fileName;

  const { error: uploadError } = await supabase.storage.from(supabaseBucket).upload(storagePath, pdfBuffer, {
    cacheControl: "3600",
    contentType: "application/pdf",
    upsert: false,
  });

  if (uploadError) {
    throw new Error(`Supabase upload failed for ${classLabel}: ${uploadError.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(supabaseBucket).getPublicUrl(storagePath);

  try {
    const archive = await ArchiveModel.create({
      classGrade,
      classStream,
      term,
      year,
      examType: normalizedExamType,
      pdfUrl: publicUrl,
      storagePath,
    });

    return {
      archiveId: archive._id.toString(),
      classGrade,
      classStream,
      fileName: storagePath,
      storagePath,
      pdfUrl: publicUrl,
      markCount: marks.length,
      studentCount: students.length,
    };
  } catch (error: any) {
    let cleanupNote = "";

    try {
      await removeStoredFiles([storagePath]);
    } catch (cleanupError: any) {
      cleanupNote = ` Cleanup also failed: ${cleanupError.message}`;
    }

    throw new Error(
      `The PDF for ${classLabel} uploaded to Supabase, but the archive record could not be saved. ${error?.message || "Unknown error."}${cleanupNote}`,
    );
  }
}

export async function rollbackArchivedMarks(archives: ArchiveClassMarksResult[]) {
  if (archives.length === 0) return;

  const fileNames = archives
    .map((archive) => archive.storagePath || archive.fileName)
    .filter(Boolean);
  const archiveIds = archives.map((archive) => archive.archiveId).filter(Boolean);
  const cleanupProblems: string[] = [];

  try {
    await removeStoredFiles(fileNames);
  } catch (error: any) {
    cleanupProblems.push(`storage files could not be removed (${error.message})`);
  }

  if (cleanupProblems.length === 0 && archiveIds.length > 0) {
    try {
      await ArchiveModel.deleteMany({ _id: { $in: archiveIds } } as any);
    } catch (error: any) {
      cleanupProblems.push(`archive records could not be removed (${error.message})`);
    }
  }

  if (cleanupProblems.length > 0) {
    throw new Error(cleanupProblems.join("; "));
  }
}

export async function deleteStoredArchiveById(archiveId: string) {
  const deletedArchive = await ArchiveModel.findByIdAndDelete(archiveId);

  if (!deletedArchive) {
    throw new Error("Archive not found.");
  }

  const deletedSnapshot = deletedArchive.toObject();
  const classLabel = getClassLabel(deletedSnapshot.classGrade, deletedSnapshot.classStream);
  const storagePath = resolveArchiveStoragePath(deletedSnapshot);

  if (!storagePath) {
    try {
      await ArchiveModel.create(deletedSnapshot);
    } catch (restoreError: any) {
      throw new Error(
        `The archive for ${classLabel} could not be deleted because its Supabase path is missing, and the database record could not be restored. ${restoreError.message}`,
      );
    }

    throw new Error(
      `The archive for ${classLabel} could not be deleted because its Supabase path is missing. The database record was restored to prevent broken links.`,
    );
  }

  try {
    await removeStoredFiles([storagePath]);
  } catch (error: any) {
    try {
      await ArchiveModel.create({
        ...deletedSnapshot,
        storagePath,
      });
    } catch (restoreError: any) {
      throw new Error(
        `Supabase deletion failed for ${classLabel}, and the archive record could not be restored. ${restoreError.message}`,
      );
    }

    throw new Error(
      `Supabase deletion failed for ${classLabel}. The database record was restored to prevent broken links. ${error.message}`,
    );
  }

  return {
    classLabel,
  };
}
