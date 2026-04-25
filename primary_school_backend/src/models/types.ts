// for discriminator
export interface user {
  status: string;
  class: string;
  classStream: string;
}
export interface teachers {
  password: string;
  teachersName: string;
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
// discriminators interfaces
export interface student {
  password: string;
  studentsName: string;
  role: string;
  ADM: string;
}
