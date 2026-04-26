import { Router } from "express";
import type { Response, Request } from "express";
import mongoose from "mongoose";
import { SubjectModel, AssignmentModel } from "../models/school.model.js";
import { studentModel, rolesMapped } from "../models/user.model.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

// Subjects
router.get("/subjects", async (req: Request, res: Response) => {
  try {
    const subjects = await SubjectModel.find();
    res.json(subjects);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/subjects", async (req: Request, res: Response) => {
  try {
    const { name, department } = req.body;
    const newSubject = await SubjectModel.create({ name, department });
    res.status(201).json(newSubject);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/subjects/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, department } = req.body;
    const updatedSubject = await SubjectModel.findByIdAndUpdate(id, { name, department }, { new: true });
    res.json(updatedSubject);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/subjects/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await SubjectModel.findByIdAndDelete(id);
    // Also delete assignments for this subject
    await AssignmentModel.deleteMany({ subjectId: id } as any);
    res.json({ message: "Subject deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Assignments
router.get("/assignments", async (req: Request, res: Response) => {
  try {
    const assignments = await AssignmentModel.find().populate("subjectId").populate("teacherId");
    res.json(assignments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/assignments/teacher/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const assignments = await AssignmentModel.find({ teacherId: id } as any).populate("subjectId");
    
    // Filter out assignments where the subject no longer exists in the system
    const validAssignments = assignments.filter((a: any) => a.subjectId != null);

    // Add student count to each valid assignment
    const enrichedAssignments = await Promise.all(validAssignments.map(async (a: any) => {
      const studentCount = await studentModel.countDocuments({
        class: a.classGrade,
        classStream: a.classStream
      } as any);
      
      return {
        ...a.toObject(),
        studentCount
      };
    }));

    res.json(enrichedAssignments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/assignments", async (req: Request, res: Response) => {
  try {
    const { subjectId, teacherId, classGrade, classStream } = req.body;
    
    // Upsert assignment
    const assignment = await AssignmentModel.findOneAndUpdate(
      { subjectId, classGrade, classStream } as any,
      { teacherId },
      { new: true, upsert: true }
    );
    
    res.status(201).json(assignment);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/assignments/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await AssignmentModel.findByIdAndDelete(id);
    res.json({ message: "Assignment deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Archives
router.get("/archives", async (req: Request, res: Response) => {
  try {
    const { classGrade, classStream } = req.query;
    const { ArchiveModel } = await import("../models/school.model.js");
    
    let query: any = {};
    if (classGrade) query.classGrade = classGrade;
    if (classStream) query.classStream = classStream;

    const archives = await ArchiveModel.find(query).sort({ createdAt: -1 });
    res.json(archives);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
