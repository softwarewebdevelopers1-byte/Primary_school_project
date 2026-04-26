import bcrypt from "bcrypt";
import {
  rolesMapped,
  studentModel,
  adminModel,
  classTeacherModel,
  subjectTeacher,
} from "../models/user.model.js";
import { SubjectModel, AssignmentModel } from "../models/school.model.js";


type studentsInterface = {
  status: string;
  class: string;
  classStream: string;
  ADM: string;
  role: string;
  studentsName: string;
  password?: string;
};

type teachersInterface = {
  status: string;
  teachersName: string;
  roles: {
    role1: string;
  };
  teacherNumber: string;
  password?: string;
  email?: string;
};

// adding students if none exists
export let newStudent = async () => {
  const hashedPassword = await bcrypt.hash("student123", 10);
  
  const students = [
    {
      status: "active",
      class: "7",
      classStream: "North",
      ADM: "123",
      role: rolesMapped.ST,
      studentsName: "Carlos Student",
      password: hashedPassword,
    },
    {
      status: "active",
      class: "1",
      classStream: "East",
      ADM: "456",
      role: rolesMapped.ST,
      studentsName: "John Student",
      password: hashedPassword,
    }
  ];

  try {
    for (const s of students) {
      const existing = await studentModel.findOne({ ADM: s.ADM });
      if (!existing) {
        await studentModel.create(s);
        
      }
    }
  } catch (error) {
    
  }
};


// adding staff if none exists
export let newStaff = async () => {
  const hashedPassword = await bcrypt.hash("staff123", 10);
  
  // Class Teacher
  const ctData = {
    status: "active",
    teachersName: "Carlos Maina",
    email: "carlosmaina198@gmail.com",
    roles: { role1: rolesMapped.CT },
    teacherNumber: "CT001",
    password: hashedPassword,
    class: "7",
    classStream: "North"
  };

  // Subject Teacher
  const sjData = {
    status: "active",
    teachersName: "John Doe",
    email: "john@gmail.com",
    roles: { role1: rolesMapped.SJ },
    teacherNumber: "SJ001",
    password: hashedPassword
  };

  try {
    // Update or create Class Teacher
    await classTeacherModel.findOneAndUpdate(
      { email: "carlosmaina198@gmail.com" },
      { $set: ctData },
      { upsert: true }
    );
    

    // Update or create Subject Teacher
    const sj = await subjectTeacher.findOneAndUpdate(
      { email: "john@gmail.com" },
      { $set: sjData },
      { upsert: true, new: true }
    );
    
      
    // Assign a subject to this teacher if not assigned
    const subject = await SubjectModel.findOne();
    if (subject && sj) {
      await AssignmentModel.findOneAndUpdate(
        { teacherId: sj._id },
        { 
          $set: {
            subjectId: subject._id,
            classGrade: "7",
            classStream: "North"
          }
        },
        { upsert: true }
      );
      
    }
  } catch (error) {
    
  }
};



