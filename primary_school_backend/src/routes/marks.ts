import { Router } from "express";
import type { Response, Request } from "express";
import { ClassSubjectSettingModel, MarkModel } from "../models/school.model.js";
import { userModel, rolesMapped, studentModel } from "../models/user.model.js";
import { authenticate } from "../middleware/auth.js";
import { buildClassSubjectSettingMap, filterStudentsForSubject } from "../utils/subjectEnrollment.js";

const router = Router();

router.use(authenticate);

// GET marks for a specific subject and class
router.get("/", async (req: Request, res: Response) => {
  try {
    const { subjectId, classGrade, classStream, term, year, examType } = req.query;
    
    if (!subjectId || !classGrade || classStream === undefined || classStream === null) {
      return res.status(400).json({ message: "Missing required query parameters" });
    }

    const normalizedClassGrade = String(classGrade).trim();
    const normalizedClassStream =
      classStream === "null" || !classStream ? "" : String(classStream).trim();
    const normalizedSubjectId = String(subjectId).trim();
    const query: any = {
      subjectId: normalizedSubjectId,
      classGrade: normalizedClassGrade,
      classStream: normalizedClassStream,
    };
    if (term) query.term = Number(term);
    if (year) query.year = Number(year);
    if (examType) query.examType = examType;

    const [marks, students, classSubjectSettings] = await Promise.all([
      MarkModel.find(query).lean(),
      studentModel.find({ 
        class: normalizedClassGrade,
        classStream: normalizedClassStream || { $in: ["", null] }
      }).lean(),
      ClassSubjectSettingModel.find({
        classGrade: normalizedClassGrade,
        classStream: normalizedClassStream,
      }).lean(),
    ]);
    const classSubjectSettingsMap = buildClassSubjectSettingMap(classSubjectSettings as any[]);
    const enrolledStudents = filterStudentsForSubject(
      students as any[],
      {
        subjectId: normalizedSubjectId,
        classGrade: normalizedClassGrade,
        classStream: normalizedClassStream,
      },
      classSubjectSettingsMap,
    );
    const markByStudentId = new Map(
      marks.map((mark: any) => [mark.studentId.toString(), mark]),
    );

    const studentMarks = enrolledStudents.map((s: any) => {
      const studentMark = markByStudentId.get(s._id.toString());
      return {
        studentId: s._id,
        name: s.studentsName,
        admissionNo: s.ADM,
        marks: studentMark ? {
          cat1: studentMark.cat1,
          cat2: studentMark.cat2,
          cat3: studentMark.cat3,
          cat4: studentMark.cat4,
          cat5: studentMark.cat5,
          cat1Max: studentMark.cat1Max,
          cat2Max: studentMark.cat2Max,
          cat3Max: studentMark.cat3Max,
          cat4Max: studentMark.cat4Max,
          cat5Max: studentMark.cat5Max,
          exam: studentMark.exam,
          examMax: studentMark.examMax,
          finalScore: studentMark.finalScore
        } : { 
          cat1: null, cat2: null, cat3: null, cat4: null, cat5: null, 
          cat1Max: 40, cat2Max: 40, cat3Max: 40, cat4Max: 40, cat5Max: 40,
          exam: null, examMax: 100, finalScore: null 
        }
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
    const { subjectId, classGrade, classStream, term, year, examType, marksData, catConfigs } = req.body;
    
    if (
      !subjectId ||
      !classGrade ||
      classStream === undefined ||
      classStream === null ||
      !term ||
      !year ||
      !examType ||
      !Array.isArray(marksData)
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const normalizedClassGrade = String(classGrade).trim();
    const normalizedClassStream = String(classStream || "").trim();
    const normalizedSubjectId = String(subjectId).trim();
    const [students, classSubjectSettings] = await Promise.all([
      studentModel.find({
        class: normalizedClassGrade,
        classStream: normalizedClassStream || { $in: ["", null] },
      } as any)
        .select("_id class classStream enrolledSubjects")
        .lean(),
      ClassSubjectSettingModel.find({
        classGrade: normalizedClassGrade,
        classStream: normalizedClassStream,
      }).lean(),
    ]);
    const classSubjectSettingsMap = buildClassSubjectSettingMap(classSubjectSettings as any[]);
    const eligibleStudentIds = new Set(
      filterStudentsForSubject(
        students as any[],
        {
          subjectId: normalizedSubjectId,
          classGrade: normalizedClassGrade,
          classStream: normalizedClassStream,
        },
        classSubjectSettingsMap,
      ).map((student: any) => student._id.toString()),
    );

    const operations = marksData
      .filter((item: any) => eligibleStudentIds.has(String(item.studentId)))
      .map((item: any) => ({
      updateOne: {
        filter: { 
          studentId: item.studentId, 
          subjectId: normalizedSubjectId,
          classGrade: normalizedClassGrade, 
          classStream: normalizedClassStream, 
          term: Number(term), 
          year: Number(year),
          examType: examType
        },
        update: { 
          $set: { 
            cat1: item.cat1, 
            cat2: item.cat2, 
            cat3: item.cat3, 
            cat4: item.cat4, 
            cat5: item.cat5, 
            cat1Max: catConfigs?.cat1Max ?? item.cat1Max ?? 40,
            cat2Max: catConfigs?.cat2Max ?? item.cat2Max ?? 40,
            cat3Max: catConfigs?.cat3Max ?? item.cat3Max ?? 40,
            cat4Max: catConfigs?.cat4Max ?? item.cat4Max ?? 40,
            cat5Max: catConfigs?.cat5Max ?? item.cat5Max ?? 40,
            exam: item.exam,
            examMax: catConfigs?.examMax ?? item.examMax ?? 100
          } 
        },
        upsert: true
      }
    }));

    if (operations.length > 0) {
      await MarkModel.bulkWrite(operations);
    }
    res.json({
      message: "Marks saved successfully",
      savedCount: operations.length,
      skippedCount: Math.max(0, marksData.length - operations.length),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST save summary marks (finalScore) from Class Teacher
router.post("/summary-save", async (req: Request, res: Response) => {
  try {
    const { classGrade, classStream, term, year, examType, marksData } = req.body;
    
    if (
      !classGrade ||
      classStream === undefined ||
      classStream === null ||
      !term ||
      !year ||
      !examType ||
      !Array.isArray(marksData)
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const normalizedClassGrade = String(classGrade).trim();
    const normalizedClassStream = String(classStream || "").trim();
    const [students, classSubjectSettings] = await Promise.all([
      studentModel.find({
        class: normalizedClassGrade,
        classStream: normalizedClassStream || { $in: ["", null] },
      } as any)
        .select("_id class classStream enrolledSubjects")
        .lean(),
      ClassSubjectSettingModel.find({
        classGrade: normalizedClassGrade,
        classStream: normalizedClassStream,
      }).lean(),
    ]);
    const classSubjectSettingsMap = buildClassSubjectSettingMap(classSubjectSettings as any[]);

    const operations = marksData
      .filter((item: any) => {
        const student = (students as any[]).find((candidate) => candidate._id.toString() === String(item.studentId));
        if (!student) {
          return false;
        }

        return filterStudentsForSubject(
          [student],
          {
            subjectId: String(item.subjectId),
            classGrade: normalizedClassGrade,
            classStream: normalizedClassStream,
          },
          classSubjectSettingsMap,
        ).length > 0;
      })
      .map((item: any) => ({
      updateOne: {
        filter: { 
          studentId: item.studentId, 
          subjectId: item.subjectId, 
          classGrade: normalizedClassGrade, 
          classStream: normalizedClassStream, 
          term: Number(term), 
          year: Number(year),
          examType: examType
        },
        update: { 
          $set: { 
            finalScore: item.finalScore
          } 
        },
        upsert: true
      }
    }));


    if (operations.length > 0) {
      await MarkModel.bulkWrite(operations);
    }
    res.json({
      message: "Summary marks saved successfully",
      savedCount: operations.length,
      skippedCount: Math.max(0, marksData.length - operations.length),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
