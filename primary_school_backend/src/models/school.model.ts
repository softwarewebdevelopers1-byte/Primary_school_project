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
  cat1: number | null;
  cat2: number | null;
  exam: number | null;
  finalScore: number | null;
}

const MarkSchema: Schema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: "users", required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
  classGrade: { type: String, required: true },
  classStream: { type: String, required: true },
  term: { type: Number, required: true },
  year: { type: Number, required: true },
  cat1: { type: Number, default: null },
  cat2: { type: Number, default: null },
  exam: { type: Number, default: null },
  finalScore: { type: Number, default: null },
}, { timestamps: true });

export const MarkModel = mongoose.model<IMark>("Mark", MarkSchema);
