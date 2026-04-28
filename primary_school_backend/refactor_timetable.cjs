const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/utils/timetable.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix Groq model
content = content.replace(
  'model: "openai/gpt-oss-20b",\n    temperature: 1,',
  'model: "llama3-70b-8192",\n    temperature: 0.7,'
);

// 2. Include all classes in buildGenerationContext
const classMapStr = `  const classMap = new Map<
    string,
    {
      classGrade: string;
      classStream: string;
      studentCount: number;
      classTeacherId: string | null;
      classTeacherName: string | null;
      subjects: ClassSubjectContext[];
    }
  >();`;

const newClassMapStr = `  const classMap = new Map<
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
    const [classGrade, classStream] = classKey.split("::");
    const classTeacher = classTeacherByClass.get(classKey);
    classMap.set(classKey, {
      classGrade,
      classStream,
      studentCount: studentCountByClass.get(classKey) || 0,
      classTeacherId: classTeacher?.id || null,
      classTeacherName: classTeacher?.name || null,
      subjects: [],
    });
  }`;

content = content.replace(classMapStr, newClassMapStr);

// 3. Rewrite generateFallbackPlan
const oldGenerateFallbackStart = 'const generateFallbackPlan = (\n  classes: ClassTimetableContext[],\n  subjectsPerDay: number,\n): GeneratedSchoolTimetablePlan => {';
const generateFallbackEndIndex = content.indexOf('const normalizeGroqPlan = (');

if (generateFallbackEndIndex === -1) {
    console.error("Could not find the end of generateFallbackPlan");
    process.exit(1);
}

const oldGenerateFallback = content.substring(content.indexOf(oldGenerateFallbackStart), generateFallbackEndIndex);

const newGenerateFallback = `const generateFallbackPlan = (
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

      currentClass.subjects.forEach((subject, index) => {
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

      for (let classIndex = 0; classIndex < classes.length; classIndex += 1) {
        const currentClass = classes[(classIndex + dayIndex + slotIndex) % classes.length];
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

        viableCandidates.sort((left, right) => {
          const leftUrgency = left.remaining / Math.max(1, remainingDays);
          const rightUrgency = right.remaining / Math.max(1, remainingDays);
          if (Math.abs(rightUrgency - leftUrgency) > 0.01) return rightUrgency - leftUrgency;
          if (left.dayCount !== right.dayCount) return left.dayCount - right.dayCount;
          return left.subjectName.localeCompare(right.subjectName);
        });

        const selectedSubject = viableCandidates[0];

        if (selectedSubject) {
          classPlans.get(classKey)?.lessonPlan[day].push({
            subjectId: selectedSubject.subjectId,
            subjectName: selectedSubject.subjectName,
            teacherId: selectedSubject.teacherId,
            teacherName: selectedSubject.teacherName,
          });
          teacherBooked.add(selectedSubject.teacherId);
          previousSubjectByClass.set(classKey, selectedSubject.subjectId);
          subjectCountsForDay.set(selectedSubject.subjectId, (subjectCountsForDay.get(selectedSubject.subjectId) || 0) + 1);
          remainingByClass.get(classKey)?.set(selectedSubject.subjectId, selectedSubject.remaining - 1);
        } else {
          classPlans.get(classKey)?.lessonPlan[day].push({
            subjectId: null,
            subjectName: "Independent Study",
            teacherId: null,
            teacherName: "Department Supervision",
          });
          previousSubjectByClass.set(classKey, null);
        }
      }
    }
  }

  return {
    generationMode: "balanced-fallback",
    summary:
      "Balanced fallback scheduler generated the timetable using equal weekly distribution, strict teacher conflict checks, and realistic daily subject spacing.",
    classes: Array.from(classPlans.values()),
  };
};

`;

content = content.replace(oldGenerateFallback, newGenerateFallback);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Refactoring complete.');
