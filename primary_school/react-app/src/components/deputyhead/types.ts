// components/deputyhead/types.ts

export type UserRole = "deputy" | "headteacher";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone: string;
  joinDate: string;
}

export interface SchoolStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalStreams: number;
  averageAttendance: number;
  averagePerformance: number;
  boysCount: number;
  girlsCount: number;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  class: string;
  stream: string;
  qualification: string;
  experience: number;
  joinDate: string;
  status: "active" | "inactive" | "onleave";
  avatar?: string;
}

export interface Class {
  id: string;
  name: string;
  streams: Stream[];
  totalStudents: number;
  classTeacher: string;
  academicYear: string;
}

export interface Stream {
  id: string;
  name: string;
  classId: string;
  className: string;
  students: number;
  classTeacher: string;
  classroom: string;
}

export interface Student {
  id: string;
  admissionNumber: string;
  name: string;
  className: string;
  stream: string;
  gender: "Male" | "Female";
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  dateOfBirth: string;
  enrollmentDate: string;
  status: "active" | "inactive" | "transferred";
  avatar?: string;
}

export interface PerformanceData {
  subject: string;
  classAverage: number;
  target: number;
  trend: "up" | "down" | "stable";
  topStudent: string;
  topScore: number;
}

export interface ParentConcern {
  id: string;
  studentName: string;
  studentAdmission: string;
  parentName: string;
  parentEmail: string;
  subject: string;
  message: string;
  date: string;
  status: "pending" | "reviewed" | "resolved";
  response?: string;
}

export interface Report {
  id: string;
  title: string;
  type: "academic" | "attendance" | "disciplinary" | "financial";
  generatedBy: string;
  generatedDate: string;
  description: string;
  fileUrl?: string;
}
