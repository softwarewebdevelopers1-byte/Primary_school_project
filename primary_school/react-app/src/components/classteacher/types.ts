// components/classteacher/types.ts

export interface Student {
  id: string;
  admissionNumber: string;
  name: string;
  className: string;
  stream: string;
  gender: "Male" | "Female";
  dateOfBirth: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  address: string;
  enrollmentDate: string;
  status: "Active" | "Inactive" | "Transferred";
  avatar?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  teacher: string;
}

export interface Mark {
  id: string;
  studentId: string;
  subjectId: string;
  subjectName: string;
  assessmentType: "CAT1" | "CAT2" | "CAT3" | "EndTerm" | "Assignment";
  marks: number;
  maxMarks: number;
  date: string;
  term: number;
  year: number;
}

export interface TermResult {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  subjects: {
    subjectName: string;
    cat1: number | null;
    cat2: number | null;
    cat3: number | null;
    endTerm: number | null;
    assignments: number[];
    total: number;
    grade: string;
    points: number;
  }[];
  totalMarks: number;
  average: number;
  meanGrade: string;
  totalPoints: number;
  position: number;
  classSize: number;
}

export interface StreamInfo {
  id: string;
  name: string;
  className: string;
  classTeacher: string;
  academicYear: string;
  term: number;
  totalStudents: number;
}

export interface PerformanceSummary {
  subject: string;
  classAverage: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
}
