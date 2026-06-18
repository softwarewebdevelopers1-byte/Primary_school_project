import { MarkModel, SubjectModel } from "../../models/school.model.js";
import { studentModel } from "../../models/user.model.js";
import {
  computeMarkPercentage,
  getCbcGradingBands,
  buildMarkGradingFields,
} from "../../utils/grading.js";
import type {
  QueueStatus,
  WhatsappQueueItem,
  QueueJob,
} from "../../types/whatsApp.Types.js";
import DotEnvFile from "../../config/env.js";

const queue: WhatsappQueueItem[] = [];
const jobs = new Map<string, QueueJob>();
let processing = false;

const WAHA_BASE_URL = DotEnvFile.WAHA_BASE_URL.replace(/\/+$/, "");
const WAHA_SESSION = DotEnvFile.WAHA_session;
const WAHA_API_KEY = DotEnvFile.WAHA_API || "";
const SEND_DELAY_MS = Math.max(
  1000,
  Number(DotEnvFile.WAHA_SEND_DELAY_MS || 15000),
);
const SEND_JITTER_MS = Math.max(
  0,
  Number(DotEnvFile.WAHA_SEND_JITTER_MS || 6000),
);

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeClassValue = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

export const normalizeWhatsappPhone = (value: unknown) => {
  const raw = typeof value === "string" ? value.trim() : "";
  let digits = raw.replace(/\D/g, "");

  if (!digits) return null;
  if (digits.startsWith("0") && digits.length >= 10) {
    digits = `254${digits.slice(1)}`;
  }
  if (digits.length === 9 && /^[17]/.test(digits)) {
    digits = `254${digits}`;
  }

  return digits.length >= 10 ? digits : null;
};

const formatExamType = (examType: string) =>
  examType ? `${examType.charAt(0).toUpperCase()}${examType.slice(1)}` : "Exam";

