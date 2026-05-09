import { Router } from "express";
import type { Response, Request } from "express";
import {
  ArchiveModel,
  AssignmentModel,
  ClassSubjectSettingModel,
  MarkModel,
  SubjectModel,
  TimetableModel,
} from "../models/school.model.js";
import { rolesMapped, studentModel, userModel } from "../models/user.model.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import {
  buildArchiveSearchQuery,
  deleteStoredArchiveById,
} from "../utils/archiver.js";
import {
  deleteStoredTimetableById,
  generateAndStoreSchoolTimetables,
} from "../utils/timetable.js";
import {
  buildClassKey,
  buildClassSubjectSettingMap,
  filterStudentsForSubject,
  getClassSubjectEnrollmentSetting,
  normalizeSharedSlotId,
  normalizeSubjectEnrollmentMode,
} from "../utils/subjectEnrollment.js";
import { computeMarkPercentage } from "../utils/grading.js";

const router = Router();

const mapTimetableRecord = (record: any, teacherId?: string) => {
  const myLessons = teacherId
    ? record.days.flatMap((day: any) =>
        day.entries.flatMap((entry: any) => {
          if (entry.teacherId === teacherId) {
            return [
              {
                day: day.day,
                ...entry,
              },
            ];
          }

          const matchingParallelLessons = Array.isArray(entry.parallelLessons)
            ? entry.parallelLessons.filter(
                (lesson: any) => lesson.teacherId === teacherId,
              )
            : [];

          return matchingParallelLessons.map((lesson: any) => ({
            day: day.day,
            ...entry,
            subjectId: lesson.subjectId,
            subjectName: lesson.subjectName,
            teacherId: lesson.teacherId,
            teacherName: lesson.teacherName,
            enrollmentMode:
              lesson.enrollmentMode || entry.enrollmentMode || null,
            sharedSlotId: lesson.sharedSlotId || entry.sharedSlotId || null,
          }));
        }),
      )
    : [];

  return {
    id: record._id.toString(),
    batchId: record.batchId,
    classGrade: record.classGrade,
    classStream: record.classStream,
    classTeacherId: record.classTeacherId,
    classTeacherName: record.classTeacherName,
    term: record.term,
    year: record.year,
    schoolStartTime: record.schoolStartTime,
    subjectsPerDay: record.subjectsPerDay,
    subjectDurationMinutes: record.subjectDurationMinutes,
    breaks: record.breaks || [],
    days: record.days || [],
    teacherIds: record.teacherIds || [],
    pdfUrl: record.pdfUrl,
    storagePath: record.storagePath,
    generationMode: record.generationMode,
    aiSummary: record.aiSummary,
    myLessons,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
};

const getLatestByClass = (records: any[]) => {
  const seen = new Set<string>();
  return records.filter((record) => {
    const classKey = `${record.classGrade}::${record.classStream}`;
    if (seen.has(classKey)) return false;
    seen.add(classKey);
    return true;
  });
};

const hasRole = (roles: string[], role: string) => roles.includes(role);

const DATABASE_ARCHIVE_PREFIX = "marks:";

const parseDatabaseArchiveId = (archiveId: string) => {
  if (!archiveId.startsWith(DATABASE_ARCHIVE_PREFIX)) return null;

  const parts = archiveId.slice(DATABASE_ARCHIVE_PREFIX.length).split(":");
  if (parts.length < 5) return null;

  const [yearValue, termValue, examType, classGrade, ...classStreamParts] =
    parts;
  const year = Number(yearValue);
  const term = Number(termValue);
  const classStream = classStreamParts.join(":");

  if (!Number.isInteger(year) || !Number.isInteger(term) || !examType || !classGrade) {
    return null;
  }

  return { year, term, examType, classGrade, classStream };
};

const buildDatabaseArchiveId = (archive: {
  year: number;
  term: number;
  examType: string;
  classGrade: string;
  classStream: string;
}) =>
  `${DATABASE_ARCHIVE_PREFIX}${archive.year}:${archive.term}:${archive.examType}:${archive.classGrade}:${archive.classStream}`;
const normalizeClassValue = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const mapAssignmentWithEnrollment = (
  assignment: any,
  settingsMap: Map<string, any>,
  studentCount?: number,
) => {
  const subjectId =
    assignment?.subjectId?._id?.toString?.() ||
    assignment?.subjectId?.toString?.() ||
    String(assignment?.subjectId || "");
  const setting = getClassSubjectEnrollmentSetting(settingsMap, {
    subjectId,
    classGrade: assignment?.classGrade,
    classStream: assignment?.classStream,
  });

  return {
    ...assignment,
    enrollmentMode: setting.enrollmentMode,
    sharedSlotId: setting.sharedSlotId,
    ...(typeof studentCount === "number" ? { studentCount } : {}),
  };
};

const canManageClassSubjects = async (
  req: AuthRequest,
  classGrade: string,
  classStream: string,
) => {
  const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];

  if (hasRole(roles, rolesMapped.ADM)) {
    return true;
  }

  if (!hasRole(roles, rolesMapped.CT) || !req.user?.id) {
    return false;
  }

  const currentUser: any = await userModel
    .findById(req.user.id)
    .select("class classStream")
    .lean();
  return (
    normalizeClassValue(currentUser?.class) === classGrade &&
    normalizeClassValue(currentUser?.classStream) === classStream
  );
};

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
    const updatedSubject = await SubjectModel.findByIdAndUpdate(
      id,
      { name, department },
      { returnDocument: "after" },
    );
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
    await ClassSubjectSettingModel.deleteMany({ subjectId: id } as any);
    res.json({ message: "Subject deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/class-subjects", async (req: AuthRequest, res: Response) => {
  try {
    const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];
    const classGrade = normalizeClassValue(req.query.classGrade);
    const classStream = normalizeClassValue(req.query.classStream);

    if (classGrade) {
      const isAllowed = await canManageClassSubjects(
        req,
        classGrade,
        classStream,
      );
      if (!isAllowed) {
        return res
          .status(403)
          .json({
            message:
              "You do not have access to manage subjects for this class.",
          });
      }

      const [subjects, settings] = await Promise.all([
        SubjectModel.find().sort({ name: 1 }).lean(),
        ClassSubjectSettingModel.find({ classGrade, classStream }).lean(),
      ]);

      const settingsMap = buildClassSubjectSettingMap(settings as any[]);

      return res.json(
        subjects.map((subject: any) => ({
          id: subject._id.toString(),
          name: subject.name,
          department: subject.department,
          ...getClassSubjectEnrollmentSetting(settingsMap, {
            subjectId: subject._id.toString(),
            classGrade,
            classStream,
          }),
        })),
      );
    }

    if (!hasRole(roles, rolesMapped.ADM)) {
      return res
        .status(403)
        .json({
          message: "Only admins can view school-wide class subject settings.",
        });
    }

    const settings = await ClassSubjectSettingModel.find().lean();
    res.json(
      settings.map((setting: any) => ({
        id: setting._id.toString(),
        subjectId: setting.subjectId.toString(),
        classGrade: setting.classGrade,
        classStream: setting.classStream || "",
        isOffered: Boolean(setting.isOffered),
        enrollmentMode: normalizeSubjectEnrollmentMode(setting.enrollmentMode),
        sharedSlotId: normalizeSharedSlotId(setting.sharedSlotId),
      })),
    );
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/class-subjects", async (req: AuthRequest, res: Response) => {
  try {
    const subjectId =
      typeof req.body.subjectId === "string" ? req.body.subjectId.trim() : "";
    const classGrade = normalizeClassValue(req.body.classGrade);
    const classStream = normalizeClassValue(req.body.classStream);
    const isOffered = req.body.isOffered;
    const enrollmentMode = normalizeSubjectEnrollmentMode(
      req.body.enrollmentMode,
    );
    const sharedSlotId = normalizeSharedSlotId(req.body.sharedSlotId);
    if (!subjectId || !classGrade || typeof isOffered !== "boolean") {
      console.log("issue one ---> ", subjectId, classGrade, isOffered);
      return res
        .status(400)
        .json({
          message:
            "subjectId, classGrade, classStream and isOffered are required.",
        });
    }

    if (sharedSlotId && enrollmentMode !== "elective") {
      console.log("issue two ---> ", sharedSlotId, enrollmentMode);
      return res
        .status(400)
        .json({
          message: "sharedSlotId can only be used for elective subjects.",
        });
    }

    const isAllowed = await canManageClassSubjects(
      req,
      classGrade,
      classStream,
    );
    if (!isAllowed) {
      return res
        .status(403)
        .json({
          message: "You do not have access to update subjects for this class.",
        });
    }

    const subjectExists = await SubjectModel.exists({ _id: subjectId } as any);
    if (!subjectExists) {
      return res.status(404).json({ message: "Subject not found." });
    }

    const updatedSetting = await ClassSubjectSettingModel.findOneAndUpdate(
      { subjectId, classGrade, classStream },
      {
        $set: {
          isOffered,
          enrollmentMode,
          sharedSlotId,
          updatedBy: req.user?.id || null,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true,
      },
    );

    if (!isOffered) {
      await AssignmentModel.deleteMany({
        subjectId,
        classGrade,
        classStream,
      } as any);
    }

    res.json({
      message: isOffered
        ? "Subject settings updated. Marks entry and timetable generation will now use the selected enrollment mode."
        : "Subject dropped for this class. Any teacher assignment for it has been cleared.",
      setting: updatedSetting,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Assignments
router.get("/assignments", async (req: Request, res: Response) => {
  try {
    const [assignments, settings] = await Promise.all([
      AssignmentModel.find().populate("subjectId").populate("teacherId"),
      ClassSubjectSettingModel.find().lean(),
    ]);
    const settingsMap = buildClassSubjectSettingMap(settings as any[]);

    res.json(
      assignments.map((assignment: any) =>
        mapAssignmentWithEnrollment(assignment.toObject(), settingsMap),
      ),
    );
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/assignments/teacher/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [assignments, settings, students] = await Promise.all([
      AssignmentModel.find({ teacherId: id } as any).populate("subjectId"),
      ClassSubjectSettingModel.find().lean(),
      studentModel
        .find({ status: { $ne: "inactive" }, class: { $ne: null }, classStream: { $ne: null } } as any)
        .select("_id class classStream status enrolledSubjects")
        .lean(),
    ]);
    const settingsMap = buildClassSubjectSettingMap(settings as any[]);

    // Filter out assignments where the subject no longer exists in the system
    const validAssignments = assignments.filter(
      (a: any) => a.subjectId != null,
    );

    const studentsByClass = new Map<string, any[]>();
    for (const student of students as any[]) {
      const classKey = buildClassKey(student.class, student.classStream);
      const classStudents = studentsByClass.get(classKey) || [];
      classStudents.push(student);
      studentsByClass.set(classKey, classStudents);
    }

    // Add student count to each valid assignment
    const enrichedAssignments = await Promise.all(
      validAssignments.map(async (a: any) => {
        const classStudents =
          studentsByClass.get(buildClassKey(a.classGrade, a.classStream)) || [];
        const subjectId =
          a?.subjectId?._id?.toString?.() || a?.subjectId?.toString?.() || "";
        const studentCount = filterStudentsForSubject(
          classStudents,
          { subjectId, classGrade: a.classGrade, classStream: a.classStream },
          settingsMap,
        ).length;

        return mapAssignmentWithEnrollment(
          a.toObject(),
          settingsMap,
          studentCount,
        );
      }),
    );

    // Filter out assignments that have no students (outdated/orphaned classes)
    const activeAssignments = enrichedAssignments.filter(
      (a) => a.studentCount > 0,
    );

    res.json(activeAssignments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/assignments", async (req: Request, res: Response) => {
  try {
    const { subjectId, teacherId, classGrade, classStream } = req.body;
    if (
      !subjectId ||
      !teacherId ||
      !classGrade ||
      classStream === undefined ||
      classStream === null
    ) {
      return res
        .status(400)
        .json({
          message:
            "subjectId, teacherId, classGrade and classStream are required.",
        });
    }

    const droppedSetting = await ClassSubjectSettingModel.findOne({
      subjectId,
      classGrade: String(classGrade).trim(),
      classStream: String(classStream).trim(),
      isOffered: false,
    } as any).lean();

    if (droppedSetting) {
      return res.status(400).json({
        message:
          "This subject is currently dropped for the selected class. Add it back before assigning a teacher.",
      });
    }

    const assignment = await AssignmentModel.findOneAndUpdate(
      { subjectId, classGrade, classStream },
      { teacherId },
      { returnDocument: "after", upsert: true },
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

// Timetables
router.post("/timetables/generate", async (req: AuthRequest, res: Response) => {
  try {
    const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];
    if (!hasRole(roles, rolesMapped.ADM)) {
      return res
        .status(403)
        .json({ message: "Only admins can generate school timetables." });
    }

    const result = await generateAndStoreSchoolTimetables({
      schoolStartTime: req.body.schoolStartTime,
      subjectsPerDay: req.body.subjectsPerDay,
      subjectDurationMinutes: req.body.subjectDurationMinutes,
      breaks: req.body.breaks,
      generatedByUserId: req.user?.id,
    });

    const modeLabel =
      result.generationMode === "ai"
        ? "Groq AI"
        : "the balanced fallback scheduler";

    res.status(201).json({
      message: `Created and uploaded ${result.timetables.length} class timetable PDFs using ${modeLabel}.`,
      batchId: result.batchId,
      generationMode: result.generationMode,
      aiSummary: result.aiSummary,
      term: result.term,
      year: result.year,
      timetables: result.timetables.map((record: any) =>
        mapTimetableRecord(record),
      ),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/timetables", async (req: Request, res: Response) => {
  try {
    const { classGrade, classStream, teacherId, latestOnly, term, year } =
      req.query;
    const query: any = {};

    if (classGrade) query.classGrade = String(classGrade);
    if (classStream) query.classStream = String(classStream);
    if (teacherId) query.teacherIds = String(teacherId);
    if (term !== undefined) query.term = Number(term);
    if (year !== undefined) query.year = Number(year);

    let timetables = await TimetableModel.find(query)
      .sort({ createdAt: -1 })
      .lean();
    if (latestOnly !== "false") {
      timetables = getLatestByClass(timetables);
    }

    res.json(
      timetables.map((record: any) =>
        mapTimetableRecord(record, teacherId ? String(teacherId) : undefined),
      ),
    );
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/timetables/my", async (req: AuthRequest, res: Response) => {
  try {
    const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];
    const view = String(req.query.view || "")
      .trim()
      .toLowerCase();
    const currentUser: any = await userModel.findById(req.user?.id).lean();

    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const query: any = {
      term: Number(currentUser.term ?? 1),
      year: Number(currentUser.year ?? new Date().getFullYear()),
    };
    let teacherId: string | undefined;

    if (view === "class") {
      if (!hasRole(roles, rolesMapped.CT)) {
        return res
          .status(403)
          .json({
            message: "You do not have access to a class timetable view.",
          });
      }

      if (!currentUser.class || !currentUser.classStream) {
        return res
          .status(400)
          .json({ message: "Your profile is not assigned to a class." });
      }

      query.classGrade = currentUser.class;
      query.classStream = currentUser.classStream;
    } else if (view === "teacher" || hasRole(roles, rolesMapped.SJ)) {
      teacherId = req.user?.id;
      query.teacherIds = teacherId;
    } else if (hasRole(roles, rolesMapped.ADM)) {
      // Admins can access current-cycle school timetables through this route without extra filters.
    } else if (
      hasRole(roles, rolesMapped.CT) &&
      currentUser.class &&
      currentUser.classStream
    ) {
      query.classGrade = currentUser.class;
      query.classStream = currentUser.classStream;
    } else {
      return res
        .status(403)
        .json({ message: "No timetable view is available for your role." });
    }

    let timetables = await TimetableModel.find(query)
      .sort({ createdAt: -1 })
      .lean();
    timetables = getLatestByClass(timetables);

    res.json(
      timetables.map((record: any) => mapTimetableRecord(record, teacherId)),
    );
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/timetables/:id", async (req: AuthRequest, res: Response) => {
  try {
    const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];
    if (!hasRole(roles, rolesMapped.ADM)) {
      return res
        .status(403)
        .json({ message: "Only admins can delete published timetables." });
    }

    const timetableId =
      typeof req.params.id === "string" ? req.params.id.trim() : "";
    if (!timetableId) {
      return res.status(400).json({ message: "Timetable id is required." });
    }

    const result = await deleteStoredTimetableById(timetableId);

    res.json({
      message: `Deleted timetable for ${result.classLabel} from Supabase and removed its database record.`,
    });
  } catch (error: any) {
    const statusCode = error?.message === "Timetable not found." ? 404 : 500;
    res.status(statusCode).json({ message: error.message });
  }
});

// Archives
router.get("/archives", async (req: Request, res: Response) => {
  try {
    const { classGrade, classStream, search } = req.query;
    const query: any = {};
    const markMatch: any = {};

    if (classGrade) {
      const normalizedClassGrade = String(classGrade).trim();
      query.classGrade = normalizedClassGrade;
      markMatch.classGrade = normalizedClassGrade;
    }
    if (classStream !== undefined && classStream !== null) {
      const normalizedClassStream = String(classStream).trim();
      query.classStream = normalizedClassStream;
      markMatch.classStream = normalizedClassStream;
    }

    const searchQuery =
      typeof search === "string" ? buildArchiveSearchQuery(search) : {};
    if (Object.keys(searchQuery).length > 0) {
      Object.assign(query, searchQuery);
    }

    const archives = await ArchiveModel.find(query)
      .sort({ createdAt: -1 })
      .lean();
    const databaseArchives = await MarkModel.aggregate([
      { $match: markMatch },
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
          updatedAt: { $max: "$updatedAt" },
          createdAt: { $min: "$createdAt" },
        },
      },
      {
        $project: {
          _id: {
            $concat: [
              DATABASE_ARCHIVE_PREFIX,
              { $toString: "$_id.year" },
              ":",
              { $toString: "$_id.term" },
              ":",
              "$_id.examType",
              ":",
              "$_id.classGrade",
              ":",
              "$_id.classStream",
            ],
          },
          classGrade: "$_id.classGrade",
          classStream: "$_id.classStream",
          term: "$_id.term",
          year: "$_id.year",
          examType: "$_id.examType",
          pdfUrl: null,
          storagePath: null,
          source: "database",
          markCount: 1,
          createdAt: { $ifNull: ["$updatedAt", "$createdAt"] },
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

    const uploadedArchives = archives.map((archive: any) => ({
      ...archive,
      source: "pdf",
    }));

    res.json([...uploadedArchives, ...databaseArchives]);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/archives/:id/results", async (req: Request, res: Response) => {
  try {
    const archiveId =
      typeof req.params.id === "string" ? req.params.id.trim() : "";
    const databaseArchive = parseDatabaseArchiveId(archiveId);

    if (!databaseArchive) {
      return res.status(400).json({
        message:
          "Detailed results are available for database-backed mark archives only.",
      });
    }

    const marks = await MarkModel.find(databaseArchive as any).lean();
    if (marks.length === 0) {
      return res.status(404).json({ message: "No results found for this archive." });
    }

    const [students, subjects] = await Promise.all([
      studentModel
        .find({ _id: { $in: marks.map((mark: any) => mark.studentId) } } as any)
        .select("_id studentsName ADM")
        .lean(),
      SubjectModel.find({
        _id: { $in: marks.map((mark: any) => mark.subjectId) },
      } as any)
        .select("_id name")
        .lean(),
    ]);

    const studentMap = new Map(
      (students as any[]).map((student) => [student._id.toString(), student]),
    );
    const subjectMap = new Map(
      (subjects as any[]).map((subject) => [subject._id.toString(), subject.name]),
    );
    const subjectColumns = Array.from(
      new Set((marks as any[]).map((mark) => mark.subjectId.toString())),
    )
      .map((subjectId) => ({
        id: subjectId,
        name: subjectMap.get(subjectId) || `Subject ${subjectId.slice(-6)}`,
      }))
      .sort((left, right) => left.name.localeCompare(right.name));

    const rowsByStudent = new Map<string, any>();
    for (const mark of marks as any[]) {
      const studentId = mark.studentId.toString();
      const subjectId = mark.subjectId.toString();
      const student = studentMap.get(studentId);
      const row =
        rowsByStudent.get(studentId) ||
        {
          studentId,
          name: student?.studentsName || "Unknown Student",
          admissionNo: student?.ADM || "-",
          subjects: {},
          average: null,
        };

      row.subjects[subjectId] = {
        subjectId,
        subjectName: subjectMap.get(subjectId) || `Subject ${subjectId.slice(-6)}`,
        percentage: computeMarkPercentage(mark),
        cbcBand: mark.cbcBand || null,
        points: mark.points ?? null,
        cat1: mark.cat1,
        cat2: mark.cat2,
        cat3: mark.cat3,
        cat4: mark.cat4,
        cat5: mark.cat5,
        exam: mark.exam,
        finalScore: mark.finalScore,
      };
      rowsByStudent.set(studentId, row);
    }

    const rows = Array.from(rowsByStudent.values())
      .map((row) => {
        const scores = Object.values(row.subjects)
          .map((subject: any) => subject.percentage)
          .filter((score): score is number => typeof score === "number");
        return {
          ...row,
          average:
            scores.length > 0
              ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
              : null,
        };
      })
      .sort((left, right) => left.name.localeCompare(right.name));

    res.json({
      archive: {
        _id: buildDatabaseArchiveId(databaseArchive),
        ...databaseArchive,
        source: "database",
        markCount: marks.length,
      },
      subjects: subjectColumns,
      students: rows,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/archives/delete", async (req: AuthRequest, res: Response) => {
  try {
    const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];
    if (!hasRole(roles, rolesMapped.ADM)) {
      return res
        .status(403)
        .json({ message: "Only admins can delete archived results." });
    }

    const ids = Array.isArray(req.body?.ids)
      ? req.body.ids.map((id: unknown) => String(id).trim()).filter(Boolean)
      : [];

    if (ids.length === 0) {
      return res.status(400).json({ message: "Select at least one result to delete." });
    }

    let deletedArchives = 0;
    let deletedMarkRecords = 0;

    for (const archiveId of ids) {
      const databaseArchive = parseDatabaseArchiveId(archiveId);
      if (databaseArchive) {
        const result = await MarkModel.deleteMany(databaseArchive as any);
        deletedMarkRecords += result.deletedCount ?? 0;
        deletedArchives += 1;
      } else {
        await deleteStoredArchiveById(archiveId);
        deletedArchives += 1;
      }
    }

    res.json({
      message: `Deleted ${deletedArchives} archived result${deletedArchives === 1 ? "" : "s"} and ${deletedMarkRecords} database mark record${deletedMarkRecords === 1 ? "" : "s"}.`,
      deletedArchives,
      deletedMarkRecords,
    });
  } catch (error: any) {
    const statusCode = error?.message === "Archive not found." ? 404 : 500;
    res.status(statusCode).json({ message: error.message });
  }
});

router.delete("/archives/:id", async (req: AuthRequest, res: Response) => {
  try {
    const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];
    if (!hasRole(roles, rolesMapped.ADM)) {
      return res
        .status(403)
        .json({ message: "Only admins can delete archived reports." });
    }

    const archiveId =
      typeof req.params.id === "string" ? req.params.id.trim() : "";
    if (!archiveId) {
      return res.status(400).json({ message: "Archive id is required." });
    }

    const databaseArchive = parseDatabaseArchiveId(archiveId);
    if (databaseArchive) {
      const result = await MarkModel.deleteMany(databaseArchive as any);
      return res.json({
        message: `Deleted ${result.deletedCount ?? 0} database mark record${(result.deletedCount ?? 0) === 1 ? "" : "s"} for the selected archived result.`,
      });
    }

    const result = await deleteStoredArchiveById(archiveId);

    res.json({
      message: `Deleted archive for ${result.classLabel} from Supabase and removed its database record.`,
    });
  } catch (error: any) {
    const statusCode = error?.message === "Archive not found." ? 404 : 500;
    res.status(statusCode).json({ message: error.message });
  }
});

export default router;
