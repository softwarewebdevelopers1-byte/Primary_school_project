import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { Groq } from "groq-sdk/index.mjs";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import {
  AssignmentModel,
  SubjectModel,
  TimetableModel,
  type ITimetableDay,
  type ITimetableEntry,
} from "../models/school.model.js";
import { rolesMapped, studentModel, userModel } from "../models/user.model.js";

const SCHOOL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;
const allowedTimetableModes = new Set(["ai", "balanced-fallback"] as const);

type SchoolDay = (typeof SCHOOL_DAYS)[number];

export interface TimetableBreakInput {
  label: string;
  startTime: string;
  endTime: string;
}

export interface CreateSchoolTimetableInput {
  schoolStartTime: string;
  subjectsPerDay: number;
  subjectDurationMinutes: number;
  breaks: TimetableBreakInput[];
  generatedByUserId?: string;
}

interface ClassSubjectContext {
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
}

interface ClassTimetableContext {
  classGrade: string;
  classStream: string;
  classTeacherId: string | null;
  classTeacherName: string | null;
  studentCount: number;
  subjects: ClassSubjectContext[];
}

interface TimetableGenerationContext {
  term: number;
  year: number;
  classes: ClassTimetableContext[];
}

interface TimetableLessonPlan {
  subjectId: string | null;
  subjectName: string;
  teacherId: string | null;
  teacherName: string | null;
}

interface ClassTimetablePlan {
  classGrade: string;
  classStream: string;
  classTeacherId: string | null;
  classTeacherName: string | null;
  studentCount: number;
  lessonPlan: Record<SchoolDay, TimetableLessonPlan[]>;
}

interface GeneratedSchoolTimetablePlan {
  summary: string;
  generationMode: "ai" | "balanced-fallback";
  classes: ClassTimetablePlan[];
}

interface PersistedTimetableState {
  storagePath: string;
  timetableId: string;
}

interface TimetableStorageUpload {
  pdfUrl: string;
  storagePath: string;
}

interface DailyTemplateEntry {
  type: "lesson" | "break";
  label?: string;
  startTime: string;
  endTime: string;
  slotNumber?: number;
}

const parseTimeToMinutes = (value: string) => {
  const match = /^(\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) {
    throw new Error(`Invalid time value "${value}". Use HH:MM format.`);
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`Time "${value}" is out of range.`);
  }

  return hours * 60 + minutes;
};

