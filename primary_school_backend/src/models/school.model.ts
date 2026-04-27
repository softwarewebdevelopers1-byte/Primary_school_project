import mongoose, { Schema, Document } from "mongoose";

export interface ISubject extends Document {
  name: string;
  department: string;
}

const SubjectSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  department: { type: String, default: "General" },
});

export const SubjectModel = mongoose.model<ISubject>("Subject", SubjectSchema);

export interface IAssignment extends Document {
  subjectId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  classGrade: string;
  classStream: string;
}

const AssignmentSchema: Schema = new Schema({
  subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: "users", required: true },
  classGrade: { type: String, required: true },
  classStream: { type: String, required: true },
});

export const AssignmentModel = mongoose.model<IAssignment>("Assignment", AssignmentSchema);

export interface IMark extends Document {
  studentId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  classGrade: string;
  classStream: string;
  term: number;
  year: number;
  examType: "opener" | "midterm" | "closing";
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
}

const MarkSchema: Schema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: "users", required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
  classGrade: { type: String, required: true },
  classStream: { type: String, required: true },
  term: { type: Number, required: true },
  year: { type: Number, required: true },
  examType: { type: String, enum: ["opener", "midterm", "closing"], default: "opener" },
  cat1: { type: Number, default: null },
  cat2: { type: Number, default: null },
  cat3: { type: Number, default: null },
  cat4: { type: Number, default: null },
  cat5: { type: Number, default: null },
  cat1Max: { type: Number, default: 40 },
  cat2Max: { type: Number, default: 40 },
  cat3Max: { type: Number, default: 40 },
  cat4Max: { type: Number, default: 40 },
  cat5Max: { type: Number, default: 40 },
  exam: { type: Number, default: null },
  examMax: { type: Number, default: 100 },
  finalScore: { type: Number, default: null },
}, { timestamps: true });

export const MarkModel = mongoose.model<IMark>("Mark", MarkSchema);

export interface IArchive extends Document {
  classGrade: string;
  classStream: string;
  term: number;
  year: number;
  examType: string;
  pdfUrl: string;
  storagePath?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const ArchiveSchema = new Schema({
  classGrade: { type: String, required: true },
  classStream: { type: String, required: true },
  term: { type: Number, required: true },
  year: { type: Number, required: true },
  examType: { type: String, required: true },
  pdfUrl: { type: String, required: true },
  storagePath: { type: String, default: null },
}, { timestamps: true });

export const ArchiveModel = mongoose.model<IArchive>("Archive", ArchiveSchema);

export interface ITimetableBreak {
  label: string;
  startTime: string;
  endTime: string;
}

export interface ITimetableEntry {
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

export interface ITimetableDay {
  day: string;
  entries: ITimetableEntry[];
}

export interface ITimetable extends Document {
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
  breaks: ITimetableBreak[];
  days: ITimetableDay[];
  teacherIds: string[];
  pdfUrl: string;
  storagePath: string;
  generationMode: "ai" | "balanced-fallback";
  aiSummary?: string | null;
  generatedBy?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const TimetableBreakSchema = new Schema<ITimetableBreak>({
  label: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
}, { _id: false });

const TimetableEntrySchema = new Schema<ITimetableEntry>({
  type: { type: String, enum: ["lesson", "break"], required: true },
  label: { type: String, default: null },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  slotNumber: { type: Number, default: null },
  subjectId: { type: String, default: null },
  subjectName: { type: String, default: null },
  teacherId: { type: String, default: null },
  teacherName: { type: String, default: null },
}, { _id: false });

const TimetableDaySchema = new Schema<ITimetableDay>({
  day: { type: String, required: true },
  entries: { type: [TimetableEntrySchema], default: [] },
}, { _id: false });

const TimetableSchema = new Schema<ITimetable>({
  batchId: { type: String, required: true, index: true },
  classGrade: { type: String, required: true, index: true },
  classStream: { type: String, required: true, index: true },
  classTeacherId: { type: String, default: null },
  classTeacherName: { type: String, default: null },
  term: { type: Number, required: true, index: true },
  year: { type: Number, required: true, index: true },
  schoolStartTime: { type: String, required: true },
  subjectsPerDay: { type: Number, required: true },
  subjectDurationMinutes: { type: Number, required: true },
  breaks: { type: [TimetableBreakSchema], default: [] },
  days: { type: [TimetableDaySchema], default: [] },
  teacherIds: { type: [String], default: [], index: true },
  pdfUrl: { type: String, required: true },
  storagePath: { type: String, required: true },
  generationMode: { type: String, enum: ["ai", "balanced-fallback"], default: "balanced-fallback" },
  aiSummary: { type: String, default: null },
  generatedBy: { type: Schema.Types.ObjectId, ref: "users", default: null },
}, { timestamps: true });

export const TimetableModel = mongoose.model<ITimetable>("Timetable", TimetableSchema);
