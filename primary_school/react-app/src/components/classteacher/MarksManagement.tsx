// components/classteacher/MarksManagement.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { C } from "./shared/constants";
import { api } from "../../lib/api";
import { buildElectiveSubjectGroups } from "../../lib/subjectEnrollment";
import { MarksEntry } from "../shared/MarksEntry";
import { avatar } from "../../lib/dashboardHelpers";
import { MarksData, Subject, Student } from "../subjectteacher/types";

const hasAnyStoredValue = (marks: {
  cat1: number | string | null;
  cat2: number | string | null;
  cat3: number | string | null;
  cat4: number | string | null;
  cat5: number | string | null;
  exam: number | string | null;
  finalScore: number | string | null;
}) =>
  [marks.cat1, marks.cat2, marks.cat3, marks.cat4, marks.cat5, marks.exam, marks.finalScore].some(
    (value) => value !== null && value !== "",
  );

const createEmptyMarks = () => ({
  cat1: null,
  cat2: null,
  cat3: null,
  cat4: null,
  cat5: null,
  cat1Max: 40,
  cat2Max: 40,
  cat3Max: 40,
  cat4Max: 40,
  cat5Max: 40,
  exam: null,
  examMax: 100,
  finalScore: null,
});

const normalizeValue = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const getRawSubjectId = (subject: any) => String(subject?.id || subject?._id || "").trim();

const getStudentAdmissionNumber = (student: any) =>
  student?.admissionNumber || student?.admissionNo || student?.ADM || student?.adm || "";

const isActiveStudent = (student: any) =>
  String(student?.status || "Active").toLowerCase() === "active";

interface DisplaySubjectOption extends Subject {
  actualSubjects: Array<{ id: string; name: string }>;
}

interface MarksManagementProps {
  students: any[];
  subjects: any[];
  onRefresh?: () => void;
  user: any;
}

const resolveStudentSubjectSelection = (
  student: any,
  subject: DisplaySubjectOption,
  classGrade: string,
  classStream: string,
) => {
  if ((subject.enrollmentMode || "compulsory") === "compulsory") {
    return subject.actualSubjects[0]?.id || null;
  }

  const activeEnrollment = (student?.enrolledSubjects || []).find((entry: any) => {
    const enrollmentClassGrade = normalizeValue(entry?.classGrade);
    const enrollmentClassStream = normalizeValue(entry?.classStream);

    return (
      entry?.isActive !== false &&
      subject.actualSubjects.some((actualSubject) => actualSubject.id === String(entry?.subjectId || "").trim()) &&
      enrollmentClassGrade === normalizeValue(classGrade) &&
      enrollmentClassStream === normalizeValue(classStream)
    );
  });

  if (activeEnrollment) {
    return String(activeEnrollment.subjectId).trim();
  }

  const legacyEnrollment = (student?.enrolledSubjects || []).find((entry: any) => {
    return (
      entry?.isActive !== false &&
      subject.actualSubjects.some((actualSubject) => actualSubject.id === String(entry?.subjectId || "").trim())
    );
  });

  return legacyEnrollment ? String(legacyEnrollment.subjectId).trim() : null;
};

