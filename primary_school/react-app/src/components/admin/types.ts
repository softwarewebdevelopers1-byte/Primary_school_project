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
  code: string;
  department: string;
  periods: number;
}

export interface Class {
  id: string;
  name: string;
  grade: string;
  stream: string;
  capacity: number;
  students: number;
  classTeacherId: string;
  subjectAssignments: Record<string, string>;
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
