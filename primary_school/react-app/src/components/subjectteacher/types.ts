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
    cat1: number | string | null;
    cat2: number | string | null;
    cat3: number | string | null;
    cat4: number | string | null;
    cat5: number | string | null;
    cat1Max: number;
    cat2Max: number;
    cat3Max: number;
    cat4Max: number;
    cat5Max: number;
    exam: number | string | null;
    examMax: number;
    finalScore: number | string | null;
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
      cat1: number | string | null;
      cat2: number | string | null;
      cat3: number | string | null;
      cat4: number | string | null;
      cat5: number | string | null;
      cat1Max: number;
      cat2Max: number;
      cat3Max: number;
      cat4Max: number;
      cat5Max: number;
      exam: number | string | null;
      examMax: number;
      finalScore: number | string | null;
    };
  };
}

export interface MarksTabProps {
  subjects: Subject[];
  activeSubjectId: string;
  students: Student[];
  marksData: MarksData;
  pushedSubjects: Set<string>;
  pushedStudents: Set<string>;
  onSubjectChange: (id: string) => void;
  onMarkUpdate: (subjectId: string, studentId: string, key: string, value: string) => void;
  onConfigUpdate?: (subjectId: string, key: string, value: number | string | null) => void;
  onRemoveCat?: (subjectId: string, catIndex: number) => void;
  onSaveMarks: (subjectId: string, catConfigs?: any) => void;
  onPushMarks: (subjectId: string) => void;
  avatar: (name: string, size: number) => string;
}