const formatMinutesAsTime = (value: number) => {
  const safeValue = Math.max(0, value);
  const hours = Math.floor(safeValue / 60);
  const minutes = safeValue % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const formatDurationLabel = (totalMinutes: number) => {
  if (totalMinutes % 60 === 0) {
    const hours = totalMinutes / 60;
    return `${hours} HOUR${hours === 1 ? "" : "S"}`;
  }

  return `${totalMinutes} MINS`;
};

const sanitizeSegment = (value: string) =>
  value.trim().replace(/[^\w-]+/g, "_");

const isClassTeacherRecord = (user: any) => {
  const roleValues = [user?.roles?.role1, user?.roles?.role2, user?.roles?.role3, user?.__t].filter(Boolean);
  return roleValues.includes(rolesMapped.CT);
};

const getGroqClient = () => {
  const apiKey = process.env.API_KEY?.trim() || process.env.GROQ_API_KEY?.trim();
  if (!apiKey) return null;
  return new Groq({ apiKey });
};

const getSupabaseStorage = () => {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const supabaseBucket = process.env.SUPABASE_BUCKET?.trim();

  if (!supabaseUrl || !supabaseServiceRoleKey || !supabaseBucket) {
    throw new Error("Missing Supabase environment variables for timetable upload.");
  }

  return {
    supabase: createClient(supabaseUrl, supabaseServiceRoleKey),
    supabaseBucket,
  };
};

const normalizeBreaks = (breaks: TimetableBreakInput[]) => {
  const normalized = (Array.isArray(breaks) ? breaks : [])
    .map((item, index) => ({
      label: item?.label?.trim() || `Break ${index + 1}`,
      startTime: item?.startTime?.trim() || "",
      endTime: item?.endTime?.trim() || "",
      startMinutes: parseTimeToMinutes(item?.startTime?.trim() || ""),
      endMinutes: parseTimeToMinutes(item?.endTime?.trim() || ""),
    }))
    .sort((left, right) => left.startMinutes - right.startMinutes);

  normalized.forEach((item) => {
    if (item.endMinutes <= item.startMinutes) {
      throw new Error(`Break "${item.label}" must end after it starts.`);
    }
  });

  for (let index = 1; index < normalized.length; index += 1) {
    const currentBreak = normalized[index];
    const previousBreak = normalized[index - 1];

    if (currentBreak && previousBreak && currentBreak.startMinutes < previousBreak.endMinutes) {
      throw new Error("Break times cannot overlap.");
    }
  }

  return normalized.map(({ label, startTime, endTime, startMinutes, endMinutes }) => ({
    label,
    startTime,
    endTime,
    startMinutes,
    endMinutes,
  }));
};

const validateBreakSchedule = (
  schoolStartTime: string,
  subjectDurationMinutes: number,
  breaks: ReturnType<typeof normalizeBreaks>,
) => {
  const schoolStartMinutes = parseTimeToMinutes(schoolStartTime);
  let lessonCursorMinutes = schoolStartMinutes;

  breaks.forEach((currentBreak) => {
    if (currentBreak.startMinutes <= schoolStartMinutes) {
      throw new Error(
        `Break "${currentBreak.label}" must start after the school day begins at ${schoolStartTime}.`,
      );
    }

    if (currentBreak.startMinutes < lessonCursorMinutes) {
      throw new Error(
        `Break "${currentBreak.label}" overlaps an earlier lesson or break. Adjust the timetable setup and try again.`,
      );
    }

    const gapMinutes = currentBreak.startMinutes - lessonCursorMinutes;
    if (gapMinutes % subjectDurationMinutes !== 0) {
      throw new Error(
        `Break "${currentBreak.label}" must begin after a full lesson slot when lessons start at ${schoolStartTime} and run for ${subjectDurationMinutes} minutes.`,
      );
    }

    lessonCursorMinutes = currentBreak.endMinutes;
  });
};

const buildDailyTemplate = (
  schoolStartTime: string,
  subjectsPerDay: number,
  subjectDurationMinutes: number,
  breaks: ReturnType<typeof normalizeBreaks>,
) => {
  const template: DailyTemplateEntry[] = [];
  let currentMinutes = parseTimeToMinutes(schoolStartTime);
  let lessonsCreated = 0;
  let nextBreakIndex = 0;

  while (lessonsCreated < subjectsPerDay) {
    const nextBreak = breaks[nextBreakIndex];

    if (nextBreak && currentMinutes >= nextBreak.startMinutes) {
      template.push({
        type: "break",
        label: nextBreak.label,
        startTime: nextBreak.startTime,
        endTime: nextBreak.endTime,
      });
      currentMinutes = nextBreak.endMinutes;
      nextBreakIndex += 1;
      continue;
    }

    if (nextBreak && currentMinutes < nextBreak.startMinutes && currentMinutes + subjectDurationMinutes > nextBreak.startMinutes) {
      throw new Error(
        `Break "${nextBreak.label}" interrupts a lesson block. Adjust the break time or the lesson duration so the break starts at the end of a lesson.`,
      );
    }

    const startTime = formatMinutesAsTime(currentMinutes);
    currentMinutes += subjectDurationMinutes;

    template.push({
      type: "lesson",
      slotNumber: lessonsCreated + 1,
      startTime,
      endTime: formatMinutesAsTime(currentMinutes),
    });
    lessonsCreated += 1;
  }

  return template;
};

const buildClassKey = (classGrade: string, classStream: string) =>
  `${classGrade}::${classStream}`;

const rotateArray = <T,>(items: T[], offset: number) => {
  if (items.length === 0) return [];
  const normalizedOffset = ((offset % items.length) + items.length) % items.length;
  return [...items.slice(normalizedOffset), ...items.slice(0, normalizedOffset)];
};

const shuffleArray = <T,>(items: T[]) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j] as T, result[i] as T];
  }
  return result;
};

const extractJsonPayload = (rawText: string) => {
  const trimmed = rawText.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch?.[1]?.trim() || trimmed;
  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("Groq did not return a valid JSON object.");
  }

  return candidate.slice(firstBrace, lastBrace + 1);
};

const buildSubjectLookup = (subjects: ClassSubjectContext[]) => {
  const byId = new Map<string, ClassSubjectContext>();
  const byName = new Map<string, ClassSubjectContext>();

  for (const subject of subjects) {
    byId.set(subject.subjectId, subject);
    byName.set(subject.subjectName.trim().toLowerCase(), subject);
  }

  return { byId, byName };
};

