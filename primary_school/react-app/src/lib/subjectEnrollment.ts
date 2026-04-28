export type SubjectEnrollmentMode = "compulsory" | "elective";

export interface StudentSubjectEnrollment {
  subjectId: string;
  classGrade: string;
  classStream: string;
  isActive: boolean;
  enrolledAt?: string | null;
}

export interface ClassSubjectSettingLike {
  subjectId: string;
  classGrade: string;
  classStream: string;
  isOffered: boolean;
  enrollmentMode?: SubjectEnrollmentMode;
  sharedSlotId?: string | null;
}

export const normalizeClassValue = (value: string | null | undefined) =>
  (value || "").trim();

export const buildClassId = (grade: string, stream?: string) =>
  `${normalizeClassValue(grade)}::${normalizeClassValue(stream)}`;

export const getClassSubjectSetting = <T extends ClassSubjectSettingLike>(
  settings: T[],
  subjectId: string,
  classGrade: string,
  classStream?: string,
) => {
  const normalizedGrade = normalizeClassValue(classGrade);
  const normalizedStream = normalizeClassValue(classStream);

  const existingSetting = settings.find(
    (setting) =>
      setting.subjectId === subjectId &&
      normalizeClassValue(setting.classGrade) === normalizedGrade &&
      normalizeClassValue(setting.classStream) === normalizedStream,
  );

  if (existingSetting) {
    return {
      ...existingSetting,
      isOffered: existingSetting.isOffered !== false,
      enrollmentMode: existingSetting.enrollmentMode || "compulsory",
      sharedSlotId: existingSetting.sharedSlotId || null,
    };
  }

  return {
    subjectId,
    classGrade: normalizedGrade,
    classStream: normalizedStream,
    isOffered: true,
    enrollmentMode: "compulsory" as SubjectEnrollmentMode,
    sharedSlotId: null,
  };
};

export const getElectiveSubjectIdsForClass = <T extends ClassSubjectSettingLike>(
  settings: T[],
  classGrade: string,
  classStream?: string,
) =>
  settings
    .filter(
      (setting) =>
        normalizeClassValue(setting.classGrade) === normalizeClassValue(classGrade) &&
        normalizeClassValue(setting.classStream) === normalizeClassValue(classStream) &&
        setting.isOffered !== false &&
        (setting.enrollmentMode || "compulsory") === "elective",
    )
    .map((setting) => setting.subjectId);

export const buildEnrolledSubjectsPayload = (
  subjectIds: string[],
  classGrade: string,
  classStream?: string,
): StudentSubjectEnrollment[] =>
  Array.from(new Set(subjectIds))
    .filter(Boolean)
    .map((subjectId) => ({
      subjectId,
      classGrade: normalizeClassValue(classGrade),
      classStream: normalizeClassValue(classStream),
      isActive: true,
    }));

export const formatSubjectOfferingTag = (
  enrollmentMode?: SubjectEnrollmentMode,
  sharedSlotId?: string | null,
) => {
  const mode = enrollmentMode || "compulsory";
  if (mode === "elective" && sharedSlotId) {
    return `Elective | Block ${sharedSlotId}`;
  }

  return mode === "elective" ? "Elective" : "Compulsory";
};
