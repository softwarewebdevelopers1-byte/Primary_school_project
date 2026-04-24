import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    roleLabel: { type: String, required: true },
    dashboardPath: { type: String, required: true },
    availableDashboards: { type: [String], default: [] },
  },
  { timestamps: true },
);

export const UserModel = model("User", userSchema);
