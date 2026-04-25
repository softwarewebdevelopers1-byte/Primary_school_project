// components/subjectteacher/types.ts

export interface Subject {
  id: string;
  name: string;
  grade: string;
  students: number;
  avg: number;
  pushed: boolean;
  term: number;
  lastAssess: string;
  classGrade: string;
  classStream: string;
}

export interface Student {
  id: string;
  adm: string;
  name: string;
  gender: string;
  marks: {
    cat1: number | null;
    cat2: number | null;
    cat3: number | null;
    cat4: number | null;
    cat5: number | null;
    cat1Max: number;
    cat2Max: number;
    cat3Max: number;
    cat4Max: number;
    cat5Max: number;
    exam: number | null;
    examMax: number;
    finalScore: number | null;
  };
  pushed: boolean;
}

export interface Assessment {
  title: string;
  subject: string;
  date: string;
  max: number;
  status: string;
}

export interface Resource {
  title: string;
  type: string;
  size: string;
  date: string;
}

export interface MarksData {
  [subjectId: string]: {
    [studentId: string]: {
      cat1: number | null;
      cat2: number | null;
      cat3: number | null;
      cat4: number | null;
      cat5: number | null;
      cat1Max: number;
      cat2Max: number;
      cat3Max: number;
      cat4Max: number;
      cat5Max: number;
      exam: number | null;
      examMax: number;
      finalScore: number | null;
    };
  };
}
