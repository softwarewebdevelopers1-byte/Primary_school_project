// components/subjectteacher/types.ts

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  department: string;
  avatar?: string;
  joinDate: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  class: string;
  stream: string;
  students: number;
  sessionsPerWeek: number;
  teacherId: string;
}

export interface Student {
  id: string;
  admissionNumber: string;
  name: string;
  className: string;
  stream: string;
  gender: "Male" | "Female";
  avatar?: string;
}

export interface Assessment {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  type: "CAT1" | "CAT2" | "CAT3" | "Assignment" | "Quiz" | "Project";
  class: string;
  stream: string;
  maxMarks: number;
  date: string;
  deadline: string;
  status: "draft" | "published" | "closed";
  description: string;
}

export interface StudentMark {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  assessmentId: string;
  assessmentTitle: string;
  marks: number | null;
  maxMarks: number;
  percentage: number | null;
  grade: string | null;
  remarks: string;
  submittedAt: string | null;
  status: "pending" | "submitted" | "graded";
}

export interface ClassPerformance {
  subjectId: string;
  subjectName: string;
  className: string;
  stream: string;
  totalStudents: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  topPerformers: {
    studentId: string;
    studentName: string;
    score: number;
  }[];
  gradeDistribution: {
    grade: string;
    count: number;
    percentage: number;
  }[];
}

export interface Resource {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  type: "note" | "video" | "assignment" | "pastpaper" | "syllabus";
  fileUrl: string;
  fileSize: string;
  uploadDate: string;
  description: string;
  downloads: number;
}
