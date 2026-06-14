import { Router } from "express";
import type { Response, Request } from "express";
import { AssignmentModel, ClassSubjectSettingModel, MarkModel } from "../models/school.model.js";
import { userModel, rolesMapped, studentModel } from "../models/user.model.js";
import { authenticate } from "../middleware/auth.js";
import { buildClassSubjectSettingMap, filterStudentsForSubject } from "../utils/subjectEnrollment.js";
import {
  buildMarkGradingFields,
  computeMarkPercentage,
  getCbcGradingBands,
  toFiniteNumber,
  validateMarkValue,
} from "../utils/grading.js";

const router = Router();

router.use(authenticate);

const MAX_PAGE_SIZE = 100;

const parsePositiveInt = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.floor(parsed);
};

const buildPagination = (query: Request["query"]) => {
  const page = parsePositiveInt(query.page, 1);
  const requestedLimit = parsePositiveInt(query.limit, 50);
  const limit = Math.min(requestedLimit, MAX_PAGE_SIZE);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

// GET averages per assignment for a teacher
router.get("/averages/teacher/:teacherId", async (req: Request, res: Response) => {
  try {
    const { teacherId } = req.params;
    const { term, year, examType } = req.query;

    if (!teacherId) {
      return res.status(400).json({ message: "teacherId is required." });
    }

    const [assignments, classSubjectSettings, students] = await Promise.all([
      AssignmentModel.find({ teacherId } as any).lean(),
      ClassSubjectSettingModel.find().lean(),
      studentModel
        .find({ status: { $ne: "inactive" }, class: { $ne: null }, classStream: { $ne: null } } as any)
        .select("_id class classStream status enrolledSubjects")
        .lean(),
    ]);

    const settingsMap = buildClassSubjectSettingMap(classSubjectSettings as any[]);

    const studentsByClass = new Map<string, any[]>();
    for (const student of students as any[]) {
      const key = `${(student.class || "").trim()}::${(student.classStream || "").trim()}`;
      const list = studentsByClass.get(key) || [];
      list.push(student);
      studentsByClass.set(key, list);
    }

    const markQuery: any = {};
    if (term) markQuery.term = Number(term);
    if (year) markQuery.year = Number(year);
    if (examType) markQuery.examType = examType;

    const averages: Record<string, number> = {};

    for (const assignment of assignments as any[]) {
      const assignmentId = assignment._id.toString();
      const subjectId = assignment.subjectId?.toString();
      const classGrade = (assignment.classGrade || "").trim();
      const classStream = (assignment.classStream || "").trim();

      if (!subjectId || !classGrade) continue;

      const classStudents = studentsByClass.get(`${classGrade}::${classStream}`) || [];
      const enrolled = filterStudentsForSubject(
        classStudents,
        { subjectId, classGrade, classStream },
        settingsMap,
      );

      if (enrolled.length === 0) {
        averages[assignmentId] = 0;
        continue;
      }

      const marks = await MarkModel.find({
        subjectId,
        classGrade,
        classStream,
        studentId: { $in: enrolled.map((s: any) => s._id) },
        ...markQuery,
      } as any).lean();

      const markByStudent = new Map<string, any>();
      for (const m of marks as any[]) {
        markByStudent.set(m.studentId.toString(), m);
      }

      let totalPct = 0;
      let scoredCount = 0;

      for (const student of enrolled) {
        const mark = markByStudent.get(student._id.toString());
        if (!mark) continue;
        const pct = computeMarkPercentage(mark);
        if (pct !== null) {
          totalPct += pct;
          scoredCount += 1;
        }
      }

      averages[assignmentId] = scoredCount > 0 ? Math.round(totalPct / scoredCount) : 0;
    }

    res.json(averages);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET saved cycle/class combinations for historical mark review
router.get("/cycles", async (_req: Request, res: Response) => {
  try {
    const cycles = await MarkModel.aggregate([
      {
        $group: {
          _id: {
            term: "$term",
            year: "$year",
            examType: "$examType",
            classGrade: "$classGrade",
            classStream: "$classStream",
          },
          markCount: { $sum: 1 },
          subjectIds: { $addToSet: { $toString: "$subjectId" } },
        },
      },
      {
        $project: {
          _id: 0,
          term: "$_id.term",
          year: "$_id.year",
          examType: "$_id.examType",
          classGrade: "$_id.classGrade",
          classStream: "$_id.classStream",
          markCount: 1,
          subjectIds: 1,
        },
      },
      {
        $sort: {
          year: -1,
          term: -1,
          examType: 1,
          classGrade: 1,
          classStream: 1,
        },
      },
    ]);

    res.json(cycles);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET marks for a specific subject and class
router.get("/", async (req: Request, res: Response) => {
  try {
    const { subjectId, classGrade, classStream, term, year, examType } = req.query;
    const shouldPaginate = req.query.page !== undefined || req.query.limit !== undefined;
    const pagination = buildPagination(req.query);
    
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
        status: { $ne: "inactive" },
        class: normalizedClassGrade,
        classStream: normalizedClassStream || { $in: ["", null] }
      }).lean(),
      ClassSubjectSettingModel.find({
        classGrade: normalizedClassGrade,
        classStream: normalizedClassStream,
      }).lean(),
    ]);
    const classSubjectSettingsMap = buildClassSubjectSettingMap(classSubjectSettings as any[]);
    const enrolledStudentsForCurrentClass = filterStudentsForSubject(
      students as any[],
      {
        subjectId: normalizedSubjectId,
        classGrade: normalizedClassGrade,
        classStream: normalizedClassStream,
      },
      classSubjectSettingsMap,
    );
    const enrolledStudentMap = new Map(
      enrolledStudentsForCurrentClass.map((student: any) => [
        student._id.toString(),
        student,
      ]),
    );
    const markByStudentId = new Map(
      marks.map((mark: any) => [mark.studentId.toString(), mark]),
    );
    const enrolledStudents = Array.from(enrolledStudentMap.values()).sort(
      (left: any, right: any) =>
        String(left.studentsName || "").localeCompare(
          String(right.studentsName || ""),
        ),
    );

    const total = enrolledStudents.length;
    const pagedStudents = shouldPaginate
      ? enrolledStudents.slice(pagination.skip, pagination.skip + pagination.limit)
      : enrolledStudents;

    const studentMarks = pagedStudents.map((s: any) => {
      const studentMark = markByStudentId.get(s._id.toString());
      return {
        studentId: s._id,
        name: s.studentsName,
        admissionNo: s.ADM,
        gender: s.gender,
        enrolledSubjects: s.enrolledSubjects || [],
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
          finalScore: studentMark.finalScore,
          cbcBand: studentMark.cbcBand || null,
          points: studentMark.points ?? null
        } : { 
          cat1: null, cat2: null, cat3: null, cat4: null, cat5: null, 
          cat1Max: 40, cat2Max: 40, cat3Max: 40, cat4Max: 40, cat5Max: 40,
          exam: null, examMax: 100, finalScore: null, cbcBand: null, points: null
        }
      };
    });

    if (shouldPaginate) {
      return res.json({
        data: studentMarks,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / pagination.limit)),
        },
      });
    }

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
        status: { $ne: "inactive" },
        class: normalizedClassGrade,
        classStream: normalizedClassStream || { $in: ["", null] },
      } as any)
        .select("_id class classStream status enrolledSubjects")
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

    const gradingBands = await getCbcGradingBands();
    const operations = marksData
      .filter((item: any) => eligibleStudentIds.has(String(item.studentId)))
      .map((item: any) => {
        const markPayload = {
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
          examMax: catConfigs?.examMax ?? item.examMax ?? 100,
          finalScore: item.finalScore ?? null,
        };
        validateMarkValue(markPayload.finalScore, "Final marks");
        const percentage = computeMarkPercentage(markPayload);
        const gradingFields = buildMarkGradingFields(percentage, gradingBands);

        return {
          updateOne: {
            filter: {
              studentId: item.studentId,
              subjectId: normalizedSubjectId,
              classGrade: normalizedClassGrade,
              classStream: normalizedClassStream,
              term: Number(term),
              year: Number(year),
              examType: examType,
            },
            update: {
              $set: {
                ...markPayload,
                ...gradingFields,
              },
            },
            upsert: true,
          },
        };
      });

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
        status: { $ne: "inactive" },
        class: normalizedClassGrade,
        classStream: normalizedClassStream || { $in: ["", null] },
      } as any)
        .select("_id class classStream status enrolledSubjects")
        .lean(),
      ClassSubjectSettingModel.find({
        classGrade: normalizedClassGrade,
        classStream: normalizedClassStream,
      }).lean(),
    ]);
    const classSubjectSettingsMap = buildClassSubjectSettingMap(classSubjectSettings as any[]);

    const gradingBands = await getCbcGradingBands();
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
      .map((item: any) => {
        validateMarkValue(item.finalScore, "Final marks");
        const percentage = computeMarkPercentage({ finalScore: item.finalScore });
        const gradingFields = buildMarkGradingFields(percentage, gradingBands);

        return {
          updateOne: {
            filter: {
              studentId: item.studentId,
              subjectId: item.subjectId,
              classGrade: normalizedClassGrade,
              classStream: normalizedClassStream,
              term: Number(term),
              year: Number(year),
              examType: examType,
            },
            update: {
              $set: {
                finalScore: item.finalScore,
                ...gradingFields,
              },
            },
            upsert: true,
          },
        };
      });


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
