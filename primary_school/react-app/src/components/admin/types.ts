// components/admin/types.ts

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  department: string;
  roles: string[];
  roleLabel: string;
  teacherNumber?: string;
  classGrade?: string;
  classStream?: string;
  subjects?: string[];
  joinDate?: string;
}

export interface Subject {
  id: string;
  name: string;
  department: string;
}

export interface Class {
  id: string;
  name: string;
  grade: string;
  stream?: string;
  students: number;
  classTeacherId?: string;
  subjectAssignments: Record<string, string>;
  term?: number;
  year?: number;
}

export interface Student {
  id: string;
  admissionNo: string;
  name: string;
  gender: string;
  guardianName: string;
  guardianPhone: string;
  classId: string;
  status?: string;
}

export interface ApiTeacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  department: string;
  roles: string[];
  roleLabel: string;
  teacherNumber?: string;
  classGrade?: string;
  classStream?: string;
  subjects?: string[];
  joinDate?: string;
  term?: number;
  year?: number;
}

export interface ApiStudent {
  id: string;
  admissionNo: string;
  name: string;
  gender: string;
  guardianName: string;
  guardianPhone: string;
  status?: string;
  classGrade: string;
  classStream?: string;
  joinDate?: string;
  term?: number;
  year?: number;
}

export interface ApiAssignment {
  id: string;
  subjectId: string;
  teacherId: string;
  classGrade: string;
  classStream: string;
}

export interface UsersDashboardResponse {
  staff: ApiTeacher[];
  students: ApiStudent[];
  subjects: Subject[];
  assignments: ApiAssignment[];
}

export interface Assignment {
  id: string;
  subjectId: string;
  teacherId: string;
  classGrade: string;
  classStream: string;
}

export interface NavItem {
  id: string;
  label: string;
  svg: string;
}
