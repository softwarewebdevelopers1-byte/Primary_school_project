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
import {
  SubjectModel,
  AssignmentModel,
  ClassSubjectSettingModel,
  MarkModel,
} from "../models/school.model.js";
import {
  buildClassSubjectSettingMap,
  collectElectiveEnrollmentGroups,
  filterStudentsForSubject,
  getClassSubjectEnrollmentSetting,
  normalizeSubjectId,
} from "../utils/subjectEnrollment.js";
import jwt from "jsonwebtoken";
import { authenticate } from "../middleware/auth.js";

const SECRET = process.env.JWT_SECRET || "fallback_secret";

const router = Router();
const allowedExamTypes = new Set(["opener", "midterm", "closing"]);

const formatCycleLabel = (term: number, year: number, examType: string) =>
  `Term ${term}, ${year} (${examType})`;

const pluralize = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`;

const normalizeClassValue = (value: string | null | undefined) =>
  typeof value === "string" ? value.trim() : "";

const buildClassKey = (
  classGrade: string | null | undefined,
  classStream: string | null | undefined,
) => `${normalizeClassValue(classGrade)}::${normalizeClassValue(classStream)}`;

const formatClassLabel = (
  classGrade: string | null | undefined,
  classStream: string | null | undefined,
) =>
  `${normalizeClassValue(classGrade)} ${normalizeClassValue(classStream)}`.trim() ||
  "Unknown class";

const sanitizeEnrolledSubjects = (
  enrolledSubjects: unknown,
  classGrade: string | null | undefined,
  classStream: string | null | undefined,
) => {
  const defaultClassGrade = normalizeClassValue(classGrade);
  const defaultClassStream = normalizeClassValue(classStream);

  if (!Array.isArray(enrolledSubjects)) {
    return [];
  }

  const seen = new Set<string>();

  return enrolledSubjects
    .map((entry: any) => {
      const subjectId = normalizeSubjectId(entry?.subjectId);
      const enrollmentClassGrade =
        normalizeClassValue(entry?.classGrade) || defaultClassGrade;
      const enrollmentClassStream =
        normalizeClassValue(entry?.classStream) || defaultClassStream;

      if (!subjectId || !enrollmentClassGrade) {
        return null;
      }

      return {
        subjectId,
        classGrade: enrollmentClassGrade,
        classStream: enrollmentClassStream,
        isActive: entry?.isActive !== false,
        enrolledAt: entry?.enrolledAt ? new Date(entry.enrolledAt) : null,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => {
      if (!entry) {
        return false;
      }

      const key = `${entry.subjectId}::${entry.classGrade}::${entry.classStream}`;
      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
};

const enrollmentMatchesClass = (
  entry: any,
  classGrade: string,
  classStream: string,
) => {
  const entryClassGrade = normalizeClassValue(entry?.classGrade) || classGrade;
  const entryClassStream =
    normalizeClassValue(entry?.classStream) || classStream;

  return entryClassGrade === classGrade && entryClassStream === classStream;
};

const validateStudentElectiveEnrollments = async (
  enrolledSubjects: Array<{
    subjectId: string;
    classGrade: string;
    classStream: string;
    isActive: boolean;
    enrolledAt?: Date | string | null;
  }>,
  classGrade: string,
  classStream: string,
  options: { requireCompleteLinkedGroups?: boolean } = {},
) => {
  const requireCompleteLinkedGroups =
    options.requireCompleteLinkedGroups !== false;

  if (!classGrade) {
    if (enrolledSubjects.length > 0) {
      throw new Error(
        "Students must be assigned to a class before elective subjects can be selected.",
      );
    }
    return;
  }

  const classSubjectSettings = await ClassSubjectSettingModel.find({
    classGrade,
    classStream,
  }).lean();
  const classSubjectSettingsMap = buildClassSubjectSettingMap(
    classSubjectSettings as any[],
  );
  const activeElectiveSelections = enrolledSubjects.filter(
    (entry) =>
      entry.isActive !== false &&
      enrollmentMatchesClass(entry, classGrade, classStream),
  );

  for (const enrollment of activeElectiveSelections) {
    const setting = getClassSubjectEnrollmentSetting(classSubjectSettingsMap, {
      subjectId: enrollment.subjectId,
      classGrade,
      classStream,
    });

    if (!setting.isOffered || setting.enrollmentMode !== "elective") {
      throw new Error(
        "Only active elective subjects can be saved as per-student selections.",
      );
    }
  }

  const linkedElectiveGroups = collectElectiveEnrollmentGroups(
    classSubjectSettingsMap,
    classGrade,
    classStream,
  );

  for (const group of linkedElectiveGroups) {
    const selectedCount = activeElectiveSelections.filter((entry) =>
      group.subjectIds.includes(entry.subjectId),
    ).length;

    if (requireCompleteLinkedGroups ? selectedCount !== 1 : selectedCount > 1) {
      throw new Error(
        requireCompleteLinkedGroups
          ? `Each linked elective block requires exactly one subject choice. Block ${group.sharedSlotId} currently has ${selectedCount} selection(s).`
          : `Each linked elective block allows only one subject choice. Block ${group.sharedSlotId} currently has ${selectedCount} selection(s).`,
      );
    }
  }
};

const hasRole = (roles: unknown, role: string) =>
  Array.isArray(roles) && roles.includes(role);

const canManageClassElectiveEnrollments = async (
  req: Request,
  classGrade: string,
  classStream: string,
) => {
  const authUser = (req as any).user;
  const roles = authUser?.roles;

  if (hasRole(roles, rolesMapped.ADM)) {
    return true;
  }

  if (!hasRole(roles, rolesMapped.CT) || !authUser?.id) {
    return false;
  }

  const currentUser: any = await userModel
    .findById(authUser.id)
    .select("class classStream")
    .lean();

  return (
    normalizeClassValue(currentUser?.class) === classGrade &&
    normalizeClassValue(currentUser?.classStream) === classStream
  );
};

const toFiniteNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue =
    typeof value === "number"
      ? value
      : Number(typeof value === "string" ? value.trim() : value);

  return Number.isFinite(numericValue) ? numericValue : null;
};

const hasRecordedScore = (mark: any) =>
  [
    mark?.cat1,
    mark?.cat2,
    mark?.cat3,
    mark?.cat4,
    mark?.cat5,
    mark?.exam,
    mark?.finalScore,
  ].some((value) => toFiniteNumber(value) !== null);

type CycleCompletionIssue = {
  type: "missing-marks";
  classGrade: string;
  classStream: string;
  subjectName: string;
  missingStudents: number;
  totalStudents: number;
};

const buildCycleCompletionMessage = (
  issues: CycleCompletionIssue[],
  currentCycleLabel: string,
) => {
  const issueSummaries = issues.slice(0, 8).map((issue) => {
    return `${formatClassLabel(issue.classGrade, issue.classStream)} - ${issue.subjectName}: ${pluralize(issue.missingStudents, "student")} missing marks out of ${issue.totalStudents}.`;
  });

  const remainingCount = Math.max(issues.length - issueSummaries.length, 0);
  const suffix =
    remainingCount > 0
      ? ` ${pluralize(remainingCount, "additional class-subject issue")} still need attention.`
      : "";

  return (
    `Cannot update the academic cycle yet. Marks for ${currentCycleLabel} are still incomplete. ` +
    `${issueSummaries.join(" ")}${suffix} Complete all assigned class subject marks before changing term, exam, or year.`
  );
};

const collectCycleCompletionIssues = async (
  term: number,
  year: number,
  examType: string,
) => {
  const activeStudents = await studentModel
    .find({
      status: { $ne: "inactive" },
      class: { $ne: null },
    } as any)
    .select("_id class classStream enrolledSubjects")
    .lean();

  if (activeStudents.length === 0) {
    return [];
  }

  const studentsByClass = new Map<string, any[]>();
  for (const student of activeStudents as any[]) {
    const classGrade = normalizeClassValue(student.class);
    if (!classGrade) continue;

    const classStream = normalizeClassValue(student.classStream);
    const classKey = buildClassKey(classGrade, classStream);
    const classStudents = studentsByClass.get(classKey) || [];
    classStudents.push(student);
    studentsByClass.set(classKey, classStudents);
  }

  if (studentsByClass.size === 0) {
    return [];
  }

  const [assignments, classSubjectSettings] = await Promise.all([
    AssignmentModel.find().lean(),
    ClassSubjectSettingModel.find().lean(),
  ]);

  const relevantAssignments = assignments.filter((assignment: any) =>
    studentsByClass.has(
      buildClassKey(assignment.classGrade, assignment.classStream),
    ),
  );
  const classSubjectSettingsMap = buildClassSubjectSettingMap(
    classSubjectSettings as any[],
  );

  const subjectIds = Array.from(
    new Set(
      relevantAssignments
        .map((assignment: any) => assignment.subjectId?.toString())
        .filter(Boolean),
    ),
  );
  const subjects = await SubjectModel.find({
    _id: { $in: subjectIds },
  } as any).lean();
  const subjectNameById = new Map(
    subjects.map((subject: any) => [subject._id.toString(), subject.name]),
  );

  const assignmentsByClass = new Map<string, any[]>();
  for (const assignment of relevantAssignments as any[]) {
    const classKey = buildClassKey(
      assignment.classGrade,
      assignment.classStream,
    );
    const classAssignments = assignmentsByClass.get(classKey) || [];
    classAssignments.push(assignment);
    assignmentsByClass.set(classKey, classAssignments);
  }

  const relevantMarks = await MarkModel.find({
    term,
    year,
    examType,
    studentId: { $in: activeStudents.map((student: any) => student._id) },
    subjectId: { $in: subjectIds },
  } as any).lean();

  const marksByStudentAndSubject = new Map<string, any>();
  for (const mark of relevantMarks as any[]) {
    const key = `${mark.studentId.toString()}::${mark.subjectId.toString()}`;
    if (!marksByStudentAndSubject.has(key) || hasRecordedScore(mark)) {
      marksByStudentAndSubject.set(key, mark);
    }
  }

  const issues: CycleCompletionIssue[] = [];
  const sortedClassKeys = Array.from(studentsByClass.keys()).sort(
    (left, right) => left.localeCompare(right),
  );

  for (const classKey of sortedClassKeys) {
    const [rawClassGrade = "", rawClassStream = ""] = classKey.split("::");
    const classGrade = normalizeClassValue(rawClassGrade);
    const classStream = normalizeClassValue(rawClassStream);
    const classStudents = studentsByClass.get(classKey) || [];
    const classAssignments = assignmentsByClass.get(classKey) || [];

    if (classAssignments.length === 0) {
      continue;
    }

    for (const assignment of classAssignments) {
      const subjectId = assignment.subjectId?.toString();
      if (!subjectId) continue;

      const enrolledStudents = filterStudentsForSubject(
        classStudents,
        { subjectId, classGrade, classStream },
        classSubjectSettingsMap,
      );

      if (enrolledStudents.length === 0) {
        continue;
      }

      let missingStudents = 0;
      for (const student of enrolledStudents) {
        const studentId = student._id?.toString?.() || String(student._id);
        const mark = marksByStudentAndSubject.get(`${studentId}::${subjectId}`);
        if (!mark || !hasRecordedScore(mark)) {
          missingStudents += 1;
        }
      }

      if (missingStudents > 0) {
        issues.push({
          type: "missing-marks",
          classGrade,
          classStream,
          subjectName: subjectNameById.get(subjectId) || "Assigned subject",
          missingStudents,
          totalStudents: enrolledStudents.length,
        });
      }
    }
  }

  return issues;
};

const shiftClassName = (
  className: string | null | undefined,
  offset: number,
) => {
  if (!className || offset === 0) return className ?? null;

  const match = className.match(/\d+/);
  if (!match) return className;

  const currentLevel = Number.parseInt(match[0], 10);
  if (Number.isNaN(currentLevel)) return className;

  const nextLevel = currentLevel + offset;
  if (nextLevel <= 0) return className;

  return className.replace(match[0], nextLevel.toString());
};

const extractRoles = async (user: any) => {
  const rolesSet = new Set<string>();
  if (user.__t === rolesMapped.ST) {
    rolesSet.add("student");
  } else {
    // Roles from roles object
    if (user.roles?.role1) rolesSet.add(user.roles.role1);
    if (user.roles?.role2) rolesSet.add(user.roles.role2);
    if (user.roles?.role3) rolesSet.add(user.roles.role3);

    // Discriminator
    if (user.__t) rolesSet.add(user.__t);

    // Legacy subjects check
    if (user.subjects?.subject1 || user.subjects?.subject2) {
      rolesSet.add(rolesMapped.SJ);
    }

    // Check assignments
    try {
      const hasAssignments = await AssignmentModel.exists({
        teacherId: user._id,
      });
      if (hasAssignments) {
        rolesSet.add(rolesMapped.SJ);
      }
    } catch (err) {
      // Ignore if model not ready
    }
  }
  return Array.from(rolesSet);
};

// POST login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user: any = await userModel.findOne({
      $or: [{ email }, { ADM: email }], // Support email or Admission No (for students)
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Extract all roles
    const roles = await extractRoles(user);

    const token = jwt.sign(
      { id: user._id, email: user.email || user.ADM, roles },
      SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.teachersName || user.studentsName,
        email: user.email || user.ADM,
        roles,
        primaryRole: roles[0],
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.teachersName || user.studentsName)}&background=random&color=fff`,
        classGrade: user.class,
        classStream: user.classStream,
        subjects: user.subjects
          ? [user.subjects.subject1, user.subjects.subject2].filter(Boolean)
          : [],
        enrolledSubjects: user.enrolledSubjects || [],
        term: user.term,
        year: user.year,
        examType: user.examType,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET all users (staff and students) + subjects and assignments
