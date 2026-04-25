import {
  rolesMapped,
  studentModel,
  adminModel,
} from "../models/user.model.js";

type studentsInterface = {
  status: string;
  class: string;
  classStream: string;
  ADM: string;
  role: string;
  studentsName: string;
};

type teachersInterface = {
  status: string;
  teachersName: string;
  roles: {
    role1: string;
  };
  teacherNumber: string;
};
// adding students if none exists
export let newStudent = async () => {
  let studentsData: studentsInterface = {
    status: "active",
    class: "7",
    classStream: "North",
    ADM: "123",
    role: rolesMapped.ST,
    studentsName: "Carlos Maina",
  };
  let studentsEnrolled = await studentModel.find();
  try {
    if (studentsEnrolled.length === 0) {
      await studentModel.create(studentsData);
      console.log("first student added to the database without error");
    }
  } catch (error) {
    console.log(
      `This error occured when adding first student in the database ${error}`,
    );
  }
};
// adding admin if none exists
export let newAdmin = async () => {
  let adminData: teachersInterface = {
    status: "active",
    teachersName: "Lucy Wanjiku",
    roles: {
      role1: "admin",
    },
    teacherNumber: "admin#2024",
  };
  let teachersEnrolled = await adminModel.find();
  try {
    if (teachersEnrolled.length === 0) {
      await adminModel.create(adminData);
      console.log("first admin role added");
    }
  } catch (error) {
    console.log(`This error occured when adding new admin role ${error}`);
  }
};
