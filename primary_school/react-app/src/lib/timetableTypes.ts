export interface TimetableBreak {
  label: string;
  startTime: string;
  endTime: string;
}

export interface TimetableEntry {
  type: "lesson" | "break";
  label?: string | null;
  startTime: string;
  endTime: string;
  slotNumber?: number | null;
  subjectId?: string | null;
  subjectName?: string | null;
  teacherId?: string | null;
  teacherName?: string | null;
}

export interface TimetableDay {
  day: string;
  entries: TimetableEntry[];
}

export interface TimetableRecord {
  id: string;
  batchId: string;
  classGrade: string;
  classStream: string;
  classTeacherId?: string | null;
  classTeacherName?: string | null;
  term: number;
  year: number;
  schoolStartTime: string;
  subjectsPerDay: number;
  subjectDurationMinutes: number;
  breaks: TimetableBreak[];
  days: TimetableDay[];
  teacherIds: string[];
  pdfUrl: string;
  storagePath: string;
  generationMode: "ai" | "balanced-fallback";
  aiSummary?: string | null;
  myLessons: Array<TimetableEntry & { day: string }>;
  createdAt: string;
  updatedAt: string;
}
