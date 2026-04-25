import mongoose from "mongoose";
import { studentModel } from "./src/models/user.model.js";
import DotEnvFile from "./src/config/env.js";

async function checkStudents() {
  await mongoose.connect(DotEnvFile.DatabaseConnectionString);
  console.log("Connected to DB");
  
  const students = await studentModel.find();
  console.log("All Students:", JSON.stringify(students, null, 2));
  
  const class7North = await studentModel.find({ class: "7", classStream: "North" });
  console.log("Class 7 North Students:", JSON.stringify(class7North, null, 2));
  
  await mongoose.disconnect();
}

checkStudents();