const validatePlanQuality = (
  plan: GeneratedSchoolTimetablePlan,
  classes: ClassTimetableContext[],
  subjectsPerDay: number,
) => {
  const totalWeeklySlots = SCHOOL_DAYS.length * subjectsPerDay;
  const classContextByKey = new Map(
    classes.map((currentClass) => [
      buildClassKey(currentClass.classGrade, currentClass.classStream),
      currentClass,
    ]),
  );

  for (const classPlan of plan.classes) {
    const classKey = buildClassKey(classPlan.classGrade, classPlan.classStream);
    const classContext = classContextByKey.get(classKey);

    if (!classContext || classContext.subjects.length <= 1) {
      continue;
    }

    const weeklyCounts = new Map<string, number>();
    const dayCounts = new Map<SchoolDay, Map<string, number>>();
    const uniqueSubjects = new Set<string>();
    const minWeeklyCount = Math.floor(totalWeeklySlots / classContext.subjects.length);
    const maxWeeklyCount = Math.ceil(totalWeeklySlots / classContext.subjects.length);

    for (const day of SCHOOL_DAYS) {
      const lessons = classPlan.lessonPlan[day] || [];
      const countsForDay = new Map<string, number>();
      let previousSubjectId: string | null = null;
      let consecutiveCount = 0;

      for (const lesson of lessons) {
        if (!lesson?.subjectId) {
          previousSubjectId = null;
          consecutiveCount = 0;
          continue;
        }

        uniqueSubjects.add(lesson.subjectId);
        weeklyCounts.set(lesson.subjectId, (weeklyCounts.get(lesson.subjectId) || 0) + 1);
        countsForDay.set(lesson.subjectId, (countsForDay.get(lesson.subjectId) || 0) + 1);

        consecutiveCount =
          previousSubjectId === lesson.subjectId ? consecutiveCount + 1 : 1;

        if (consecutiveCount >= 3) {
          throw new Error(
            `Groq repeated ${lesson.subjectName || lesson.subjectId} too many times in a row for ${classPlan.classGrade} ${classPlan.classStream} on ${day}.`,
          );
        }

        previousSubjectId = lesson.subjectId;
      }

      dayCounts.set(day, countsForDay);
    }

    if (uniqueSubjects.size < Math.min(classContext.subjects.length, totalWeeklySlots)) {
      throw new Error(
        `Groq did not spread subjects widely enough for ${classPlan.classGrade} ${classPlan.classStream}.`,
      );
    }

    for (const subject of classContext.subjects) {
      const weeklyCount = weeklyCounts.get(subject.subjectId) || 0;
      if (weeklyCount < minWeeklyCount || weeklyCount > maxWeeklyCount) {
        throw new Error(
          `Groq gave ${subject.subjectName} an unrealistic weekly load for ${classPlan.classGrade} ${classPlan.classStream}.`,
        );
      }

      const maxDailyCountAllowed =
        Math.max(1, Math.ceil(weeklyCount / SCHOOL_DAYS.length)) +
        (classContext.subjects.length <= 3 ? 1 : 0);

      for (const day of SCHOOL_DAYS) {
        const scheduledThatDay = dayCounts.get(day)?.get(subject.subjectId) || 0;
        if (scheduledThatDay > maxDailyCountAllowed) {
          throw new Error(
            `Groq overloaded ${subject.subjectName} on ${day} for ${classPlan.classGrade} ${classPlan.classStream}.`,
          );
        }
      }
    }
  }
};

const generateFallbackPlan = (
  classes: ClassTimetableContext[],
  subjectsPerDay: number,
): GeneratedSchoolTimetablePlan => {
  const totalWeeklySlots = SCHOOL_DAYS.length * subjectsPerDay;
  const classPlans = new Map<string, ClassTimetablePlan>();
  const remainingByClass = new Map<string, Map<string, number>>();

  classes.forEach((currentClass) => {
    const classKey = buildClassKey(currentClass.classGrade, currentClass.classStream);
    const counts = new Map<string, number>();

    if (currentClass.subjects.length > 0) {
      const baseCount = Math.floor(totalWeeklySlots / currentClass.subjects.length);
      const remainder = totalWeeklySlots % currentClass.subjects.length;

      // Shuffle subjects initially to avoid deterministic bias
      const shuffledSubjects = shuffleArray(currentClass.subjects);
      shuffledSubjects.forEach((subject, index) => {
        counts.set(subject.subjectId, baseCount + (index < remainder ? 1 : 0));
      });
    }

    remainingByClass.set(classKey, counts);
    classPlans.set(classKey, {
      classGrade: currentClass.classGrade,
      classStream: currentClass.classStream,
      classTeacherId: currentClass.classTeacherId,
      classTeacherName: currentClass.classTeacherName,
      studentCount: currentClass.studentCount,
      lessonPlan: {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
      },
    });
  });

  for (let dayIndex = 0; dayIndex < SCHOOL_DAYS.length; dayIndex += 1) {
    const day = SCHOOL_DAYS[dayIndex];
    const previousSubjectByClass = new Map<string, string | null>();
    const daySubjectCounts = new Map<string, Map<string, number>>();

    for (let slotIndex = 0; slotIndex < subjectsPerDay; slotIndex += 1) {
      const teacherBooked = new Set<string>();

      // Randomize the order of classes processed for this slot to prevent teacher priority bias
      const classIndices = shuffleArray(Array.from({ length: classes.length }, (_, i) => i));

      for (const classIndex of classIndices) {
        const currentClass = classes[classIndex];
        if (!currentClass) continue;

        const classKey = buildClassKey(currentClass.classGrade, currentClass.classStream);
        const subjectCountsForDay = daySubjectCounts.get(classKey) || new Map<string, number>();
        daySubjectCounts.set(classKey, subjectCountsForDay);

        const previousSubjectId = previousSubjectByClass.get(classKey);
        const remainingDays = SCHOOL_DAYS.length - dayIndex;

        const candidatePool = currentClass.subjects
          .map((subject) => {
            const remaining = remainingByClass.get(classKey)?.get(subject.subjectId) || 0;
            const dayCount = subjectCountsForDay.get(subject.subjectId) || 0;
            const dailyCap = Math.max(1, Math.ceil(remaining / Math.max(1, remainingDays)));
            return {
              ...subject,
              remaining,
              dayCount,
              dailyCap,
            };
          })
          .filter((subject) => subject.remaining > 0 && !teacherBooked.has(subject.teacherId));

        let viableCandidates = candidatePool.filter(
          (subject) => previousSubjectId !== subject.subjectId && subject.dayCount < subject.dailyCap
        );

        if (viableCandidates.length === 0) {
          viableCandidates = candidatePool.filter((subject) => subject.dayCount < subject.dailyCap);
        }

        if (viableCandidates.length === 0) {
          viableCandidates = candidatePool.filter((subject) => previousSubjectId !== subject.subjectId);
        }

        if (viableCandidates.length === 0) {
          viableCandidates = candidatePool;
        }

        // Sort candidates with a random tie-breaker instead of alphabetical
        viableCandidates.sort((left, right) => {
          const leftUrgency = left.remaining / Math.max(1, remainingDays);
          const rightUrgency = right.remaining / Math.max(1, remainingDays);
          if (Math.abs(rightUrgency - leftUrgency) > 0.01) return rightUrgency - leftUrgency;
          if (left.dayCount !== right.dayCount) return left.dayCount - right.dayCount;
          // Use Math.random() for tie-breaking
          return Math.random() - 0.5;
        });

        const selectedSubject = viableCandidates[0];

        if (selectedSubject) {
          const planForClass = classPlans.get(classKey);
          if (planForClass) {
            planForClass.lessonPlan[day as SchoolDay].push({
              subjectId: selectedSubject.subjectId,
              subjectName: selectedSubject.subjectName,
              teacherId: selectedSubject.teacherId,
              teacherName: selectedSubject.teacherName,
            });
          }
          teacherBooked.add(selectedSubject.teacherId);
          previousSubjectByClass.set(classKey, selectedSubject.subjectId);
          subjectCountsForDay.set(selectedSubject.subjectId, (subjectCountsForDay.get(selectedSubject.subjectId) || 0) + 1);
          remainingByClass.get(classKey)?.set(selectedSubject.subjectId, selectedSubject.remaining - 1);
        } else {
          const planForClass = classPlans.get(classKey);
          if (planForClass) {
            planForClass.lessonPlan[day as SchoolDay].push({
              subjectId: null,
              subjectName: "Independent Study",
              teacherId: null,
              teacherName: "Department Supervision",
            });
          }
          previousSubjectByClass.set(classKey, null);
        }
      }
    }
  }

  return {
    generationMode: "balanced-fallback",
    summary:
      "Balanced fallback scheduler generated the timetable using randomized subject distribution, strict teacher conflict checks, and realistic daily subject spacing.",
    classes: Array.from(classPlans.values()),
  };
};

