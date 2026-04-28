export const subjectEnrollmentModes = ["compulsory", "elective"] as const;

export type SubjectEnrollmentMode = (typeof subjectEnrollmentModes)[number];

export interface StudentSubjectEnrollment {
  subjectId: string;
  classGrade: string;
  classStream: string;
  isActive: boolean;
  enrolledAt?: Date | string | null;
}

export interface ClassSubjectEnrollmentSetting {
  subjectId: string;
  classGrade: string;
  classStream: string;
  isOffered: boolean;
  enrollmentMode: SubjectEnrollmentMode;
  sharedSlotId: string | null;
}

export interface ElectiveEnrollmentGroup {
  sharedSlotId: string;
  subjectIds: string[];
}

export interface SubjectEnrollmentStudentRecord {
  _id?: unknown;
  class?: string | null;
  classStream?: string | null;
  enrolledSubjects?: Array<Partial<StudentSubjectEnrollment>> | null;
}

export interface SubjectEnrollmentQuery {
  subjectId: string;
  classGrade: string;
  classStream: string;
}

export const normalizeClassValue = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

export const normalizeSubjectId = (value: unknown) =>
  typeof value === "string" ? value.trim() : String(value ?? "").trim();

export const normalizeSharedSlotId = (value: unknown) => {
  const normalizedValue = typeof value === "string" ? value.trim() : "";
  return normalizedValue || null;
};

export const normalizeSubjectEnrollmentMode = (value: unknown): SubjectEnrollmentMode =>
  value === "elective" ? "elective" : "compulsory";

export const buildClassKey = (classGrade: unknown, classStream: unknown) =>
  `${normalizeClassValue(classGrade)}::${normalizeClassValue(classStream)}`;

export const buildClassSubjectKey = (
  subjectId: unknown,
  classGrade: unknown,
  classStream: unknown,
) => `${buildClassKey(classGrade, classStream)}::${normalizeSubjectId(subjectId)}`;

export const buildClassSubjectSettingMap = (settings: any[] = []) => {
  const settingsMap = new Map<string, ClassSubjectEnrollmentSetting>();

  for (const setting of settings) {
    const normalizedSubjectId = normalizeSubjectId(setting?.subjectId);
    const normalizedClassGrade = normalizeClassValue(setting?.classGrade);

    if (!normalizedSubjectId || !normalizedClassGrade) {
      continue;
    }

    const normalizedClassStream = normalizeClassValue(setting?.classStream);
    settingsMap.set(
      buildClassSubjectKey(normalizedSubjectId, normalizedClassGrade, normalizedClassStream),
      {
        subjectId: normalizedSubjectId,
        classGrade: normalizedClassGrade,
        classStream: normalizedClassStream,
        isOffered: setting?.isOffered !== false,
        enrollmentMode: normalizeSubjectEnrollmentMode(setting?.enrollmentMode),
        sharedSlotId: normalizeSharedSlotId(setting?.sharedSlotId),
      },
    );
  }

  return settingsMap;
};

export const getClassSubjectEnrollmentSetting = (
  settingsMap: Map<string, ClassSubjectEnrollmentSetting> | undefined,
  query: SubjectEnrollmentQuery,
): ClassSubjectEnrollmentSetting => {
  const normalizedSubjectId = normalizeSubjectId(query.subjectId);
  const normalizedClassGrade = normalizeClassValue(query.classGrade);
  const normalizedClassStream = normalizeClassValue(query.classStream);
  const existingSetting = settingsMap?.get(
    buildClassSubjectKey(normalizedSubjectId, normalizedClassGrade, normalizedClassStream),
  );

  if (existingSetting) {
    return existingSetting;
  }

  return {
    subjectId: normalizedSubjectId,
    classGrade: normalizedClassGrade,
    classStream: normalizedClassStream,
    isOffered: true,
    enrollmentMode: "compulsory",
    sharedSlotId: null,
  };
};

export const isStudentEnrolledInSubject = (
  student: SubjectEnrollmentStudentRecord,
  query: SubjectEnrollmentQuery,
  settingsMap?: Map<string, ClassSubjectEnrollmentSetting>,
) => {
  const normalizedClassGrade = normalizeClassValue(query.classGrade);
  const normalizedClassStream = normalizeClassValue(query.classStream);

  if (
    normalizeClassValue(student.class) !== normalizedClassGrade ||
    normalizeClassValue(student.classStream) !== normalizedClassStream
  ) {
    return false;
  }

  const setting = getClassSubjectEnrollmentSetting(settingsMap, query);
  if (!setting.isOffered) {
    return false;
  }

  if (setting.enrollmentMode === "compulsory") {
    return true;
  }

  const normalizedSubjectId = normalizeSubjectId(query.subjectId);
  const enrollments = Array.isArray(student.enrolledSubjects) ? student.enrolledSubjects : [];

  return enrollments.some((enrollment) => {
    const enrollmentClassGrade =
      normalizeClassValue(enrollment.classGrade) || normalizeClassValue(student.class);
    const enrollmentClassStream =
      normalizeClassValue(enrollment.classStream) || normalizeClassValue(student.classStream);

    return (
      normalizeSubjectId(enrollment.subjectId) === normalizedSubjectId &&
      enrollmentClassGrade === normalizedClassGrade &&
      enrollmentClassStream === normalizedClassStream &&
      enrollment.isActive !== false
    );
  });
};

export const filterStudentsForSubject = <T extends SubjectEnrollmentStudentRecord>(
  students: T[],
  query: SubjectEnrollmentQuery,
  settingsMap?: Map<string, ClassSubjectEnrollmentSetting>,
) => students.filter((student) => isStudentEnrolledInSubject(student, query, settingsMap));

export const collectStudentIdsForSubject = (
  students: SubjectEnrollmentStudentRecord[],
  query: SubjectEnrollmentQuery,
  settingsMap?: Map<string, ClassSubjectEnrollmentSetting>,
) =>
  filterStudentsForSubject(students, query, settingsMap).map((student) =>
    normalizeSubjectId((student as any)?._id),
  );

export const countSharedStudents = (leftStudentIds: string[], rightStudentIds: string[]) => {
  const leftSet = new Set(leftStudentIds);
  let overlapCount = 0;

  for (const studentId of rightStudentIds) {
    if (leftSet.has(studentId)) {
      overlapCount += 1;
    }
  }

  return overlapCount;
};

export const collectElectiveEnrollmentGroups = (
  settingsMap: Map<string, ClassSubjectEnrollmentSetting> | undefined,
  classGrade: string,
  classStream: string,
): ElectiveEnrollmentGroup[] => {
  const grouped = new Map<string, string[]>();

  for (const setting of settingsMap?.values() || []) {
    if (
      normalizeClassValue(setting.classGrade) !== normalizeClassValue(classGrade) ||
      normalizeClassValue(setting.classStream) !== normalizeClassValue(classStream) ||
      setting.isOffered === false ||
      setting.enrollmentMode !== "elective" ||
      !setting.sharedSlotId
    ) {
      continue;
    }

    const sharedSlotId = normalizeSharedSlotId(setting.sharedSlotId);
    if (!sharedSlotId) {
      continue;
    }

    const groupSubjectIds = grouped.get(sharedSlotId) || [];
    groupSubjectIds.push(normalizeSubjectId(setting.subjectId));
    grouped.set(sharedSlotId, groupSubjectIds);
  }

  return Array.from(grouped.entries())
    .map(([sharedSlotId, subjectIds]) => ({
      sharedSlotId,
      subjectIds: Array.from(new Set(subjectIds.filter(Boolean))),
    }))
    .filter((group) => group.subjectIds.length > 1);
};
