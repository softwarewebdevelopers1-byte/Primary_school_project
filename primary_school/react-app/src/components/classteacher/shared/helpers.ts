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

<<<<<<< HEAD
export const grade = (v: number, bands: CbcGradingBand[] = []): string => resolveCbcBand(v, bands).cbcBand;

export const gradePoints = (v: number, bands: CbcGradingBand[] = []): number => resolveCbcBand(v, bands).points;


export const sumPoints = (marks: Record<string, number>, bands: CbcGradingBand[] = []): number => {
  return Object.values(marks || {}).reduce((acc, m) => acc + gradePoints(m, bands), 0);
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
=======
export const grade = (v: number): string => {
  if (v >= 80) return "EE1";
  if (v >= 65) return "EE2";
  if (v >= 55) return "ME1";
  if (v >= 45) return "ME2";
  if (v >= 35) return "AE1";
  if (v >= 25) return "AE2";
  if (v >= 15) return "BE1";
  return "BE2";
};

export const gradePoints = (v: number): number => {
  if (v >= 80) return 8;
  if (v >= 65) return 7;
  if (v >= 55) return 6;
  if (v >= 45) return 5;
  if (v >= 35) return 4;
  if (v >= 25) return 3;
  if (v >= 15) return 2;
  return 1;
};


export const sumPoints = (marks: Record<string, number>): number => {
  return Object.values(marks || {}).reduce((acc, m) => acc + gradePoints(m), 0);
};

export const pointsToGrade = (avgPoints: number): string => {
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

export const getSubjectRemark = (score: number): string => {
  const pts = gradePoints(score);
  if (pts >= 7) return "Exceeding Expectations";
  if (pts >= 5) return "Meeting Expectations";
  if (pts >= 3) return "Approaching Expectations";
  return "Below Expectations";
};

export const gradeColor = (v: number | string): string => {
  const g = typeof v === "number" ? grade(v) : v;
  if (["EE1", "EE2"].includes(g)) return "#1D9E75";
  if (["ME1", "ME2"].includes(g)) return "#185FA5";
  if (["AE1", "AE2"].includes(g)) return "#BA7517";
  return "#993C1D";
>>>>>>> cba98d0467c8e9b1c2bcb541daaaab117ba973fd
};


export const gradeBg = (v: number | string): string => {
<<<<<<< HEAD
  return cbcBandBg(typeof v === "number" ? "" : v);
=======
  const g = typeof v === "number" ? grade(v) : v;
  if (["EE1", "EE2"].includes(g)) return "#eafaf1";
  if (["ME1", "ME2"].includes(g)) return "#ebf5fb";
  if (["AE1", "AE2"].includes(g)) return "#fef9e7";
  if (["BE1", "BE2"].includes(g)) return "#fdedec";
  return "#f4f4f4";
>>>>>>> cba98d0467c8e9b1c2bcb541daaaab117ba973fd
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
