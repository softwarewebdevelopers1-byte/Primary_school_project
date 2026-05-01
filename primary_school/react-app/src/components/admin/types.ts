// components/admin/types.ts

import type {
  StudentSubjectEnrollment,
  SubjectEnrollmentMode,
} from "../../lib/subjectEnrollment";

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
  term?: number;
  year?: number;
  examType?: string;
}

export interface Subject {
  id: string;
  name: string;
  department: string;
  isOffered?: boolean;
  enrollmentMode?: SubjectEnrollmentMode;
  sharedSlotId?: string | null;
}

export interface Class {
  id: string;
  name: string;
  grade: string;
  stream?: string;
  students: number;
  classTeacherId?: string;
  subjectAssignments: Record<string, string>;
  subjectSettings: Record<string, ClassSubjectSetting>;
  offeredSubjectIds: string[];
  droppedSubjectIds: string[];
  compulsorySubjectIds: string[];
  electiveSubjectIds: string[];
  term?: number;
  year?: number;
  examType?: string;
}

export interface Student {
  id: string;
  admissionNo: string;
  name: string;
  gender: string;
  guardianName: string;
  guardianPhone: string;
  classId: string;
  classGrade: string;
  classStream?: string;
  enrolledSubjects: StudentSubjectEnrollment[];
  marks?: Record<string, number>;
  status?: string;
  term?: number;
  year?: number;
  examType?: string;
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
  examType?: string;
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
  enrolledSubjects?: StudentSubjectEnrollment[];
  marks?: Record<string, number>;
  term?: number;
  year?: number;
  examType?: string;
}

export interface ApiAssignment {
  id: string;
  subjectId: string;
  teacherId: string;
  classGrade: string;
  classStream: string;
  enrollmentMode?: SubjectEnrollmentMode;
  sharedSlotId?: string | null;
  studentCount?: number;
}

export interface ClassSubjectSetting {
  id: string;
  subjectId: string;
  classGrade: string;
  classStream: string;
  isOffered: boolean;
  enrollmentMode?: SubjectEnrollmentMode;
  sharedSlotId?: string | null;
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
