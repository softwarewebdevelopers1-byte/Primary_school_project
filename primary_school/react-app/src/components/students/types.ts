export interface Student {
  id: string;
  name: string;
  grade: string;
  class: string;
  admissionNumber: string;
  parentEmail: string;
  parentPhone: string;
  avatar?: string;
  school: string;
  house: string;
  learningStreak: number;
  weeklyGoalHours: number;
  completedHours: number;
}

export interface LearningMaterial {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  uploadedDate: string;
  fileType: "pdf" | "doc" | "ppt" | "video";
  fileUrl: string;
  description: string;
  duration: string;
  topic: string;
  isNew: boolean;
  completed: boolean;
  downloads: number;
  saved: boolean;
}

export interface Assessment {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  dueDate: string;
  totalMarks: number;
  obtainedMarks?: number;
  status: "pending" | "submitted" | "graded" | "late";
  penalty?: number;
  questions: AssessmentQuestion[];
  instructions: string;
  attemptsAllowed: number;
  submittedAt?: string;
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  type: "multiple-choice" | "short-answer" | "essay";
  options?: string[];
  marks: number;
  studentAnswer?: string;
  feedback?: string;
}

export interface QuestionTask {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  deadline: string;
  totalMarks: number;
  obtainedMarks?: number;
  status: "pending" | "submitted" | "graded" | "late";
  penalty: number;
  questions: QuestionItem[];
  instructions: string;
  submittedAt?: string;
}

export interface QuestionItem {
  id: string;
  text: string;
  marks: number;
  studentAnswer?: string;
  teacherFeedback?: string;
}

export interface Badge {
  id: string;
  rank: 1 | 2 | 3;
  subject: string;
  term: string;
  year: number;
  dateEarned: string;
  title: string;
}

export interface SubjectProgress {
  subject: string;
  mastery: number;
  target: number;
  teacher: string;
}

export interface Portfolio {
  studentId: string;
  badges: Badge[];
  averageScore: number;
  totalAssessments: number;
  totalQuestions: number;
  attendanceRate: number;
  teacherComments: string[];
  strengths: string[];
  growthAreas: string[];
  subjectProgress: SubjectProgress[];
}
