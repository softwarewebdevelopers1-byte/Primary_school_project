import { Router } from "express";
import type { Response, Request } from "express";
import { ArchiveModel, AssignmentModel, SubjectModel, TimetableModel } from "../models/school.model.js";
import { rolesMapped, studentModel, userModel } from "../models/user.model.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { buildArchiveSearchQuery, deleteStoredArchiveById } from "../utils/archiver.js";
import { deleteStoredTimetableById, generateAndStoreSchoolTimetables } from "../utils/timetable.js";

const router = Router();

const mapTimetableRecord = (record: any, teacherId?: string) => {
  const myLessons = teacherId
    ? record.days.flatMap((day: any) =>
        day.entries
          .filter((entry: any) => entry.teacherId === teacherId)
          .map((entry: any) => ({
            day: day.day,
            ...entry,
          })),
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
    const updatedSubject = await SubjectModel.findByIdAndUpdate(id, { name, department }, { returnDocument: 'after' });
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

    // Filter out assignments that have no students (outdated/orphaned classes)
    const activeAssignments = enrichedAssignments.filter(a => a.studentCount > 0);

    res.json(activeAssignments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/assignments", async (req: Request, res: Response) => {
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
      return res.status(403).json({ message: "Only admins can generate school timetables." });
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
      timetables: result.timetables.map((record: any) => mapTimetableRecord(record)),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/timetables", async (req: Request, res: Response) => {
  try {
    const { classGrade, classStream, teacherId, latestOnly, term, year } = req.query;
    const query: any = {};

    if (classGrade) query.classGrade = String(classGrade);
    if (classStream) query.classStream = String(classStream);
    if (teacherId) query.teacherIds = String(teacherId);
    if (term !== undefined) query.term = Number(term);
    if (year !== undefined) query.year = Number(year);

    let timetables = await TimetableModel.find(query).sort({ createdAt: -1 }).lean();
    if (latestOnly !== "false") {
      timetables = getLatestByClass(timetables);
    }

    res.json(timetables.map((record: any) => mapTimetableRecord(record, teacherId ? String(teacherId) : undefined)));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/timetables/my", async (req: AuthRequest, res: Response) => {
  try {
    const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];
    const view = String(req.query.view || "").trim().toLowerCase();
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
        return res.status(403).json({ message: "You do not have access to a class timetable view." });
      }

      if (!currentUser.class || !currentUser.classStream) {
        return res.status(400).json({ message: "Your profile is not assigned to a class." });
      }

      query.classGrade = currentUser.class;
      query.classStream = currentUser.classStream;
    } else if (view === "teacher" || hasRole(roles, rolesMapped.SJ)) {
      teacherId = req.user?.id;
      query.teacherIds = teacherId;
    } else if (hasRole(roles, rolesMapped.ADM)) {
      // Admins can access current-cycle school timetables through this route without extra filters.
    } else if (hasRole(roles, rolesMapped.CT) && currentUser.class && currentUser.classStream) {
      query.classGrade = currentUser.class;
      query.classStream = currentUser.classStream;
    } else {
      return res.status(403).json({ message: "No timetable view is available for your role." });
    }

    let timetables = await TimetableModel.find(query).sort({ createdAt: -1 }).lean();
    timetables = getLatestByClass(timetables);

    res.json(timetables.map((record: any) => mapTimetableRecord(record, teacherId)));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/timetables/:id", async (req: AuthRequest, res: Response) => {
  try {
    const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];
    if (!hasRole(roles, rolesMapped.ADM)) {
      return res.status(403).json({ message: "Only admins can delete published timetables." });
    }

    const timetableId = typeof req.params.id === "string" ? req.params.id.trim() : "";
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

    if (classGrade) query.classGrade = String(classGrade).trim();
    if (classStream !== undefined && classStream !== null) {
      query.classStream = String(classStream).trim();
    }

    const searchQuery = typeof search === "string" ? buildArchiveSearchQuery(search) : {};
    if (Object.keys(searchQuery).length > 0) {
      Object.assign(query, searchQuery);
    }

    const archives = await ArchiveModel.find(query).sort({ createdAt: -1 }).lean();
    res.json(archives);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/archives/:id", async (req: AuthRequest, res: Response) => {
  try {
    const roles = Array.isArray(req.user?.roles) ? req.user.roles : [];
    if (!hasRole(roles, rolesMapped.ADM)) {
      return res.status(403).json({ message: "Only admins can delete archived reports." });
    }

    const archiveId = typeof req.params.id === "string" ? req.params.id.trim() : "";
    if (!archiveId) {
      return res.status(400).json({ message: "Archive id is required." });
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