export const MarksManagement: React.FC<MarksManagementProps> = ({
  students: rosterStudents,
  subjects,
  onRefresh,
  user,
}) => {
  const [activeSubjectId, setActiveSubjectId] = useState("");
  const [marksData, setMarksData] = useState<MarksData>({});
  const [subjectStudents, setSubjectStudents] = useState<Record<string, Student[]>>({});
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [term, setTerm] = useState<number>(user?.term || 1);
  const [year, setYear] = useState<number>(user?.year || 2024);
  const [examType, setExamType] = useState<string>(user?.examType || "opener");

  const displaySubjects = useMemo<DisplaySubjectOption[]>(() => {
    const activeSubjects = subjects
      .map((subject) => ({
        ...subject,
        id: getRawSubjectId(subject),
        enrollmentMode: subject.enrollmentMode || "compulsory",
        sharedSlotId: subject.sharedSlotId || null,
      }))
      .filter((subject) => subject.id && subject.isOffered !== false);

    const electiveGroups = buildElectiveSubjectGroups(activeSubjects);
    const electiveGroupsByKey = new Map(electiveGroups.map((group) => [group.key, group]));
    const seenKeys = new Set<string>();

    const buildOption = (subject: {
      id: string;
      name: string;
      displayName?: string;
      enrollmentMode: "compulsory" | "elective";
      sharedSlotId?: string | null;
      groupedSubjectIds?: string[];
      groupedSubjectNames?: string[];
      isLinkedElectiveGroup?: boolean;
      actualSubjects: Array<{ id: string; name: string }>;
    }): DisplaySubjectOption => ({
      id: subject.id,
      name: subject.name,
      displayName: subject.displayName || subject.name,
      grade: `${user.classGrade} ${user.classStream}`.trim(),
      subjectId: subject.actualSubjects[0]?.id || subject.id,
      classGrade: user.classGrade,
      classStream: user.classStream,
      students: 0,
      avg: 0,
      pushed: false,
      term: 1,
      year,
      lastAssess: "N/A",
      enrollmentMode: subject.enrollmentMode,
      sharedSlotId: subject.sharedSlotId || null,
      groupedSubjectIds: subject.groupedSubjectIds,
      groupedSubjectNames: subject.groupedSubjectNames,
      isLinkedElectiveGroup: subject.isLinkedElectiveGroup,
      actualSubjects: subject.actualSubjects,
    });

    const result: DisplaySubjectOption[] = [];

    activeSubjects.forEach((subject) => {
      if ((subject.enrollmentMode || "compulsory") !== "elective") {
        result.push(buildOption({
          id: subject.id,
          name: subject.name,
          enrollmentMode: "compulsory",
          sharedSlotId: subject.sharedSlotId || null,
          actualSubjects: [{ id: subject.id, name: subject.name }],
        }));
        return;
      }

      const normalizedSharedSlotId = normalizeValue(subject.sharedSlotId);
      const groupKey = normalizedSharedSlotId || `subject:${subject.id}`;
      if (seenKeys.has(groupKey)) {
        return;
      }
      seenKeys.add(groupKey);

      const group = electiveGroupsByKey.get(groupKey);
      if (!group || !group.isLinkedGroup) {
        result.push(buildOption({
          id: subject.id,
          name: subject.name,
          enrollmentMode: "elective",
          sharedSlotId: subject.sharedSlotId || null,
          actualSubjects: [{ id: subject.id, name: subject.name }],
        }));
        return;
      }

      const groupSubjectNames = group.subjects.map((groupSubject) => groupSubject.name);
      result.push(buildOption({
        id: `elective-group:${group.key}`,
        name: group.label,
        displayName: group.label,
        enrollmentMode: "elective",
        sharedSlotId: group.sharedSlotId,
        groupedSubjectIds: group.subjects.map((groupSubject) => groupSubject.id),
        groupedSubjectNames: groupSubjectNames,
        isLinkedElectiveGroup: true,
        actualSubjects: group.subjects.map((groupSubject) => ({
          id: groupSubject.id,
          name: groupSubject.name,
        })),
      }));
    });

    return result;
  }, [subjects, user.classGrade, user.classStream, year]);

  const countEligibleStudents = useCallback((subject: DisplaySubjectOption) => {
    return rosterStudents.filter((student) =>
      isActiveStudent(student) &&
      Boolean(resolveStudentSubjectSelection(student, subject, user.classGrade, user.classStream)),
    ).length;
  }, [rosterStudents, user.classGrade, user.classStream]);

  useEffect(() => {
    if (user) {
      setTerm(user.term || 1);
      setYear(user.year || 2024);
      setExamType(user.examType || "opener");
    }
  }, [user]);

  useEffect(() => {
    if (displaySubjects.length > 0 && !displaySubjects.some((subject) => subject.id === activeSubjectId)) {
      setActiveSubjectId(displaySubjects[0].id);
    }
  }, [displaySubjects, activeSubjectId]);

  const loadDetailedMarks = useCallback(async () => {
    const currentSubject = displaySubjects.find((subject) => subject.id === activeSubjectId);
    if (!currentSubject) return;

    try {
      const subjectPayloads = await Promise.all(
        currentSubject.actualSubjects.map(async (actualSubject) => ({
          subjectId: actualSubject.id,
          data: await api.get("/marks", {
            subjectId: actualSubject.id,
            classGrade: user.classGrade,
            classStream: user.classStream,
            term,
            year,
            examType,
          }),
        })),
      );

      const marksByActualSubject = new Map<string, Map<string, any>>();
      subjectPayloads.forEach(({ subjectId, data }) => {
        marksByActualSubject.set(
          subjectId,
          new Map(
            (data as any[]).map((item) => [item.studentId.toString(), item]),
          ),
        );
      });

      const relevantStudents: Student[] = [];

      rosterStudents.filter(isActiveStudent).forEach((student) => {
        const actualSubjectId = resolveStudentSubjectSelection(
          student,
          currentSubject,
          user.classGrade,
          user.classStream,
        );

        if (!actualSubjectId) {
          return;
        }

        const subjectRecord = currentSubject.actualSubjects.find(
          (actualSubject) => actualSubject.id === actualSubjectId,
        );
        const markRecord = marksByActualSubject.get(actualSubjectId)?.get(String(student.id));

        relevantStudents.push({
          id: String(student.id),
          name: student.name,
          adm: getStudentAdmissionNumber(student),
          gender: student.gender || "N/A",
          enrolledSubjects: student.enrolledSubjects || [],
          enrollmentSubjectId: actualSubjectId,
          enrollmentSubjectName:
            currentSubject.actualSubjects.length > 1 ? subjectRecord?.name || null : null,
          marks: markRecord?.marks || createEmptyMarks(),
          pushed: false,
        });
      });

      setMarksData((prev) => ({
        ...prev,
        [activeSubjectId]: relevantStudents.reduce((acc, student) => {
          acc[student.id] = student.marks;
          return acc;
        }, {} as MarksData[string]),
      }));
      setSubjectStudents((prev) => ({
        ...prev,
        [activeSubjectId]: relevantStudents,
      }));
    } catch (err) {
      setSubjectStudents((prev) => ({
        ...prev,
        [activeSubjectId]: [],
      }));
    }
  }, [
    activeSubjectId,
    displaySubjects,
    examType,
    rosterStudents,
    term,
    user.classGrade,
    user.classStream,
    year,
  ]);

  useEffect(() => {
    setMarksData({});
    setSubjectStudents({});
  }, [term, year, examType]);

  useEffect(() => {
    if (activeSubjectId) {
      void loadDetailedMarks();
    }
  }, [activeSubjectId, loadDetailedMarks, term, year, examType]);

  const handleMarkUpdate = (subjectId: string, studentId: string, key: string, value: string) => {
    setMarksData((prev) => {
      const updatedSubjectMarks = { ...(prev[subjectId] || {}) };
      const updatedStudentMarks = {
        ...(updatedSubjectMarks[studentId] || createEmptyMarks()),
      };

      let n: string | number | null = value;
      if (n === "") {
        n = null;
      } else {
        const num = Number(n);
        if (!Number.isNaN(num)) {
          const maxKey = `${key}Max`;
          const max = key === "finalScore" ? 100 : (updatedStudentMarks as any)[maxKey] || (key === "exam" ? 100 : 40);
          if (num > max) {
            n = max;
          } else if (num < 0) {
            n = 0;
          }
        } else {
          n = null;
        }
      }

      (updatedStudentMarks as any)[key] = n;
      updatedSubjectMarks[studentId] = updatedStudentMarks;

      return {
        ...prev,
        [subjectId]: updatedSubjectMarks,
      };
    });
  };

  const handleConfigUpdate = (subjectId: string, key: string, value: number | string | null) => {
    setMarksData((prev) => {
      const newData = { ...prev };
      if (!newData[subjectId]) return prev;

      const updatedSubjectMarks = { ...newData[subjectId] };
      Object.keys(updatedSubjectMarks).forEach((studentId) => {
        updatedSubjectMarks[studentId] = {
          ...updatedSubjectMarks[studentId],
          [key]: value,
        };
      });
      newData[subjectId] = updatedSubjectMarks;
      return newData;
    });
  };

  const handleRemoveCat = (subjectId: string, catIndex: number) => {
    setMarksData((prev) => {
      const updatedSubjectMarks = { ...(prev[subjectId] || {}) };
      Object.keys(updatedSubjectMarks).forEach((studentId) => {
        updatedSubjectMarks[studentId] = {
          ...updatedSubjectMarks[studentId],
          [`cat${catIndex}`]: null,
          [`cat${catIndex}Max`]: 40,
        };
      });
      return {
        ...prev,
        [subjectId]: updatedSubjectMarks,
      };
    });
  };

  const handleSaveMarks = async (subjectId: string, catConfigs?: any) => {
    const currentSubject = displaySubjects.find((subject) => subject.id === subjectId);
    if (!currentSubject) return;

    const subjectMarks = marksData[subjectId];
    if (!subjectMarks) return;

    const studentRows = subjectStudents[subjectId] || [];
    const studentLookup = new Map(studentRows.map((student) => [student.id, student]));
    const marksByActualSubject = new Map<string, Array<{ studentId: string } & Student["marks"]>>();
    const summaryData: Array<{ studentId: string; subjectId: string; finalScore: number | string | null }> = [];
    const missingSelections: string[] = [];

    Object.entries(subjectMarks).forEach(([studentId, marks]) => {
      const student = studentLookup.get(studentId);
      const actualSubjectId =
        student?.enrollmentSubjectId ||
        (currentSubject.actualSubjects.length === 1 ? currentSubject.actualSubjects[0].id : null);

      if (!actualSubjectId) {
        missingSelections.push(student?.name || studentId);
        return;
      }

      const currentSubjectMarks = marksByActualSubject.get(actualSubjectId) || [];
      currentSubjectMarks.push({
        studentId,
        ...marks,
      });
      marksByActualSubject.set(actualSubjectId, currentSubjectMarks);

      if (hasAnyStoredValue(marks)) {
        summaryData.push({
          studentId,
          subjectId: actualSubjectId,
          finalScore: marks.finalScore,
        });
      }
    });

    if (missingSelections.length > 0) {
      setMsg({
        text: "Some learners are missing an elective subject selection. Update the student enrollment first.",
        type: "error",
      });
      return;
    }

    setMsg(null);
    try {
      await Promise.all(
        Array.from(marksByActualSubject.entries()).map(([actualSubjectId, actualSubjectMarks]) =>
          api.post("/marks/save", {
            subjectId: actualSubjectId,
            classGrade: user.classGrade,
            classStream: user.classStream,
            term,
            year,
            examType,
            marksData: actualSubjectMarks,
            catConfigs,
          }),
        ),
      );

      if (summaryData.length > 0) {
        await api.post("/marks/summary-save", {
          classGrade: user.classGrade,
          classStream: user.classStream,
          term,
          year,
          examType,
          marksData: summaryData,
        });
      }

      setMsg({ text: "Marks saved successfully!", type: "success" });
      if (onRefresh) onRefresh();
      await loadDetailedMarks();
    } catch (err: any) {
      setMsg({ text: "Failed to save: " + err.message, type: "error" });
    }
  };

  const activeSubjectStudents = subjectStudents[activeSubjectId] || [];
  const mappedStudents: Student[] = activeSubjectStudents.map((student) => {
    const sid = String(student.id);
    const studentMarks = (marksData[activeSubjectId] && marksData[activeSubjectId][sid]) || createEmptyMarks();

    return {
      ...student,
      marks: studentMarks,
      pushed: false,
    };
  });

  const mappedSubjects: Subject[] = displaySubjects.map((subject) => ({
    ...subject,
    students: subjectStudents[subject.id]?.length ?? countEligibleStudents(subject),
    avg: 0,
    pushed: false,
    term: 1,
    lastAssess: "N/A",
  }));

  if (displaySubjects.length === 0) {
    return <div style={{ padding: 40, textAlign: "center" }}>No subjects found.</div>;
  }

  return (
    <div className="ct-anim">
      {msg && (
        <div
          style={{
            padding: "10px 20px",
            marginBottom: 15,
            borderRadius: 8,
            background: msg.type === "success" ? C.greenLight : "#fdeaea",
            color: msg.type === "success" ? C.successText : C.dangerText,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {msg.text}
        </div>
      )}

      <MarksEntry
        mode="class"
        subjects={mappedSubjects}
        activeSubjectId={activeSubjectId}
        students={mappedStudents}
        marksData={marksData}
        onSubjectChange={setActiveSubjectId}
        onMarkUpdate={handleMarkUpdate}
        onSaveMarks={handleSaveMarks}
        onConfigUpdate={handleConfigUpdate}
        onRemoveCat={handleRemoveCat}
        avatar={avatar}
        term={term}
        year={year}
        examType={examType}
        onTermChange={setTerm}
        onExamTypeChange={setExamType}
      />
    </div>
  );
};
