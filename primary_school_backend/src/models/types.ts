export interface user {
  status: string;
  class: string | null;
  classStream: string | null;
  term: number;
  year: number;
}

export interface teachers {
  password: string;
  teachersName: string;
  email: string;
  phone: string;
  department: string;
  joinDate: string;
  roles: {
    role1: string;
    role2: string;
    role3: string;
  };
  teacherNumber: string;
  subjects: {
    subject1: string;
    subject2: string;
  };
}

export interface student {
  password: string;
  studentsName: string;
  role: string;
  ADM: string;
  guardianName: string;
  guardianPhone: string;
  gender: string;
  joinDate: string;
}
