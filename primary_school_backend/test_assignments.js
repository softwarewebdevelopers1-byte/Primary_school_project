import mongoose from 'mongoose';
import { AssignmentModel, SubjectModel } from './src/models/school.model.js';
import { userModel, studentModel } from './src/models/user.model.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const assignments = await AssignmentModel.find().lean();
  const subjects = await SubjectModel.find().lean();
  console.log('Total assignments:', assignments.length);
  const byClass = {};
  for (const a of assignments) {
    const key = a.classGrade + ' ' + a.classStream;
    if (!byClass[key]) byClass[key] = [];
    byClass[key].push(a.subjectId);
  }
  for (const k in byClass) {
    console.log(k, byClass[k].length, 'subjects');
  }

  const students = await studentModel.find({ class: { $ne: null }, classStream: { $ne: null } }).lean();
  const studentClasses = new Set(students.map(s => s.class + ' ' + s.classStream));
  console.log('Classes with students:', Array.from(studentClasses));
  
  process.exit(0);
}
check();
