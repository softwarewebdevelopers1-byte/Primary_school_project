// components/classteacher/shared/helpers.ts

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
  
  // If it's an elective or part of a shared slot, we MUST find an active enrollment entry for THIS specific subjectId
  return enrollments.some((entry: any) => {
    const entrySubId = getSubId(entry?.subjectId);
    return entrySubId === subjectId && entry?.isActive !== false;
  });
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

export const grade = (v: number): string => {
  if (v >= 80) return "A";
  if (v >= 75) return "A-";
  if (v >= 70) return "B+";
  if (v >= 65) return "B";
  if (v >= 60) return "B-";
  if (v >= 55) return "C+";
  if (v >= 50) return "C";
  if (v >= 45) return "C-";
  if (v >= 40) return "D+";
  if (v >= 35) return "D";
  if (v >= 30) return "D-";
  return "E";
};

export const gradePoints = (v: number): number => {
  if (v >= 80) return 12;
  if (v >= 75) return 11;
  if (v >= 70) return 10;
  if (v >= 65) return 9;
  if (v >= 60) return 8;
  if (v >= 55) return 7;
  if (v >= 50) return 6;
  if (v >= 45) return 5;
  if (v >= 40) return 4;
  if (v >= 35) return 3;
  if (v >= 30) return 2;
  return 1;
};

export const sumPoints = (marks: Record<string, number>): number => {
  return Object.values(marks || {}).reduce((acc, m) => acc + gradePoints(m), 0);
};

export const pointsToGrade = (avgPoints: number): string => {
  if (avgPoints >= 11.5) return "A";
  if (avgPoints >= 10.5) return "A-";
  if (avgPoints >= 9.5) return "B+";
  if (avgPoints >= 8.5) return "B";
  if (avgPoints >= 7.5) return "B-";
  if (avgPoints >= 6.5) return "C+";
  if (avgPoints >= 5.5) return "C";
  if (avgPoints >= 4.5) return "C-";
  if (avgPoints >= 3.5) return "D+";
  if (avgPoints >= 2.5) return "D";
  if (avgPoints >= 1.5) return "D-";
  return "E";
};

export const gradeColor = (v: number): string =>
  v >= 80 ? "#3b6d11" : v >= 60 ? "#854f0b" : "#a32d2d";

export const gradeBg = (v: number): string =>
  v >= 80 ? "#eaf3de" : v >= 60 ? "#faeeda" : "#fcebeb";

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