export const sendWahaText = async (chatId: string, text: string) => {
  const response = await fetch(`${WAHA_BASE_URL}/api/sendText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(WAHA_API_KEY ? { "X-Api-Key": WAHA_API_KEY } : {}),
    },
    body: JSON.stringify({
      session: WAHA_SESSION,
      chatId,
      text,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`WAHA send failed (${response.status}) ${body}`.trim());
  }
};

const processQueue = async () => {
  if (processing) return;
  processing = true;

  while (queue.length > 0) {
    const item = queue.shift();
    if (!item) continue;

    const job = jobs.get(item.jobId);
    if (job && job.status === "queued") {
      job.status = "sending";
    }

    item.status = "sending";
    item.attempts += 1;

    try {
      await sendWahaText(item.chatId, item.message);
      item.status = "completed";
      if (job) {
        job.sent += 1;
      }
    } catch (error: any) {
      item.status = "failed";
      item.error = error?.message || "Unknown WAHA error";
      if (job) {
        job.failed += 1;
      }
    }

    if (job && job.sent + job.failed >= job.queued) {
      job.status = job.failed > 0 ? "failed" : "completed";
    }

    const jitter = Math.floor(Math.random() * SEND_JITTER_MS);
    await wait(SEND_DELAY_MS + jitter);
  }

  processing = false;
};

export const buildStudentMessage = (params: {
  student: any;
  subjectRows: Array<{
    subjectName: string;
    score: number | null;
    cbcBand?: string | null;
    points?: number | null;
  }>;
  classGrade: string;
  classStream: string;
  term: number;
  year: number;
  examType: string;
}) => {
  const scores = params.subjectRows
    .map((row) => row.score)
    .filter((score): score is number => typeof score === "number");
  const average =
    scores.length > 0
      ? Math.round(
          scores.reduce((sum, score) => sum + score, 0) / scores.length,
        )
      : null;
  const totalPoints = params.subjectRows.reduce(
    (sum, row) => sum + Number(row.points || 0),
    0,
  );

  const rows = params.subjectRows
    .sort((left, right) => left.subjectName.localeCompare(right.subjectName))
    .map((row) => {
      const scoreText = row.score === null ? "Pending" : `*${row.score}%*`;
      const bandText = row.cbcBand ? ` - _${row.cbcBand}_` : "";
      const pointText =
        row.points !== null && row.points !== undefined
          ? ` (*${row.points} pts*)`
          : "";
      return `📖 *${row.subjectName}*: ${scoreText}${bandText}${pointText}`;
    });

  const classText = `Grade ${params.classGrade}${params.classStream ? ` ${params.classStream}` : ""}`;
  const examText = `${formatExamType(params.examType)}`;

  // Determine performance level based on average
  let performanceLevel = "";
  if (average !== null) {
    if (average >= 80) {
      performanceLevel = "🌟 *Excellent*";
    } else if (average >= 50) {
      performanceLevel = "✅ *Good*";
    } else {
      performanceLevel = "📚 *Needs Improvement*";
    }
  }

  return [
    `*🏫 ACADEMIC REPORT CARD*`,
    `----------------------------------------`,
    `Hello *${params.student.guardianName || "Parent"}*,`,
    ``,
    `Here are the exam results for *${params.student.studentsName}*:`,
    `• *Class:* ${classText}`,
    `• *Term:* Term ${params.term}, ${params.year}`,
    `• *Exam:* ${examText}`,
    `----------------------------------------`,
    `*📚 SUBJECT PERFORMANCE*`,
    ...rows,
    `----------------------------------------`,
    `📈 *SUMMARY*`,
    `• *Average:* *${average === null ? "Pending" : `${average}%`}*`,
    `• *Performance:* ${performanceLevel || "Pending"}`,
    `• *Total CBC Points:* *${Number(totalPoints.toFixed(1))}*`,
    `----------------------------------------`,
    `To stop receiving these messages, reply with STOP.`,
    `----------------------------------------`,
    `Regards,`,
    `*School Administration*`,
  ].join("\n");
};

export const getWhatsappMarksJob = (jobId: string) => jobs.get(jobId) || null;

export const createWhatsappMarksJob = async (params: {
  classGrade: string;
  classStream: string;
  term: number;
  year: number;
  examType: string;
}) => {
  const classGrade = normalizeClassValue(params.classGrade);
  const classStream = normalizeClassValue(params.classStream);

  const students = await studentModel
    .find({
      status: { $ne: "inactive" },
      class: classGrade,
      classStream: classStream || { $in: ["", null] },
      whatsappOptOut: { $ne: true },
    } as any)
    .select("_id studentsName ADM guardianName guardianPhone whatsappOptOut")
    .sort({ studentsName: 1 })
    .lean();

  const gradingBands = await getCbcGradingBands();

  const studentIds = students.map((student: any) => student._id);
  const marks = await MarkModel.find({
    studentId: { $in: studentIds },
    classGrade,
    classStream,
    term: params.term,
    year: params.year,
    examType: params.examType,
  } as any).lean();

  const subjectIds = Array.from(
    new Set(
      marks.map((mark: any) => mark.subjectId?.toString()).filter(Boolean),
    ),
  );
  const subjects = await SubjectModel.find({ _id: { $in: subjectIds } } as any)
    .select("_id name")
    .lean();
  const subjectNameById = new Map(
    subjects.map((subject: any) => [subject._id.toString(), subject.name]),
  );

  const marksByStudent = new Map<string, any[]>();
  for (const mark of marks as any[]) {
    const studentId = mark.studentId?.toString();
    if (!studentId) continue;
    const list = marksByStudent.get(studentId) || [];
    list.push(mark);
    marksByStudent.set(studentId, list);
  }

  const jobId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const job: QueueJob = {
    id: jobId,
    classGrade,
    classStream,
    term: params.term,
    year: params.year,
    examType: params.examType,
    createdAt: new Date().toISOString(),
    total: students.length,
    queued: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
    status: "queued",
  };

  for (const student of students as any[]) {
    const phone = normalizeWhatsappPhone(student.guardianPhone);
    const studentMarks = marksByStudent.get(student._id.toString()) || [];

    if (!phone || studentMarks.length === 0) {
      job.skipped += 1;
      continue;
    }

    const subjectRows = studentMarks.map((mark: any) => {
      const score = computeMarkPercentage(mark);
      const gradingFields = buildMarkGradingFields(score, gradingBands);
      return {
        subjectName:
          subjectNameById.get(mark.subjectId?.toString()) ||
          `Subject ${String(mark.subjectId || "").slice(-6)}`,
        score,
        cbcBand: gradingFields.cbcBand,
        points: gradingFields.points,
      };
    });
    const queueItem: WhatsappQueueItem = {
      jobId,
      studentId: student._id.toString(),
      studentName: student.studentsName,
      guardianPhone: student.guardianPhone,
      chatId: `${phone}@c.us`,
      message: buildStudentMessage({
        student,
        subjectRows,
        classGrade,
        classStream,
        term: params.term,
        year: params.year,
        examType: params.examType,
      }),
      status: "queued",
      attempts: 0,
    };
    queue.push(queueItem);
    job.queued += 1;
  }

  if (job.queued === 0) {
    job.status = "completed";
  }

  jobs.set(jobId, job);
  void processQueue();

  return job;
};
