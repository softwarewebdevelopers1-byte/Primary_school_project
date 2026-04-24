// components/classteacher/types.ts
export interface StreamInfo {
  id: string;
  name: string;
  className: string;
  classTeacher: string;
  academicYear: string;
  term: number;
  totalStudents: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  teacher: string;
  avg?: number;
  pass?: number;
}

export interface Student {
  id: string;
  admissionNumber: string;
  name: string;
  gender: string;
  dob: string;
  parentName: string;
  parentPhone: string;
  status: string;
  marks: Record<string, number>;
}

export interface NavItem {
  id: string;
  label: string;
  desc: string;
  Icon: React.FC;
}
