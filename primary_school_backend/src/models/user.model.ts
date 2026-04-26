import mongoose, { Model, Schema } from "mongoose";
import { type teachers, type student, type user } from "./types.js";
//
type roles = "CT" | "SJ" | "DT" | "HT" | "ST" | "ADM";
//
type rolesRecords = Record<roles, string>;

//
export let rolesMapped: rolesRecords = {
  CT: "classteacher",
  SJ: "subjectteacher",
  DT: "deputyteacher",
  HT: "headteacher",
  ST: "student",
  ADM: "admin",
};

// schema for all users
const UserSchema = new Schema<user>({
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  class: {
    type: String,
    default: null,
  },
  classStream: {
    type: String,
    default: null,
  },
  term: {
    type: Number,
    default: 1,
  },
  year: {
    type: Number,
    default: () => new Date().getFullYear(),
  },
});
const teachersSchema = new Schema<teachers>({
  password: {
    type: String,
    default: "staff123",
  },
  teachersName: String,
  email: {
    type: String,
    default: "",
  },
  phone: {
    type: String,
    default: "",
  },
  department: {
    type: String,
    default: "General",
  },
  joinDate: {
    type: String,
    default: () => new Date().toISOString().slice(0, 10),
  },
  roles: {
    role1: {
      type: String,
      default: null,
      enum: [
        rolesMapped.ADM,
        rolesMapped.CT,
        rolesMapped.DT,
        rolesMapped.HT,
        rolesMapped.SJ,
      ],
    },
    role2: {
      type: String,
      default: null,
    },
    role3: {
      type: String,
      default: null,
    },
  },
  teacherNumber: String,
  subjects: {
    subject1: {
      type: String,
      default: null,
    },
    subject2: {
      type: String,
      default: null,
    },
  },
});
const studentSchema = new Schema<student>({
  password: {
    type: String,
    default: "student123",
  },
  studentsName: String,
  role: String,
  ADM: String,
  guardianName: {
    type: String,
    default: "",
  },
  guardianPhone: {
    type: String,
    default: "",
  },
  gender: {
    type: String,
    default: "",
  },
  joinDate: {
    type: String,
    default: () => new Date().toISOString().slice(0, 10),
  },
});
export const userModel =
  (mongoose.models.users as Model<user>) ||
  mongoose.model<user>("users", UserSchema);

//   adding additional properties when role is not student
export let adminModel = userModel.discriminator(
  rolesMapped.ADM,
  teachersSchema,
);
export let headTeacherModel = userModel.discriminator(
  rolesMapped.HT,
  teachersSchema,
);
export let deputyModel = userModel.discriminator(
  rolesMapped.DT,
  teachersSchema,
);
export let classTeacherModel = userModel.discriminator(
  rolesMapped.CT,
  teachersSchema,
);
export let subjectTeacher = userModel.discriminator(
  rolesMapped.SJ,
  teachersSchema,
);
export let studentModel = userModel.discriminator(
  rolesMapped.ST,
  studentSchema,
);