const normalizeGroqPlan = (
  rawResponse: string,
  classes: ClassTimetableContext[],
  subjectsPerDay: number,
): GeneratedSchoolTimetablePlan => {
  const parsed = JSON.parse(extractJsonPayload(rawResponse));
  const classResponse = Array.isArray(parsed?.classes) ? parsed.classes : [];

  if (classResponse.length !== classes.length) {
    throw new Error("Groq timetable plan did not cover every class.");
  }

  const normalizedPlans: ClassTimetablePlan[] = classes.map((currentClass) => {
    const matchedClass = classResponse.find(
      (entry: any) =>
        String(entry?.classGrade).trim() === currentClass.classGrade &&
        String(entry?.classStream).trim() === currentClass.classStream,
    );

    if (!matchedClass) {
      throw new Error(`Groq timetable plan is missing ${currentClass.classGrade} ${currentClass.classStream}.`);
    }

    const subjectLookup = buildSubjectLookup(currentClass.subjects);
    const lessonPlan = {} as Record<SchoolDay, TimetableLessonPlan[]>;

    SCHOOL_DAYS.forEach((day) => {
      const rawDayValue = Array.isArray(matchedClass?.days)
        ? matchedClass.days.find((item: any) => String(item?.day).trim() === day)?.subjects
        : matchedClass?.days?.[day];

      if (!Array.isArray(rawDayValue) || rawDayValue.length !== subjectsPerDay) {
        throw new Error(`Groq timetable plan for ${currentClass.classGrade} ${currentClass.classStream} has an invalid ${day} schedule.`);
      }

      lessonPlan[day] = rawDayValue.map((item: any) => {
        const rawValue =
          typeof item === "string"
            ? item
            : typeof item?.subjectId === "string"
              ? item.subjectId
              : typeof item?.subjectName === "string"
                ? item.subjectName
                : "";

        const matchedSubject =
          subjectLookup.byId.get(rawValue.trim()) ||
          subjectLookup.byName.get(rawValue.trim().toLowerCase());

        if (!matchedSubject) {
          throw new Error(
            `Groq returned an unknown subject "${rawValue}" for ${currentClass.classGrade} ${currentClass.classStream}.`,
          );
        }

        return {
          subjectId: matchedSubject.subjectId,
          subjectName: matchedSubject.subjectName,
          teacherId: matchedSubject.teacherId,
          teacherName: matchedSubject.teacherName,
        };
      });
    });

    return {
      classGrade: currentClass.classGrade,
      classStream: currentClass.classStream,
      classTeacherId: currentClass.classTeacherId,
      classTeacherName: currentClass.classTeacherName,
      studentCount: currentClass.studentCount,
      lessonPlan,
    };
  });

  for (const day of SCHOOL_DAYS) {
    for (let slotIndex = 0; slotIndex < subjectsPerDay; slotIndex += 1) {
      const teacherOccupancy = new Map<string, string>();

      for (const currentClass of normalizedPlans) {
        const lesson = currentClass.lessonPlan[day][slotIndex];
        if (!lesson?.teacherId) continue;

        const classLabel = `${currentClass.classGrade} ${currentClass.classStream}`;
        const existingClass = teacherOccupancy.get(lesson.teacherId);

        if (existingClass) {
          throw new Error(
            `Groq scheduled teacher ${lesson.teacherName || lesson.teacherId} for both ${existingClass} and ${classLabel} on ${day} period ${slotIndex + 1}.`,
          );
        }

        teacherOccupancy.set(lesson.teacherId, classLabel);
      }
    }
  }

  return {
    generationMode: "ai",
    summary:
      typeof parsed?.summary === "string" && parsed.summary.trim()
        ? parsed.summary.trim()
        : "Groq AI generated a balanced timetable plan for the school.",
    classes: normalizedPlans,
  };
};

