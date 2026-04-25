import { Router } from "express";
import type { Response, Request } from "express";
import { MarkModel } from "../models/school.model.js";
import { userModel, rolesMapped } from "../models/user.model.js";

const router = Router();

// GET marks for a specific subject and class
router.get("/", async (req: Request, res: Response) => {
  try {
    const { subjectId, classGrade, classStream, term, year } = req.query;
    
    if (!subjectId || !classGrade || !classStream) {
      return res.status(400).json({ message: "Missing required query parameters" });
    }

    const query: any = { subjectId, classGrade, classStream };
    if (term) query.term = term;
    if (year) query.year = year;

    const [marks, students] = await Promise.all([
      MarkModel.find(query),
      userModel.find({ 
        __t: rolesMapped.ST, 
        class: classGrade, 
        classStream 
      } as any)
    ]);

    // Merge marks with student list to ensure every student is present
    const studentMarks = students.map((s: any) => {
      const studentMark = marks.find(m => m.studentId.toString() === s._id.toString());
      return {
        studentId: s._id,
        name: s.studentsName,
        admissionNo: s.ADM,
        marks: studentMark ? {
          cat1: studentMark.cat1,
          cat2: studentMark.cat2,
          exam: studentMark.exam
        } : { cat1: null, cat2: null, exam: null }
      };
    });

    res.json(studentMarks);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST/PUT save marks
router.post("/save", async (req: Request, res: Response) => {
  try {
    const { subjectId, classGrade, classStream, term, year, marksData } = req.body;
    
    if (!subjectId || !classGrade || !classStream || !term || !year || !Array.isArray(marksData)) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const operations = marksData.map((item: any) => ({
      updateOne: {
        filter: { 
          studentId: item.studentId, 
          subjectId, 
          classGrade, 
          classStream, 
          term, 
          year 
        },
        update: { 
          $set: { 
            cat1: item.cat1, 
            cat2: item.cat2, 
            exam: item.exam 
          } 
        },
        upsert: true
      }
    }));

    await MarkModel.bulkWrite(operations);
    res.json({ message: "Marks saved successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST save summary marks (finalScore) from Class Teacher
router.post("/summary-save", async (req: Request, res: Response) => {
  try {
    const { classGrade, classStream, term, year, marksData } = req.body;
    
    if (!classGrade || !classStream || !term || !year || !Array.isArray(marksData)) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const operations = marksData.map((item: any) => ({
      updateOne: {
        filter: { 
          studentId: item.studentId, 
          subjectId: item.subjectId, 
          classGrade, 
          classStream, 
          term, 
          year 
        },
        update: { 
          $set: { 
            finalScore: item.finalScore
          } 
        },
        upsert: true
      }
    }));

    await MarkModel.bulkWrite(operations);
    res.json({ message: "Summary marks saved successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
