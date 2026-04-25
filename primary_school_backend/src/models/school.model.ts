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
