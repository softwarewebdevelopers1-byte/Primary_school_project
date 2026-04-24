// components/admin/types.ts

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  department: string;
  joinDate?: string;
}

export interface Subject {
  id: string;
  name: string;
  department: string;
  assignedTeacherId: string;
}

export interface Class {
  id: string;
  name: string;
  grade: string;
  stream?: string;
  students: number;
  classTeacherId?: string;
  subjectAssignments: Record<string, string>;
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

export interface Assignment {
  subjectId: string;
  teacherId: string;
}

export interface NavItem {
  id: string;
  label: string;
  svg: string;
}