router.get("/", authenticate, async (req: Request, res: Response) => {
  try {
    const [allUsers, allSubjects, allAssignments, allMarks] = await Promise.all(
      [
        userModel.find(),
        SubjectModel.find(),
        AssignmentModel.find(),
        MarkModel.find(),
      ],
    );

    const students = allUsers.filter((u: any) => u.__t === rolesMapped.ST);
    const staff = allUsers.filter((u: any) => u.__t !== rolesMapped.ST);

    // Calculate subject stats first to match frontend MarksEntry logic
    const subjectStats: Record<string, { catsCount: number; catConfigs: any }> =
      {};
    allMarks.forEach((m: any) => {
      const subId = m.subjectId.toString();
      if (!subjectStats[subId]) {
        subjectStats[subId] = {
          catsCount: 0,
          catConfigs: {
            cat1Max: m.cat1Max || 40,
            cat2Max: m.cat2Max || 40,
            cat3Max: m.cat3Max || 40,
            cat4Max: m.cat4Max || 40,
            cat5Max: m.cat5Max || 40,
            examMax: m.examMax || 100,
          },
        };
      }
      if (m.cat5 !== null)
        subjectStats[subId].catsCount = Math.max(
          subjectStats[subId].catsCount,
          5,
        );
      else if (m.cat4 !== null)
        subjectStats[subId].catsCount = Math.max(
          subjectStats[subId].catsCount,
          4,
        );
      else if (m.cat3 !== null)
        subjectStats[subId].catsCount = Math.max(
          subjectStats[subId].catsCount,
          3,
        );
      else if (m.cat2 !== null)
        subjectStats[subId].catsCount = Math.max(
          subjectStats[subId].catsCount,
          2,
        );
      else if (m.cat1 !== null)
        subjectStats[subId].catsCount = Math.max(
          subjectStats[subId].catsCount,
          1,
        );
    });

    // Map backend models to frontend expected format if necessary
    const mappedStudents = students.map((s: any) => {
      // Find marks for this student
      const studentMarksList = allMarks.filter(
        (m: any) => m.studentId.toString() === s._id.toString(),
      );
      const marksObj: Record<string, number> = {};
      studentMarksList.forEach((m: any) => {
        if (m.finalScore != null) {
          marksObj[m.subjectId.toString()] = Number(m.finalScore);
        } else {
          const stats = subjectStats[m.subjectId.toString()];
          if (stats) {
            let maxTotal = stats.catConfigs.examMax;
            if (stats.catsCount > 0) maxTotal += stats.catConfigs.cat1Max;
            if (stats.catsCount > 1) maxTotal += stats.catConfigs.cat2Max;
            if (stats.catsCount > 2) maxTotal += stats.catConfigs.cat3Max;
            if (stats.catsCount > 3) maxTotal += stats.catConfigs.cat4Max;
            if (stats.catsCount > 4) maxTotal += stats.catConfigs.cat5Max;

            const total =
              (stats.catsCount > 0 ? m.cat1 || 0 : 0) +
              (stats.catsCount > 1 ? m.cat2 || 0 : 0) +
              (stats.catsCount > 2 ? m.cat3 || 0 : 0) +
              (stats.catsCount > 3 ? m.cat4 || 0 : 0) +
              (stats.catsCount > 4 ? m.cat5 || 0 : 0) +
              (m.exam || 0);

            if (maxTotal > 0) {
              marksObj[m.subjectId.toString()] = Math.round(
                (total / maxTotal) * 100,
              );
            }
          }
        }
      });

      return {
        id: s._id,
        admissionNo: s.ADM,
        name: s.studentsName,
        gender: s.gender,
        guardianName: s.guardianName,
        guardianPhone: s.guardianPhone,
        classGrade: s.class,
        classStream: s.classStream,
        status: s.status,
        enrolledSubjects: s.enrolledSubjects || [],
        marks: marksObj,
        term: s.term,
        year: s.year,
        examType: s.examType,
      };
    });

    const mappedStaffPromises = staff.map(async (t: any) => {
      const staffRoles = await extractRoles(t);
      return {
        id: t._id,
        name: t.teachersName,
        email: t.email,
        phone: t.phone,
        department: t.department,
        roles: staffRoles,
        role: t.__t,
        roleLabel: t.roles
          ? t.__t.charAt(0).toUpperCase() + t.__t.slice(1)
          : "Staff",
        status: t.status,
        classGrade: t.class,
        classStream: t.classStream,
        subjects: t.subjects
          ? [t.subjects.subject1, t.subjects.subject2].filter(Boolean)
          : [],
        teacherNumber: t.teacherNumber,
        joinDate: t.joinDate,
        term: t.term,
        year: t.year,
        examType: t.examType,
      };
    });
    const mappedStaff = await Promise.all(mappedStaffPromises);

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

router.get("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const user: any = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Map roles to array format for frontend consistency
    const roles = await extractRoles(user);

    const mapped = {
      ...user.toObject(),
      id: user._id,
      roles,
      name: user.teachersName || user.studentsName,
      classGrade: user.class,
      classStream: user.classStream,
      enrolledSubjects: user.enrolledSubjects || [],
    };

    res.json(mapped);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get(
  "/class/:grade/:stream",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const { grade, stream } = req.params;
      const { term, year } = req.query;

      const students = await userModel.find({
        __t: rolesMapped.ST,
        class: grade,
        classStream: stream,
      } as any);

      // Fetch all marks for these students in this class for the specific period
      const studentIds = students.map((s) => s._id);
      const allMarks = await MarkModel.find({
        studentId: { $in: studentIds },
        classGrade: grade,
        classStream: stream,
        term: term ? Number(term) : 1,
        year: year ? Number(year) : 2024,
      } as any);

      // Calculate subject stats first to match frontend MarksEntry logic
      const subjectStats: Record<
        string,
        { catsCount: number; catConfigs: any }
      > = {};
      allMarks.forEach((m) => {
        const subId = m.subjectId.toString();
        if (!subjectStats[subId]) {
          subjectStats[subId] = {
            catsCount: 0,
            catConfigs: {
              cat1Max: m.cat1Max || 40,
              cat2Max: m.cat2Max || 40,
              cat3Max: m.cat3Max || 40,
              cat4Max: m.cat4Max || 40,
              cat5Max: m.cat5Max || 40,
              examMax: m.examMax || 100,
            },
          };
        }
        if (m.cat5 !== null)
          subjectStats[subId].catsCount = Math.max(
            subjectStats[subId].catsCount,
            5,
          );
        else if (m.cat4 !== null)
          subjectStats[subId].catsCount = Math.max(
            subjectStats[subId].catsCount,
            4,
          );
        else if (m.cat3 !== null)
          subjectStats[subId].catsCount = Math.max(
            subjectStats[subId].catsCount,
            3,
          );
        else if (m.cat2 !== null)
          subjectStats[subId].catsCount = Math.max(
            subjectStats[subId].catsCount,
            2,
          );
        else if (m.cat1 !== null)
          subjectStats[subId].catsCount = Math.max(
            subjectStats[subId].catsCount,
            1,
          );
      });

      const mapped = students.map((s: any) => {
        // Create a marks object: { subjectId: score }
        // We prioritize finalScore, then cat/exam average
        const studentMarks: Record<string, number> = {};

        allMarks
          .filter((m) => m.studentId.toString() === s._id.toString())
          .forEach((m) => {
            if (m.finalScore !== null) {
              studentMarks[m.subjectId.toString()] = m.finalScore;
            } else {
              // Calculate using max values globally for the subject
              const stats = subjectStats[m.subjectId.toString()];
              if (stats) {
                let maxTotal = stats.catConfigs.examMax;
                if (stats.catsCount > 0) maxTotal += stats.catConfigs.cat1Max;
                if (stats.catsCount > 1) maxTotal += stats.catConfigs.cat2Max;
                if (stats.catsCount > 2) maxTotal += stats.catConfigs.cat3Max;
                if (stats.catsCount > 3) maxTotal += stats.catConfigs.cat4Max;
                if (stats.catsCount > 4) maxTotal += stats.catConfigs.cat5Max;

                const total =
                  (stats.catsCount > 0 ? m.cat1 || 0 : 0) +
                  (stats.catsCount > 1 ? m.cat2 || 0 : 0) +
                  (stats.catsCount > 2 ? m.cat3 || 0 : 0) +
                  (stats.catsCount > 3 ? m.cat4 || 0 : 0) +
                  (stats.catsCount > 4 ? m.cat5 || 0 : 0) +
                  (m.exam || 0);

                if (maxTotal > 0) {
                  studentMarks[m.subjectId.toString()] = Math.round(
                    (total / maxTotal) * 100,
                  );
                }
              }
            }
          });

        return {
          id: s._id,
          name: s.studentsName,
          adm: s.ADM,
          admissionNumber: s.ADM,
          gender: s.gender,
          parentName: s.guardianName,
          parentPhone: s.guardianPhone,
          status: s.status,
          enrolledSubjects: s.enrolledSubjects || [],
          marks: studentMarks,
        };
      });

      res.json(mapped);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

// POST a new user
router.post("/", authenticate, async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    if (role !== rolesMapped.ST) {
      const existing = await userModel.findOne({ email: req.body.email });
      if (existing) {
        return res
          .status(400)
          .json({ message: "Staff with this email already exists." });
      }
    }

    let newUser;

    if (role === rolesMapped.ST) {
      const classGrade = normalizeClassValue(req.body.classGrade);
      const classStream = normalizeClassValue(req.body.classStream);
      const enrolledSubjects = sanitizeEnrolledSubjects(
        req.body.enrolledSubjects,
        classGrade,
        classStream,
      );
      // if student with that email exists then no data is added to the database
      let existing_student = await studentModel.findOne({
        ADM: req.body.admissionNo,
      });
      if (existing_student) {
        res.status(400).json({ message: "Student with this admission exists" });
        return;
      }
      await validateStudentElectiveEnrollments(
        enrolledSubjects,
        classGrade,
        classStream,
        { requireCompleteLinkedGroups: false },
      );
      const hashedPassword = await bcrypt.hash("student123", 10);
      newUser = await studentModel.create({
        studentsName: req.body.name,
        ADM: req.body.admissionNo,
        gender: req.body.gender,
        guardianName: req.body.guardianName,
        guardianPhone: req.body.guardianPhone,
        class: classGrade,
        classStream: classStream,
        status: req.body.status || "active",
        role: rolesMapped.ST,
        password: hashedPassword,
        enrolledSubjects,
      });
    } else {
      const hashedPassword = await bcrypt.hash("staff123", 10);
      const rolesArray = Array.isArray(req.body.roles)
        ? req.body.roles
        : [req.body.role].filter(Boolean);
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

      if (primaryRole === rolesMapped.ADM)
        newUser = await adminModel.create(staffData);
      else if (primaryRole === rolesMapped.CT)
        newUser = await classTeacherModel.create(staffData);
      else if (primaryRole === rolesMapped.SJ)
        newUser = await subjectTeacher.create(staffData);
      else if (primaryRole === rolesMapped.DT)
        newUser = await deputyModel.create(staffData);
      else if (primaryRole === rolesMapped.HT)
        newUser = await headTeacherModel.create(staffData);
      else throw new Error("Invalid role provided");
    }

    res.status(201).json(newUser);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Bulk update term and year for all users
router.put(
  "/bulk-update-term",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const { term, year, examType } = req.body;
      const normalizedExamType =
        typeof examType === "string" ? examType.trim().toLowerCase() : "";

      if (term === undefined || year === undefined || !normalizedExamType) {
        return res
          .status(400)
          .json({ message: "Term, Year and Exam phase are required." });
      }

      const newYear = Number(year);
      const newTerm = Number(term);

      if (!Number.isInteger(newTerm) || newTerm < 1 || newTerm > 3) {
        return res.status(400).json({ message: "Term must be 1, 2 or 3." });
      }

      if (!Number.isInteger(newYear) || newYear < 1) {
        return res
          .status(400)
          .json({ message: "Year must be a valid positive number." });
      }

      if (!allowedExamTypes.has(normalizedExamType)) {
        return res
          .status(400)
          .json({ message: "Exam phase must be opener, midterm or closing." });
      }

      const sampleUser = await userModel.findOne({
        term: { $ne: null },
      } as any);
      const currentTerm = Number(sampleUser?.term ?? 1);
      const currentYear = Number(sampleUser?.year ?? 2024);
      const currentExamType = String(sampleUser?.examType ?? "opener")
        .trim()
        .toLowerCase();
      const currentCycleLabel = formatCycleLabel(
        currentTerm,
        currentYear,
        currentExamType,
      );
      const preservedMarksCount = await MarkModel.countDocuments({
        term: currentTerm,
        year: currentYear,
        examType: currentExamType,
      } as any);

      const cycleCompletionIssues = await collectCycleCompletionIssues(
        currentTerm,
        currentYear,
        currentExamType,
      );

      if (cycleCompletionIssues.length > 0) {
        return res.status(400).json({
          message: buildCycleCompletionMessage(
            cycleCompletionIssues,
            currentCycleLabel,
          ),
          issues: cycleCompletionIssues,
          summary: {
            previousCycle: {
              term: currentTerm,
              year: currentYear,
              examType: currentExamType,
            },
            requestedCycle: {
              term: newTerm,
              year: newYear,
              examType: normalizedExamType,
            },
          },
        });
      }

      const usersToProcess = await userModel.find({
        $or: [
          { __t: rolesMapped.ST },
          { "roles.role1": rolesMapped.CT },
          { "roles.role2": rolesMapped.CT },
          { "roles.role3": rolesMapped.CT },
        ],
        class: { $ne: null },
      } as any);

      const userClassUpdates = usersToProcess.flatMap((userDoc) => {
        const currentClass = userDoc.class;
        const userYear = Number(userDoc.year ?? currentYear);
        const shiftedClass = shiftClassName(currentClass, newYear - userYear);

        if (!currentClass || !shiftedClass || shiftedClass === currentClass) {
          return [];
        }

        return [
          {
            updateOne: {
              filter: { _id: userDoc._id },
              update: {
                $set: {
                  class: shiftedClass,
                  enrolledSubjects:
                    (userDoc as any).__t === rolesMapped.ST &&
                    Array.isArray((userDoc as any).enrolledSubjects)
                      ? (userDoc as any).enrolledSubjects.map(
                          (enrollment: any) => ({
                            ...enrollment,
                            classGrade:
                              shiftClassName(
                                enrollment.classGrade,
                                newYear - userYear,
                              ) || enrollment.classGrade,
                          }),
                        )
                      : (userDoc as any).enrolledSubjects,
                },
              },
            },
          },
        ];
      });

      if (userClassUpdates.length > 0) {
        await userModel.bulkWrite(userClassUpdates);
      }

      const assignmentClassOffset = newYear - currentYear;
      if (assignmentClassOffset !== 0) {
        const assignments = await AssignmentModel.find();
        const assignmentUpdates = assignments.flatMap((assignment) => {
          const shiftedClass = shiftClassName(
            assignment.classGrade,
            assignmentClassOffset,
          );

          if (!shiftedClass || shiftedClass === assignment.classGrade) {
            return [];
          }

          return [
            {
              updateOne: {
                filter: { _id: assignment._id },
                update: { $set: { classGrade: shiftedClass } },
              },
            },
          ];
        });

        if (assignmentUpdates.length > 0) {
          await AssignmentModel.bulkWrite(assignmentUpdates);
        }

        const classSubjectSettings = await ClassSubjectSettingModel.find();
        const classSubjectUpdates = classSubjectSettings.flatMap((setting) => {
          const shiftedClass = shiftClassName(
            setting.classGrade,
            assignmentClassOffset,
          );

          if (!shiftedClass || shiftedClass === setting.classGrade) {
            return [];
          }

          return [
            {
              updateOne: {
                filter: { _id: setting._id },
                update: { $set: { classGrade: shiftedClass } },
              },
            },
          ];
        });

        if (classSubjectUpdates.length > 0) {
          await ClassSubjectSettingModel.bulkWrite(classSubjectUpdates);
        }
      }

      await userModel.updateMany(
        {},
        {
          $set: {
            term: newTerm,
            year: newYear,
            examType: normalizedExamType,
          },
        },
      );

      const message =
        `Academic cycle updated to ${formatCycleLabel(newTerm, newYear, normalizedExamType)}. ` +
        `${pluralize(preservedMarksCount, "mark record")} from ${currentCycleLabel} preserved in the database. New mark entry screens are ready for the selected cycle.`;

      res.json({
        message,
        summary: {
          archivedClasses: 0,
          deletedMarks: 0,
          preservedMarks: preservedMarksCount,
          previousCycle: {
            term: currentTerm,
            year: currentYear,
            examType: currentExamType,
          },
          newCycle: {
            term: newTerm,
            year: newYear,
            examType: normalizedExamType,
          },
          warning: null,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

// PUT bulk enroll students in an elective subject
router.put(
  "/bulk-enroll-elective",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const { studentIds, subjectId, classGrade, classStream, action } =
        req.body;
      const normalizedSubjectId = normalizeSubjectId(subjectId);
      const normalizedClassGrade = normalizeClassValue(classGrade);
      const normalizedClassStream = normalizeClassValue(classStream);
      const normalizedAction =
        action === "enroll" || action === "unenroll" || action === "unassign"
          ? action
          : "";

      if (
        !Array.isArray(studentIds) ||
        studentIds.length === 0 ||
        !normalizedSubjectId ||
        !normalizedClassGrade ||
        !normalizedAction
      ) {
        return res.status(400).json({ message: "Invalid payload." });
      }

      const isAllowed = await canManageClassElectiveEnrollments(
        req,
        normalizedClassGrade,
        normalizedClassStream,
      );
      if (!isAllowed) {
        return res.status(403).json({
          message:
            "Only admins or the assigned class teacher can update elective enrollments for this class.",
        });
      }

      const classSubjectSettings = await ClassSubjectSettingModel.find({
        classGrade: normalizedClassGrade,
        classStream: normalizedClassStream,
      }).lean();
      const classSubjectSettingsMap = buildClassSubjectSettingMap(
        classSubjectSettings as any[],
      );
      const targetSetting = getClassSubjectEnrollmentSetting(
        classSubjectSettingsMap,
        {
          subjectId: normalizedSubjectId,
          classGrade: normalizedClassGrade,
          classStream: normalizedClassStream,
        },
      );

      if (
        !targetSetting.isOffered ||
        targetSetting.enrollmentMode !== "elective"
      ) {
        return res.status(400).json({
          message:
            "Bulk enrollment is only available for active elective subjects.",
        });
      }

      const linkedGroup = collectElectiveEnrollmentGroups(
        classSubjectSettingsMap,
        normalizedClassGrade,
        normalizedClassStream,
      ).find((group) => group.subjectIds.includes(normalizedSubjectId));
      const linkedSubjectIds = linkedGroup?.subjectIds || [normalizedSubjectId];

      const students = await studentModel.find({
        _id: { $in: studentIds },
        class: normalizedClassGrade,
        classStream: normalizedClassStream,
      } as any);
      let updatedCount = 0;

      for (const student of students) {
        const doc = student;
        let enrolled = Array.isArray((doc as any).enrolledSubjects)
          ? [...(doc as any).enrolledSubjects]
          : [];

        if (normalizedAction === "enroll") {
          enrolled = enrolled.filter(
            (entry) =>
              !(
                linkedSubjectIds.includes(
                  normalizeSubjectId(entry.subjectId),
                ) &&
                enrollmentMatchesClass(
                  entry,
                  normalizedClassGrade,
                  normalizedClassStream,
                ) &&
                normalizeSubjectId(entry.subjectId) !== normalizedSubjectId
              ),
          );
          const exists = enrolled.find(
            (entry) =>
              normalizeSubjectId(entry.subjectId) === normalizedSubjectId &&
              enrollmentMatchesClass(
                entry,
                normalizedClassGrade,
                normalizedClassStream,
              ),
          );
          if (!exists) {
            enrolled.push({
              subjectId: normalizedSubjectId,
              classGrade: normalizedClassGrade,
              classStream: normalizedClassStream,
              isActive: true,
              enrolledAt: new Date(),
            });
          } else {
            exists.isActive = true;
            exists.enrolledAt = exists.enrolledAt || new Date();
          }
        } else {
          enrolled = enrolled.filter(
            (entry) =>
              !(
                normalizeSubjectId(entry.subjectId) === normalizedSubjectId &&
                enrollmentMatchesClass(
                  entry,
                  normalizedClassGrade,
                  normalizedClassStream,
                )
              ),
          );
        }

        const sanitizedEnrolled = sanitizeEnrolledSubjects(
          enrolled,
          normalizedClassGrade,
          normalizedClassStream,
        );

        await validateStudentElectiveEnrollments(
          sanitizedEnrolled,
          normalizedClassGrade,
          normalizedClassStream,
          { requireCompleteLinkedGroups: false },
        );
        (doc as any).enrolledSubjects = sanitizedEnrolled;
        await doc.save();
        updatedCount++;
      }

      res.json({ message: `Successfully updated ${updatedCount} students.` });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
);

// PUT update a user
router.put("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    let updateData: any = {};
    if (role === rolesMapped.ST) {
      const classGrade = normalizeClassValue(req.body.classGrade);
      const classStream = normalizeClassValue(req.body.classStream);
      const enrolledSubjects = sanitizeEnrolledSubjects(
        req.body.enrolledSubjects,
        classGrade,
        classStream,
      );
      await validateStudentElectiveEnrollments(
        enrolledSubjects,
        classGrade,
        classStream,
        { requireCompleteLinkedGroups: false },
      );
      updateData = {
        __t: rolesMapped.ST,
        studentsName: req.body.name,
        ADM: req.body.admissionNo,
        gender: req.body.gender,
        guardianName: req.body.guardianName,
        guardianPhone: req.body.guardianPhone,
        class: classGrade,
        classStream: classStream,
        status: req.body.status,
        enrolledSubjects,
      };
      console.log(updateData);
    } else {
      const rolesArray = Array.isArray(req.body.roles)
        ? req.body.roles
        : [req.body.role].filter(Boolean);
      // Prevent assigning a teacher who is already assigned to another class
      if (rolesArray.includes("classteacher") && req.body.classGrade) {
        const targetTeacher = await userModel.findById(id);
        if (
          targetTeacher &&
          targetTeacher.class &&
          targetTeacher.class !== req.body.classGrade
        ) {
          return res.status(400).json({
            message: `${(targetTeacher as any).teachersName} is already assigned as a class teacher for ${targetTeacher.class}. Please unassign them first.`,
          });
        }
      }
      console.log(req.body.roles || "No roles");
      updateData = {
        __t: rolesArray[0],
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

    const user = await userModel.findByIdAndUpdate(id, updateData, {
      returnDocument: "after",
      overwriteDiscriminatorKey: true,
      runValidators: true,
    });
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    // user.set(updateData);
    console.log(user);
    // const updatedUser = await user.save();
    // if (!updatedUser)
    //   return res.status(404).json({ message: "User not found" });

    res.json(user);
    console.log(user);
  } catch (error: any) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE a user
router.delete("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const classGrade = (user as any).class;
    const classStream = (user as any).classStream;

    await userModel.findByIdAndDelete(id);

    // Delete all marks for this student
    await MarkModel.deleteMany({ studentId: id as any });

    // If this was the last student in the class, clean up class metadata
    if (classGrade) {
      const remainingStudents = await studentModel.countDocuments({
        class: classGrade,
        classStream: classStream || "",
      });

      if (remainingStudents === 0) {
        await Promise.all([
          AssignmentModel.deleteMany({
            classGrade,
            classStream: classStream || "",
          }),
          ClassSubjectSettingModel.deleteMany({
            classGrade,
            classStream: classStream || "",
          }),
        ]);
      }
    }

    res.json({ message: "User deleted successfully and data cleaned up" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