const generatePlanWithGroq = async (
  classes: ClassTimetableContext[],
  subjectsPerDay: number,
): Promise<GeneratedSchoolTimetablePlan | null> => {
  const groq = getGroqClient();
  if (!groq) return null;

  const classPayload = classes.map((currentClass) => ({
    classGrade: currentClass.classGrade,
    classStream: currentClass.classStream,
    studentCount: currentClass.studentCount,
    subjects: currentClass.subjects.map((subject) => ({
      subjectId: subject.subjectId,
      subjectName: subject.subjectName,
      teacherId: subject.teacherId,
      teacherName: subject.teacherName,
    })),
  }));

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You generate school timetables. Return only valid JSON with no markdown. Respect teacher availability across classes and keep timetables balanced.",
      },
      {
        role: "user",
        content: [
          "Create a school timetable plan for Monday to Friday.",
          `Each class must have exactly ${subjectsPerDay} lesson slots per day.`,
          "Return JSON in this exact shape:",
          JSON.stringify({
            summary: "short explanation",
            classes: [
              {
                classGrade: "7",
                classStream: "A",
                days: {
                  Monday: ["subject-id-1", "subject-id-2"],
                  Tuesday: ["subject-id-1", "subject-id-2"],
                  Wednesday: ["subject-id-1", "subject-id-2"],
                  Thursday: ["subject-id-1", "subject-id-2"],
                  Friday: ["subject-id-1", "subject-id-2"],
                },
              },
            ],
          }),
          "Rules:",
          "1. Use only the provided subjectId values for each class.",
          "2. Do not schedule the same teacher in two classes during the same day/period.",
          "3. Distribute subjects as evenly as possible across the week.",
          "4. Avoid repeating the same subject in consecutive periods for a class unless unavoidable.",
          "5. Make different classes have different subject orderings when possible.",
          `Class data: ${JSON.stringify(classPayload)}`,
        ].join("\n"),
      },
    ],
    model: "llama3-70b-8192",
    temperature: 0.7,
    max_completion_tokens: 8192,
    stream: true,
  });

  let fullAI = "";
  for await (const chunk of chatCompletion) {
    const piece = chunk.choices[0]?.delta?.content;
    if (piece) fullAI += piece;
  }

  return normalizeGroqPlan(fullAI, classes, subjectsPerDay);
};

const buildRenderedDays = (
  lessonPlan: Record<SchoolDay, TimetableLessonPlan[]>,
  dailyTemplate: DailyTemplateEntry[],
): ITimetableDay[] =>
  SCHOOL_DAYS.map((day) => {
    const lessonQueue = [...lessonPlan[day]];
    const entries: ITimetableEntry[] = dailyTemplate.map((entry) => {
      if (entry.type === "break") {
        return {
          type: "break",
          label: entry.label || null,
          startTime: entry.startTime,
          endTime: entry.endTime,
          slotNumber: null,
          subjectId: null,
          subjectName: null,
          teacherId: null,
          teacherName: null,
        };
      }

      const lesson = lessonQueue.shift() || {
        subjectId: null,
        subjectName: "Independent Study",
        teacherId: null,
        teacherName: "Department Supervision",
      };

      return {
        type: "lesson",
        label: null,
        startTime: entry.startTime,
        endTime: entry.endTime,
        slotNumber: entry.slotNumber ?? null,
        subjectId: lesson.subjectId,
        subjectName: lesson.subjectName,
        teacherId: lesson.teacherId,
        teacherName: lesson.teacherName,
      };
    });

    return {
      day,
      entries,
    };
  });

const buildBreakRowLabel = (entry: ITimetableEntry) => {
  const durationMinutes =
    parseTimeToMinutes(entry.endTime) - parseTimeToMinutes(entry.startTime);
  const label = (entry.label || "Break").toUpperCase();
  return `${label} (${formatDurationLabel(durationMinutes)})`;
};

