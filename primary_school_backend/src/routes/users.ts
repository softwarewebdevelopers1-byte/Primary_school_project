import { Router } from "express";
import type { Response, Request } from "express";
import bcrypt from "bcrypt";
import {
  userModel,
  studentModel,
  adminModel,
  classTeacherModel,
  subjectTeacher,
  deputyModel,
  headTeacherModel,
  rolesMapped,
} from "../models/user.model.js";
import { SubjectModel, AssignmentModel } from "../models/school.model.js";

const router = Router();

// GET all users (staff and students) + subjects and assignments
router.get("/", async (req: Request, res: Response) => {
  try {
    const [allUsers, allSubjects, allAssignments] = await Promise.all([
      userModel.find(),
      SubjectModel.find(),
      AssignmentModel.find(),
    ]);
    
    const students = allUsers.filter((u: any) => u.__t === rolesMapped.ST);
    const staff = allUsers.filter((u: any) => u.__t !== rolesMapped.ST);

    // Map backend models to frontend expected format if necessary
    const mappedStudents = students.map((s: any) => ({
      id: s._id,
      admissionNo: s.ADM,
      name: s.studentsName,
      gender: s.gender,
      guardianName: s.guardianName,
      guardianPhone: s.guardianPhone,
      classGrade: s.class,
      classStream: s.classStream,
      status: s.status,
    }));

    const mappedStaff = staff.map((t: any) => ({
      id: t._id,
      name: t.teachersName,
      email: t.email,
      phone: t.phone,
      department: t.department,
      role: t.__t,
      roleLabel: t.__t ? t.__t.charAt(0).toUpperCase() + t.__t.slice(1) : "Staff",
      status: t.status,
      classGrade: t.class,
      classStream: t.classStream,
      subjects: t.subjects ? [t.subjects.subject1, t.subjects.subject2].filter(Boolean) : [],
      teacherNumber: t.teacherNumber,
      joinDate: t.joinDate,
    }));

    res.json({
      students: mappedStudents,
      staff: mappedStaff,
      subjects: allSubjects.map((s: any) => ({
        id: s._id,
        name: s.name,
        department: s.department,
      })),
      assignments: allAssignments.map((a: any) => ({
        id: a._id,
        subjectId: a.subjectId,
        teacherId: a.teacherId,
        classGrade: a.classGrade,
        classStream: a.classStream,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new user
router.post("/", async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    let newUser;

    if (role === rolesMapped.ST) {
      const hashedPassword = await bcrypt.hash("student123", 10);
      newUser = await studentModel.create({
        studentsName: req.body.name,
        ADM: req.body.admissionNo,
        gender: req.body.gender,
        guardianName: req.body.guardianName,
        guardianPhone: req.body.guardianPhone,
        class: req.body.classGrade,
        classStream: req.body.classStream,
        status: req.body.status || "active",
        role: rolesMapped.ST,
        password: hashedPassword,
      });
    } else {
      const hashedPassword = await bcrypt.hash("staff123", 10);
      const staffData = {
        teachersName: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        department: req.body.department,
        status: req.body.status || "active",
        class: req.body.classGrade,
        classStream: req.body.classStream,
        subjects: {
          subject1: req.body.subjects?.[0] || null,
          subject2: req.body.subjects?.[1] || null,
        },
        roles: {
          role1: role
        },
        password: hashedPassword,
      };

      if (role === rolesMapped.ADM) newUser = await adminModel.create(staffData);
      else if (role === rolesMapped.CT) newUser = await classTeacherModel.create(staffData);
      else if (role === rolesMapped.SJ) newUser = await subjectTeacher.create(staffData);
      else if (role === rolesMapped.DT) newUser = await deputyModel.create(staffData);
      else if (role === rolesMapped.HT) newUser = await headTeacherModel.create(staffData);
      else throw new Error("Invalid role provided");
    }

    res.status(201).json(newUser);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update a user
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    let updateData: any = {};
    if (role === rolesMapped.ST) {
      updateData = {
        studentsName: req.body.name,
        ADM: req.body.admissionNo,
        gender: req.body.gender,
        guardianName: req.body.guardianName,
        guardianPhone: req.body.guardianPhone,
        class: req.body.classGrade,
        classStream: req.body.classStream,
        status: req.body.status,
      };
    } else {
      updateData = {
        teachersName: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        department: req.body.department,
        status: req.body.status,
        class: req.body.classGrade,
        classStream: req.body.classStream,
        subjects: {
          subject1: req.body.subjects?.[0] || null,
          subject2: req.body.subjects?.[1] || null,
        },
      };
    }

    const updatedUser = await userModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json(updatedUser);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a user
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedUser = await userModel.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
