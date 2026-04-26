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
  createdAt: Date;
}

const ArchiveSchema = new Schema({
  classGrade: { type: String, required: true },
  classStream: { type: String, required: true },
  term: { type: Number, required: true },
  year: { type: Number, required: true },
  examType: { type: String, required: true },
  pdfUrl: { type: String, required: true },
}, { timestamps: true });

export const ArchiveModel = mongoose.model<IArchive>("Archive", ArchiveSchema);
