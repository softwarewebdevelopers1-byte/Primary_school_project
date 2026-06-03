import mongoose, { Schema, Document } from "mongoose";
import type { SubjectEnrollmentMode } from "../utils/subjectEnrollment.js";

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

export interface IClassSubjectSetting extends Document {
  subjectId: mongoose.Types.ObjectId;
  classGrade: string;
  classStream: string;
  isOffered: boolean;
  enrollmentMode: SubjectEnrollmentMode;
  sharedSlotId?: string | null;
  updatedBy?: string | null;
}

const ClassSubjectSettingSchema: Schema = new Schema({
  subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
  classGrade: { type: String, required: true },
  classStream: { type: String, required: true, default: "" },
  isOffered: { type: Boolean, default: false },
  enrollmentMode: { type: String, enum: ["compulsory", "elective"], default: "compulsory" },
  sharedSlotId: { type: String, default: null },
  updatedBy: { type: String, default: null },
}, { timestamps: true });

ClassSubjectSettingSchema.index(
  { subjectId: 1, classGrade: 1, classStream: 1 },
  { unique: true },
);

export const ClassSubjectSettingModel = mongoose.model<IClassSubjectSetting>(
  "ClassSubjectSetting",
  ClassSubjectSettingSchema,
);

export interface ICbcGradingBand extends Document {
  minMarks: number;
  maxMarks: number;
  cbcBand: string;
  points: number;
  sortOrder: number;
  createdBy?: string | null;
}

const CbcGradingBandSchema: Schema = new Schema({
  minMarks: { type: Number, required: true },
  maxMarks: { type: Number, required: true },
  cbcBand: { type: String, required: true, trim: true },
  points: { type: Number, required: true },
  sortOrder: { type: Number, default: 0, index: true },
  createdBy: { type: String, default: null },
}, { timestamps: true });

CbcGradingBandSchema.index({ cbcBand: 1 }, { unique: true });
CbcGradingBandSchema.index({ sortOrder: 1, minMarks: -1 });

export const CbcGradingBandModel = mongoose.model<ICbcGradingBand>(
  "CbcGradingBand",
  CbcGradingBandSchema,
);

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
  cbcBand?: string | null;
  points?: number | null;
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
  cbcBand: { type: String, default: null },
  points: { type: Number, default: null },
}, { timestamps: true });

export const MarkModel = mongoose.model<IMark>("Mark", MarkSchema);

export interface ITimetableParallelLesson {
  subjectId: string;
  subjectName: string;
  teacherId?: string | null;
  teacherName?: string | null;
  enrollmentMode?: SubjectEnrollmentMode | null;
  sharedSlotId?: string | null;
}

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
  enrollmentMode?: SubjectEnrollmentMode | null;
  sharedSlotId?: string | null;
  parallelLessons?: ITimetableParallelLesson[];
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
  enrollmentMode: { type: String, enum: ["compulsory", "elective"], default: null },
  sharedSlotId: { type: String, default: null },
  parallelLessons: {
    type: [
      new Schema<ITimetableParallelLesson>({
        subjectId: { type: String, required: true },
        subjectName: { type: String, required: true },
        teacherId: { type: String, default: null },
        teacherName: { type: String, default: null },
        enrollmentMode: { type: String, enum: ["compulsory", "elective"], default: null },
        sharedSlotId: { type: String, default: null },
      }, { _id: false }),
    ],
    default: [],
  },
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

export interface ISchoolSetting extends Document {
  key: string;
  value: any;
}

const SchoolSettingSchema = new Schema<ISchoolSetting>({
  key: { type: String, required: true, unique: true, index: true },
  value: { type: Schema.Types.Mixed, default: null },
}, { timestamps: true });

export const SchoolSettingModel = mongoose.model<ISchoolSetting>(
  "SchoolSetting",
  SchoolSettingSchema,
);

export interface IExitedStudentExamSummary {
  term: number;
  year: number;
  examType: string;
  classGrade: string;
  classStream: string;
  total: number;
  points: number;
  average: number;
  cbcBand: string;
  subjectCount: number;
}

export interface IExitedStudent extends Document {
  studentId: mongoose.Types.ObjectId;
  admissionNo: string;
  name: string;
  gender?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  finalClassGrade: string;
  finalClassStream: string;
  exitReason: string;
  exitedAt: Date;
  statusAtExit: string;
  examSummaries: IExitedStudentExamSummary[];
  totalPoints: number;
  averagePercentage: number;
  examCount: number;
}

const ExitedStudentExamSummarySchema = new Schema<IExitedStudentExamSummary>({
  term: { type: Number, required: true },
  year: { type: Number, required: true },
  examType: { type: String, required: true },
  classGrade: { type: String, default: "" },
  classStream: { type: String, default: "" },
  total: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  average: { type: Number, default: 0 },
  cbcBand: { type: String, default: "" },
  subjectCount: { type: Number, default: 0 },
}, { _id: false });

const ExitedStudentSchema = new Schema<IExitedStudent>({
  studentId: { type: Schema.Types.ObjectId, ref: "users", required: true, unique: true, index: true },
  admissionNo: { type: String, required: true, index: true },
  name: { type: String, required: true },
  gender: { type: String, default: null },
  guardianName: { type: String, default: null },
  guardianPhone: { type: String, default: null },
  finalClassGrade: { type: String, required: true, index: true },
  finalClassStream: { type: String, default: "" },
  exitReason: { type: String, default: "completed-final-grade" },
  exitedAt: { type: Date, default: Date.now },
  statusAtExit: { type: String, default: "completed" },
  examSummaries: { type: [ExitedStudentExamSummarySchema], default: [] },
  totalPoints: { type: Number, default: 0 },
  averagePercentage: { type: Number, default: 0 },
  examCount: { type: Number, default: 0 },
}, { timestamps: true });

export const ExitedStudentModel = mongoose.model<IExitedStudent>(
  "ExitedStudent",
  ExitedStudentSchema,
);

export interface IParentConcern extends Document {
  parentId: mongoose.Types.ObjectId;
  parentName: string;
  parentPhone: string;
  studentId?: mongoose.Types.ObjectId | null;
  studentName?: string | null;
  admissionNo?: string | null;
  classGrade?: string | null;
  classStream?: string | null;
  message: string;
  status: "Open" | "Pending" | "Resolved";
  priority: "Low" | "Medium" | "High";
  expiresAt: Date;
}

const ParentConcernSchema = new Schema<IParentConcern>({
  parentId: { type: Schema.Types.ObjectId, ref: "users", required: true, index: true },
  parentName: { type: String, required: true },
  parentPhone: { type: String, default: "" },
  studentId: { type: Schema.Types.ObjectId, ref: "users", default: null },
  studentName: { type: String, default: null },
  admissionNo: { type: String, default: null },
  classGrade: { type: String, default: null },
  classStream: { type: String, default: null },
  message: { type: String, required: true, trim: true },
  status: { type: String, enum: ["Open", "Pending", "Resolved"], default: "Open", index: true },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium", index: true },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
  },
}, { timestamps: true });

ParentConcernSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const ParentConcernModel = mongoose.model<IParentConcern>(
  "ParentConcern",
  ParentConcernSchema,
);
