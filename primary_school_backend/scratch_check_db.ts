import mongoose from "mongoose";
import { studentModel } from "./src/models/user.model.js";
import DotEnvFile from "./src/config/env.js";

async function checkStudents() {
  await mongoose.connect(DotEnvFile.DatabaseConnectionString);
  
  
  const students = await studentModel.find();
  );
  
  const class7North = await studentModel.find({ class: "7", classStream: "North" });
  );
  
  await mongoose.disconnect();
}

checkStudents();
