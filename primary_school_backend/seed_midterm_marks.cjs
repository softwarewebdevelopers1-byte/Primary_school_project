const mongoose = require("mongoose");
require("dotenv").config();

const normalizeClass = (value) => (typeof value === "string" ? value.trim() : "");
const normalizeId = (value) => String(value ?? "").trim();
const settingKey = (subjectId, classGrade, classStream) =>
  `${normalizeClass(classGrade)}::${normalizeClass(classStream)}::${normalizeId(subjectId)}`;

const computeFinalScore = (cat1, cat2, exam) =>
  Math.round(((cat1 + cat2 + exam) / 180) * 100);

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/primary_school");
  const db = mongoose.connection.db;

  const term = 1;
  const year = 2026;
  const examType = "midterm";

  const [students, assignments, subjects, settings] = await Promise.all([
    db
      .collection("users")
      .find({
        __t: "student",
        status: "active",
        class: { $nin: [null, ""] },
      })
      .project({
        _id: 1,
        studentsName: 1,
        ADM: 1,
        class: 1,
        classStream: 1,
        enrolledSubjects: 1,
      })
      .toArray(),
    db.collection("assignments").find({}).toArray(),
    db.collection("subjects").find({}).project({ _id: 1, name: 1 }).toArray(),
    db.collection("classsubjectsettings").find({}).toArray(),
  ]);

  const settingsMap = new Map(
    settings.map((setting) => [
      settingKey(setting.subjectId, setting.classGrade, setting.classStream),
      {
        isOffered: setting.isOffered !== false,
        enrollmentMode: setting.enrollmentMode === "elective" ? "elective" : "compulsory",
      },
    ]),
  );
  const subjectNames = new Map(subjects.map((subject) => [normalizeId(subject._id), subject.name]));

  const operations = [];
  const coverage = new Map();

  for (const assignment of assignments) {
    const subjectId = normalizeId(assignment.subjectId);
    const classGrade = normalizeClass(assignment.classGrade);
    const classStream = normalizeClass(assignment.classStream);
    if (!subjectId || !classGrade) continue;

    const setting = settingsMap.get(settingKey(subjectId, classGrade, classStream)) || {
      isOffered: true,
      enrollmentMode: "compulsory",
    };
    if (!setting.isOffered) continue;

    const eligibleStudents = students.filter((student) => {
      if (
        normalizeClass(student.class) !== classGrade ||
        normalizeClass(student.classStream) !== classStream
      ) {
        return false;
      }

      if (setting.enrollmentMode === "compulsory") return true;

      const enrollments = Array.isArray(student.enrolledSubjects) ? student.enrolledSubjects : [];
      return enrollments.some((enrollment) => {
        const enrollmentClassGrade =
          normalizeClass(enrollment.classGrade) || normalizeClass(student.class);
        const enrollmentClassStream =
          normalizeClass(enrollment.classStream) || normalizeClass(student.classStream);

        return (
          normalizeId(enrollment.subjectId) === subjectId &&
          enrollmentClassGrade === classGrade &&
          enrollmentClassStream === classStream &&
          enrollment.isActive !== false
        );
      });
    });

    for (let index = 0; index < eligibleStudents.length; index += 1) {
      const student = eligibleStudents[index];
      const base =
        Array.from(`${normalizeId(student._id)}${subjectId}${classGrade}${classStream}`).reduce(
          (sum, char) => sum + char.charCodeAt(0),
          0,
        ) + index;
      const cat1 = 22 + (base % 17);
      const cat2 = 21 + ((base * 3) % 18);
      const exam = 52 + ((base * 7) % 45);
      const finalScore = computeFinalScore(cat1, cat2, exam);

      operations.push({
        updateOne: {
          filter: {
            studentId: student._id,
            subjectId: assignment.subjectId,
            classGrade,
            classStream,
            term,
            year,
            examType,
          },
          update: {
            $set: {
              cat1,
              cat2,
              cat3: null,
              cat4: null,
              cat5: null,
              cat1Max: 40,
              cat2Max: 40,
              cat3Max: 40,
              cat4Max: 40,
              cat5Max: 40,
              exam,
              examMax: 100,
              finalScore,
              updatedAt: new Date(),
            },
            $setOnInsert: {
              createdAt: new Date(),
            },
          },
          upsert: true,
        },
      });

      const coverageKey = `${classGrade} ${classStream} / ${
        subjectNames.get(subjectId) || subjectId
      }`;
      coverage.set(coverageKey, (coverage.get(coverageKey) || 0) + 1);
    }
  }

  const result = operations.length
    ? await db.collection("marks").bulkWrite(operations, { ordered: false })
    : { upsertedCount: 0, modifiedCount: 0, matchedCount: 0 };

  const cycles = await db
    .collection("marks")
    .aggregate([
      { $match: { term, year, examType } },
      {
        $group: {
          _id: { classGrade: "$classGrade", classStream: "$classStream" },
          markCount: { $sum: 1 },
          subjectIds: { $addToSet: { $toString: "$subjectId" } },
        },
      },
      { $sort: { "_id.classGrade": 1, "_id.classStream": 1 } },
    ])
    .toArray();

  console.log(
    JSON.stringify(
      {
        cycle: { term, year, examType },
        generatedOperations: operations.length,
        upsertedCount: result.upsertedCount || 0,
        modifiedCount: result.modifiedCount || 0,
        matchedCount: result.matchedCount || 0,
        coverage: Array.from(coverage.entries()).map(([assignment, studentCount]) => ({
          assignment,
          studentCount,
        })),
        cycles,
      },
      null,
      2,
    ),
  );

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
