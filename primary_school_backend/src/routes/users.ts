import { Router } from "express";
import type { Response, Request } from "express";
import bcrypt from "bcrypt";
import { userModel, studentModel, adminModel, classTeacherModel, subjectTeacher, deputyModel, headTeacherModel, rolesMapped } from "../models/user.model.js";
import { SubjectModel, AssignmentModel, MarkModel } from "../models/school.model.js";

const router = Router();

// POST login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user: any = await userModel.findOne({ 
      $or: [{ email }, { ADM: email }] // Support email or Admission No (for students)
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Extract all roles
    const roles = [];
    if (user.__t === rolesMapped.ST) {
      roles.push("student");
    } else {
      if (user.roles?.role1) roles.push(user.roles.role1);
      if (user.roles?.role2) roles.push(user.roles.role2);
      if (user.roles?.role3) roles.push(user.roles.role3);
      
      // Fallback to discriminator name if roles object is empty (legacy)
      if (roles.length === 0 && user.__t) {
        roles.push(user.__t);
      }
    }

    res.json({
      id: user._id,
      name: user.teachersName || user.studentsName,
      email: user.email || user.ADM,
      roles,
      primaryRole: roles[0],
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.teachersName || user.studentsName)}&background=random&color=fff`,
      classGrade: user.class,
      classStream: user.classStream,
      subjects: user.subjects ? [user.subjects.subject1, user.subjects.subject2].filter(Boolean) : [],
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

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

router.get("/class/:grade/:stream", async (req: Request, res: Response) => {
  try {
    const { grade, stream } = req.params;
    const students = await userModel.find({ 
      __t: rolesMapped.ST, 
      class: grade, 
      classStream: stream 
    } as any);
    
    // Fetch all marks for these students in this class
    const studentIds = students.map(s => s._id);
    const allMarks = await MarkModel.find({
      studentId: { $in: studentIds },
      classGrade: grade,
      classStream: stream,
      term: 1, // Default to term 1 for now
      year: 2024
    } as any);

    const mapped = students.map((s: any) => {
      // Create a marks object: { subjectId: score }
      // We prioritize finalScore, then cat/exam average
      const studentMarks: Record<string, number> = {};
      
      allMarks.filter(m => m.studentId.toString() === s._id.toString()).forEach(m => {
        if (m.finalScore !== null) {
          studentMarks[m.subjectId.toString()] = m.finalScore;
        } else {
          // Fallback to calculated average of cat1, cat2, exam if finalScore is missing
          const components = [m.cat1, m.cat2, m.exam].filter(v => v !== null) as number[];
          if (components.length > 0) {
            // This is a simple fallback, might need adjustment based on weighting
            const avg = components.reduce((a, b) => a + b, 0) / components.length;
            studentMarks[m.subjectId.toString()] = Math.round(avg);
          }
        }
      });

      return {
        id: s._id,
        name: s.studentsName,
        admissionNumber: s.ADM,
        gender: s.gender,
        parentName: s.guardianName,
        parentPhone: s.guardianPhone,
        status: s.status,
        marks: studentMarks
      };
    });
    
    res.json(mapped);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new user
router.post("/", async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    if (role !== rolesMapped.ST) {
      const existing = await userModel.findOne({ email: req.body.email });
      if (existing) {
        return res.status(400).json({ message: "Staff with this email already exists." });
      }
    }

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
      const rolesArray = Array.isArray(req.body.roles) ? req.body.roles : [req.body.role].filter(Boolean);
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
          role1: rolesArray[0] || null,
          role2: rolesArray[1] || null,
          role3: rolesArray[2] || null,
        },
        password: hashedPassword,
      };

      // Determine primary discriminator based on first role
      const primaryRole = rolesArray[0] || rolesMapped.SJ;

      if (primaryRole === rolesMapped.ADM) newUser = await adminModel.create(staffData);
      else if (primaryRole === rolesMapped.CT) newUser = await classTeacherModel.create(staffData);
      else if (primaryRole === rolesMapped.SJ) newUser = await subjectTeacher.create(staffData);
      else if (primaryRole === rolesMapped.DT) newUser = await deputyModel.create(staffData);
      else if (primaryRole === rolesMapped.HT) newUser = await headTeacherModel.create(staffData);
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
      const rolesArray = Array.isArray(req.body.roles) ? req.body.roles : [req.body.role].filter(Boolean);
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
      
      if (rolesArray.length > 0) {
        updateData.roles = {
          role1: rolesArray[0] || null,
          role2: rolesArray[1] || null,
          role3: rolesArray[2] || null,
        };
      }
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
