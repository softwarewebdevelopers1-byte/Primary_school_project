// components/classteacher/shared/helpers.ts
import { cbcBandBg, cbcBandColor, resolveCbcBand, type CbcGradingBand } from "../../../lib/cbcGrading";

export const getSubId = (sid: any): string => {
  if (!sid) return "";
  if (typeof sid === "string") return sid.trim();
  if (typeof sid === "object") {
    const id = sid.id || sid._id || sid.$oid || (typeof sid.toString === "function" ? sid.toString() : "");
    return String(id).trim();
  }
  return String(sid).trim();
};


export const isStudentSubject = (student: any, subject: any) => {
  const subjectId = getSubId(subject?.id || subject?._id);
  if (!subjectId) return false;

  if (subject.isOffered === false) return false;

  const mode = String(subject.enrollmentMode || "compulsory").toLowerCase();
  const isElective = mode === "elective" || !!subject.sharedSlotId;
  
  if (!isElective) return true;

  const enrollments = Array.isArray(student?.enrolledSubjects) ? student.enrolledSubjects : [];

  const exactEnrollment = enrollments.some((entry: any) => {
    const entrySubId = getSubId(entry?.subjectId);
    return entrySubId === subjectId && entry?.isActive !== false;
  });

  if (exactEnrollment) {
    return true;
  }

  return false;
};


export const marksForStudentSubjects = (student: any, subjects: any[]) => {
  const filteredMarks: Record<string, number> = {};
  const slotTaken = new Set<string>();

  // Sort subjects: compulsories first, then electives
  // This helps if there are any weird slot collisions
  const sortedSubjects = [...subjects].sort((a, b) => {
    const aElective = String(a.enrollmentMode).toLowerCase() === "elective" || !!a.sharedSlotId;
    const bElective = String(b.enrollmentMode).toLowerCase() === "elective" || !!b.sharedSlotId;
    if (aElective === bElective) return 0;
    return aElective ? 1 : -1;
  });

  sortedSubjects.forEach((sub) => {
    if (isStudentSubject(student, sub)) {
      const slotId = sub.sharedSlotId ? String(sub.sharedSlotId) : null;
      
      // If this subject is in a shared slot that we already filled for this student, skip
      if (slotId && slotTaken.has(slotId)) {
        return;
      }

      const sid = getSubId(sub.id || sub._id);
      const mark = student?.marks ? student.marks[sid] : null;
      
      if (typeof mark === "number") {
        filteredMarks[sid] = mark;
        if (slotId) slotTaken.add(slotId);
      }
    }
  });

  return filteredMarks;
};


export const getEligibleSubjectCount = (student: any, subjects: any[]) => {
  return subjects.filter(sub => isStudentSubject(student, sub)).length;
};

export const subjectsForStudent = (student: any, subjects: any[]) => {
  return subjects.filter(sub => isStudentSubject(student, sub));
};

export const getAttemptedSubjectCount = (student: any, subjects: any[]) => {
  const marks = marksForStudentSubjects(student, subjects);
  return Object.keys(marks).length;
};





export const avg = (marks: Record<string, number>, subjectCount?: number): number => {
  const vals = Object.values(marks || {}).filter(v => typeof v === "number");
  if (vals.length === 0) return 0;
  const total = vals.reduce((a, b) => a + b, 0);
  const count = subjectCount || vals.length;
  return Math.round(total / count);
};

export const sum = (marks: Record<string, number>): number => {
  return Object.values(marks || {}).reduce((a, b) => a + (typeof b === "number" ? b : 0), 0);
};

export const grade = (v: number, bands: CbcGradingBand[] = []): string => resolveCbcBand(v, bands).cbcBand;

export const gradePoints = (v: number, bands: CbcGradingBand[] = []): number => resolveCbcBand(v, bands).points;


export const sumPoints = (marks: Record<string, number>, bands: CbcGradingBand[] = []): number => {
  return Object.values(marks || {}).reduce((acc, m) => acc + gradePoints(m, bands), 0);
};

export const averagePoints = (marks: Record<string, number>, bands: CbcGradingBand[] = []): number => {
  const vals = Object.values(marks || {}).filter(v => typeof v === "number");
  if (vals.length === 0) return 0;
  return Math.round(sumPoints(marks, bands) / vals.length);
};

export const getSubjectRemark = (score: number, bands: CbcGradingBand[] = []): string => {
  const band = grade(score, bands);
  if (band.startsWith("EE")) return "Exceeding Expectations";
  if (band.startsWith("ME")) return "Meeting Expectations";
  if (band.startsWith("AE")) return "Approaching Expectations";
  if (band.startsWith("BE")) return "Below Expectations";
  return "Configured CBC band";
};

export const gradeColor = (v: number | string): string => {
  return cbcBandColor(typeof v === "number" ? "" : v);
};


export const gradeBg = (v: number | string): string => {
  return cbcBandBg(typeof v === "number" ? "" : v);
};


export const initials = (name: string): string =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const avatarBg = (name: string): string => {
  const h = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const colors = [
    "#1D9E75",
    "#BA7517",
    "#993C1D",
    "#185FA5",
    "#3B6D11",
    "#993556",
  ];
  return colors[h % colors.length];
};