const createTimetablePdfBuffer = (
  classPlan: ClassTimetablePlan,
  renderedDays: ITimetableDay[],
  term: number,
  year: number,
  schoolStartTime: string,
  subjectsPerDay: number,
  subjectDurationMinutes: number,
) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });
  const schoolName = process.env.SCHOOL_NAME?.trim() || "SCHOOL MANAGEMENT SYSTEM";
  const classLabel = `${classPlan.classGrade} ${classPlan.classStream}`.trim();
  const slotCount = renderedDays[0]?.entries.length || 0;
  const timeLabels = renderedDays[0]?.entries.map(entry => 
    entry.type === "break" ? (entry.label || "BREAK") : `${entry.startTime} - ${entry.endTime}`
  ) || [];

  const body: any[] = renderedDays.map((day) => {
    const row = [
      day.day.toUpperCase(),
      ...day.entries.map((entry) => {
        if (!entry) return "Independent Study";
        if (entry.type === "break") return "BREAK";
        return [entry.subjectName || "Independent Study", entry.teacherName || "Department Supervision"].join("\n");
      }),
    ];
    return row;
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(25, 45, 38);
  doc.text(schoolName.toUpperCase(), doc.internal.pageSize.getWidth() / 2, 14, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(78, 78, 78);
  doc.text(
    `Class Timetable: ${classLabel} | Academic Year ${year} | Term ${term}`,
    doc.internal.pageSize.getWidth() / 2,
    21,
    { align: "center" },
  );

  doc.setFontSize(9.5);
  doc.text(
    `Class Teacher: ${classPlan.classTeacherName || "Not assigned"} | Start Time: ${schoolStartTime} | Lesson Duration: ${subjectDurationMinutes} mins | Lessons Per Day: ${subjectsPerDay}`,
    doc.internal.pageSize.getWidth() / 2,
    27,
    { align: "center" },
  );

  autoTable(doc, {
    head: [["DAY", ...timeLabels]],
    body,
    startY: 33,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 2,
      valign: "middle",
      lineColor: [160, 160, 160],
      lineWidth: 0.1,
      overflow: "linebreak",
      textColor: [38, 38, 38],
    },
    headStyles: {
      fillColor: [63, 97, 82],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
      fontSize: 8,
      cellPadding: 2.5,
    },
    columnStyles: {
      0: {
        cellWidth: 25,
        halign: "center",
        fontStyle: "bold",
        fillColor: [248, 244, 236],
      },
    },
    didParseCell: (data) => {
      if (data.section !== "body") return;
      if (data.column.index === 0) return;

      const cellText = data.cell.text.join("");
      if (cellText === "BREAK") {
        data.cell.styles.fillColor = [236, 228, 208];
        data.cell.styles.textColor = [72, 59, 38];
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.halign = "center";
      } else {
        data.cell.styles.minCellHeight = 15;
      }
    },
    alternateRowStyles: {
      fillColor: [252, 251, 248],
    },
    margin: { left: 10, right: 10, top: 12, bottom: 16 },
  });

  const footerText = `Generated by School Management System | Date: ${new Date().toLocaleDateString()}`;
  doc.setFontSize(8.5);
  doc.setTextColor(110, 110, 110);
  doc.text(footerText, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 6, {
    align: "center",
  });

  return Buffer.from(doc.output("arraybuffer"));
};

const uploadTimetablePdf = async (
  pdfBuffer: Buffer,
  batchId: string,
  classPlan: ClassTimetablePlan,
  term: number,
  year: number,
): Promise<TimetableStorageUpload> => {
  const { supabase, supabaseBucket } = getSupabaseStorage();
  const fileName = `${sanitizeSegment(classPlan.classGrade)}_${sanitizeSegment(classPlan.classStream)}_${Date.now()}.pdf`;
  const storagePath = `timetables/${year}/Term${term}/${batchId}/${fileName}`;

  const uploadResult = await supabase.storage.from(supabaseBucket).upload(storagePath, pdfBuffer, {
    cacheControl: "3600",
    contentType: "application/pdf",
    upsert: false,
  });

  if (uploadResult.error) {
    throw new Error(
      `Supabase upload failed for ${classPlan.classGrade} ${classPlan.classStream}: ${uploadResult.error.message}`,
    );
  }

  const publicUrlResult = supabase.storage.from(supabaseBucket).getPublicUrl(storagePath);
  return {
    pdfUrl: publicUrlResult.data.publicUrl,
    storagePath,
  };
};

const removeSupabaseFiles = async (storagePaths: string[]) => {
  if (storagePaths.length === 0) return;

  const { supabase, supabaseBucket } = getSupabaseStorage();
  const result = await supabase.storage.from(supabaseBucket).remove(storagePaths);

  if (result.error) {
    throw new Error(result.error.message);
  }
};

const rollbackPersistedTimetables = async (state: PersistedTimetableState[]) => {
  const problems: string[] = [];

  try {
    await removeSupabaseFiles(state.map((item) => item.storagePath));
  } catch (error: any) {
    problems.push(`storage cleanup failed (${error.message})`);
  }

  try {
    await TimetableModel.deleteMany({
      _id: {
        $in: state.map((item) => item.timetableId),
      },
    } as any);
  } catch (error: any) {
    problems.push(`database cleanup failed (${error.message})`);
  }

  if (problems.length > 0) {
    throw new Error(problems.join("; "));
  }
};

const buildGenerationContext = async (generatedByUserId?: string): Promise<TimetableGenerationContext> => {
  const [assignments, students, teachers, subjects, generatedByUser, sampleUser] = await Promise.all([
    AssignmentModel.find().lean(),
    studentModel.find({ class: { $ne: null }, classStream: { $ne: null } } as any).lean(),
    userModel.find({
      __t: {
        $in: [
          rolesMapped.CT,
          rolesMapped.SJ,
          rolesMapped.DT,
          rolesMapped.HT,
          rolesMapped.ADM,
        ],
      },
    } as any).lean(),
    SubjectModel.find().lean(),
    generatedByUserId ? userModel.findById(generatedByUserId).lean() : Promise.resolve(null),
    userModel.findOne({ term: { $ne: null } } as any).lean(),
  ]);

  const term = Number((generatedByUser as any)?.term ?? (sampleUser as any)?.term ?? 1);
  const year = Number((generatedByUser as any)?.year ?? (sampleUser as any)?.year ?? new Date().getFullYear());

  const subjectMap = new Map(subjects.map((subject: any) => [subject._id.toString(), subject.name]));
  const teacherMap = new Map(
    teachers.map((teacher: any) => [
      teacher._id.toString(),
      {
        name: teacher.teachersName || teacher.studentsName || "Unknown Teacher",
        class: teacher.class,
        classStream: teacher.classStream,
        isClassTeacher: isClassTeacherRecord(teacher),
      },
    ]),
  );
  const studentCountByClass = new Map<string, number>();
  const classTeacherByClass = new Map<string, { id: string; name: string }>();

  for (const student of students as any[]) {
    const classKey = buildClassKey(student.class, student.classStream);
    studentCountByClass.set(classKey, (studentCountByClass.get(classKey) || 0) + 1);
  }

  for (const teacher of teachers as any[]) {
    if (!teacher.class || !teacher.classStream || !isClassTeacherRecord(teacher)) continue;

    classTeacherByClass.set(buildClassKey(teacher.class, teacher.classStream), {
      id: teacher._id.toString(),
      name: teacher.teachersName || "Class Teacher",
    });
  }

  const classMap = new Map<
    string,
    {
      classGrade: string;
      classStream: string;
      studentCount: number;
      classTeacherId: string | null;
      classTeacherName: string | null;
      subjects: ClassSubjectContext[];
    }
  >();

  const allClasses = new Set([...studentCountByClass.keys(), ...classTeacherByClass.keys()]);
  for (const classKey of allClasses) {
    const parts = classKey.split("::");
    const classGrade = parts[0] || "Unknown";
    const classStream = parts[1] || "";
    const classTeacher = classTeacherByClass.get(classKey);
    classMap.set(classKey, {
      classGrade,
      classStream,
      studentCount: studentCountByClass.get(classKey) || 0,
      classTeacherId: classTeacher?.id || null,
      classTeacherName: classTeacher?.name || null,
      subjects: [],
    });
  }

  for (const assignment of assignments as any[]) {
    const subjectName = subjectMap.get(String(assignment.subjectId));
    const teacherInfo = teacherMap.get(String(assignment.teacherId));
    if (!assignment.classGrade || !assignment.classStream || !subjectName || !teacherInfo) continue;

    const classKey = buildClassKey(assignment.classGrade, assignment.classStream);
    const classTeacher = classTeacherByClass.get(classKey);
    const current = classMap.get(classKey) || {
      classGrade: assignment.classGrade,
      classStream: assignment.classStream,
      studentCount: studentCountByClass.get(classKey) || 0,
      classTeacherId: classTeacher?.id || null,
      classTeacherName: classTeacher?.name || null,
      subjects: [] as ClassSubjectContext[],
    };

    current.subjects.push({
      subjectId: String(assignment.subjectId),
      subjectName,
      teacherId: String(assignment.teacherId),
      teacherName: teacherInfo.name,
    });

    classMap.set(classKey, current);
  }

  const classes = Array.from(classMap.values())
    .map((currentClass) => ({
      ...currentClass,
      subjects: currentClass.subjects
        .filter((subject, index, list) => list.findIndex((item) => item.subjectId === subject.subjectId) === index)
        .sort((left, right) => left.subjectName.localeCompare(right.subjectName)),
    }))
    .sort((left, right) =>
      `${left.classGrade} ${left.classStream}`.localeCompare(`${right.classGrade} ${right.classStream}`),
    );

  if (classes.length === 0) {
    throw new Error(
      "No valid subject assignments were found on the admin assignments page. Assign subjects to classes first, then generate the timetable.",
    );
  }

  return {
    term,
    year,
    classes,
  };
};

const validateTimetableInput = (input: CreateSchoolTimetableInput) => {
  const schoolStartTime = input.schoolStartTime?.trim() || "08:00";
  const subjectsPerDay = Number(input.subjectsPerDay);
  const subjectDurationMinutes = Number(input.subjectDurationMinutes);

  if (!Number.isInteger(subjectsPerDay) || subjectsPerDay < 1 || subjectsPerDay > 12) {
    throw new Error("Subjects per day must be a whole number between 1 and 12.");
  }

  if (!Number.isInteger(subjectDurationMinutes) || subjectDurationMinutes < 20 || subjectDurationMinutes > 180) {
    throw new Error("Subject duration must be between 20 and 180 minutes.");
  }

  parseTimeToMinutes(schoolStartTime);
  const normalizedBreaks = normalizeBreaks(input.breaks || []);
  validateBreakSchedule(schoolStartTime, subjectDurationMinutes, normalizedBreaks);

  return {
    schoolStartTime,
    subjectsPerDay,
    subjectDurationMinutes,
    breaks: normalizedBreaks,
  };
};

export async function generateAndStoreSchoolTimetables(input: CreateSchoolTimetableInput) {
  const validatedInput = validateTimetableInput(input);
  const context = await buildGenerationContext(input.generatedByUserId);

  let plan: GeneratedSchoolTimetablePlan | null = null;
  try {
    plan = await generatePlanWithGroq(context.classes, validatedInput.subjectsPerDay);
    if (plan) {
      validatePlanQuality(plan, context.classes, validatedInput.subjectsPerDay);
    }
  } catch (_error) {
    plan = null;
  }

  const finalPlan = plan || generateFallbackPlan(context.classes, validatedInput.subjectsPerDay);
  if (!allowedTimetableModes.has(finalPlan.generationMode)) {
    throw new Error("Invalid timetable generation mode.");
  }

  const batchId = randomUUID();
  const dailyTemplate = buildDailyTemplate(
    validatedInput.schoolStartTime,
    validatedInput.subjectsPerDay,
    validatedInput.subjectDurationMinutes,
    validatedInput.breaks,
  );

  const persistedState: PersistedTimetableState[] = [];
  const savedTimetables: any[] = [];

  try {
    for (const classPlan of finalPlan.classes) {
      const renderedDays = buildRenderedDays(classPlan.lessonPlan, dailyTemplate);
      const pdfBuffer = createTimetablePdfBuffer(
        classPlan,
        renderedDays,
        context.term,
        context.year,
        validatedInput.schoolStartTime,
        validatedInput.subjectsPerDay,
        validatedInput.subjectDurationMinutes,
      );

      const upload = await uploadTimetablePdf(
        pdfBuffer,
        batchId,
        classPlan,
        context.term,
        context.year,
      );

      try {
        const teacherIds = Array.from(
          new Set(
            renderedDays
              .flatMap((day) => day.entries)
              .map((entry) => entry.teacherId)
              .filter((teacherId): teacherId is string => Boolean(teacherId)),
          ),
        );

        const saved = await TimetableModel.create({
          batchId,
          classGrade: classPlan.classGrade,
          classStream: classPlan.classStream,
          classTeacherId: classPlan.classTeacherId,
          classTeacherName: classPlan.classTeacherName,
          term: context.term,
          year: context.year,
          schoolStartTime: validatedInput.schoolStartTime,
          subjectsPerDay: validatedInput.subjectsPerDay,
          subjectDurationMinutes: validatedInput.subjectDurationMinutes,
          breaks: validatedInput.breaks.map((item) => ({
            label: item.label,
            startTime: item.startTime,
            endTime: item.endTime,
          })),
          days: renderedDays,
          teacherIds,
          pdfUrl: upload.pdfUrl,
          storagePath: upload.storagePath,
          generationMode: finalPlan.generationMode,
          aiSummary: finalPlan.summary,
          generatedBy: input.generatedByUserId || null,
        });

        persistedState.push({
          storagePath: upload.storagePath,
          timetableId: saved._id.toString(),
        });
        savedTimetables.push(saved);
      } catch (error: any) {
        try {
          await removeSupabaseFiles([upload.storagePath]);
        } catch (_cleanupError) {}

        throw new Error(
          `Timetable for ${classPlan.classGrade} ${classPlan.classStream} could not be saved after upload. ${error.message}`,
        );
      }
    }
  } catch (error: any) {
    if (persistedState.length > 0) {
      try {
        await rollbackPersistedTimetables(persistedState);
      } catch (rollbackError: any) {
        throw new Error(`${error.message} Rollback also failed: ${rollbackError.message}`);
      }
    }

    throw error;
  }

  return {
    batchId,
    term: context.term,
    year: context.year,
    generationMode: finalPlan.generationMode,
    aiSummary: finalPlan.summary,
    timetables: savedTimetables,
  };
}

export async function deleteStoredTimetableById(timetableId: string) {
  const deletedTimetable = await TimetableModel.findByIdAndDelete(timetableId);

  if (!deletedTimetable) {
    throw new Error("Timetable not found.");
  }

  const deletedSnapshot = deletedTimetable.toObject();
  const classLabel = `${deletedSnapshot.classGrade} ${deletedSnapshot.classStream}`.trim();

  try {
    await removeSupabaseFiles([deletedSnapshot.storagePath]);
  } catch (error: any) {
    try {
      await TimetableModel.create(deletedSnapshot);
    } catch (restoreError: any) {
      throw new Error(
        `Supabase deletion failed for ${classLabel}, and the timetable record could not be restored. ${restoreError.message}`,
      );
    }

    throw new Error(
      `Supabase deletion failed for ${classLabel}. The database record was restored to prevent broken links. ${error.message}`,
    );
  }

  return {
    classLabel,
  };
}
