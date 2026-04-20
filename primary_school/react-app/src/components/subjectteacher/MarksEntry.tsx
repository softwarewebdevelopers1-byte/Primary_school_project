// components/subjectteacher/MarksEntry.tsx

import React, { useState, useEffect } from "react";
import styles from "./MarksEntry.module.css";
import { Subject, Student, StudentMark } from "./types";

interface MarksEntryProps {
  selectedSubject: Subject | null;
  students: Student[];
  onBack: () => void;
}

const MarksEntry: React.FC<MarksEntryProps> = ({
  selectedSubject,
  students,
  onBack,
}) => {
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<Record<string, number>>({});
  const [assessmentType, setAssessmentType] = useState<string>("CAT1");
  const [maxMarks, setMaxMarks] = useState<number>(100);
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<string>("");

  useEffect(() => {
    if (selectedSubject) {
      const streamStudents = students.filter(
        (s) =>
          s.stream === selectedSubject.stream &&
          s.className === selectedSubject.class,
      );
      setFilteredStudents(streamStudents);
    }
  }, [selectedSubject, students]);

  if (!selectedSubject) {
    return (
      <div className={styles.noSubject}>
        <p>No subject selected. Please go back and select a subject.</p>
        <button className={styles.backBtn} onClick={onBack}>
          ← Go Back
        </button>
      </div>
    );
  }

  const handleMarkChange = (studentId: string, value: string) => {
    const numValue = value === "" ? 0 : parseInt(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= maxMarks) {
      setMarks((prev) => ({ ...prev, [studentId]: numValue }));
    }
  };

  const calculateGrade = (marks: number): string => {
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    return "E";
  };

  const calculatePercentage = (marks: number): number => {
    return (marks / maxMarks) * 100;
  };

  const handleSaveMarks = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const marksData = filteredStudents.map((student) => ({
      studentId: student.id,
      studentName: student.name,
      admissionNumber: student.admissionNumber,
      marks: marks[student.id] || null,
      percentage: marks[student.id]
        ? calculatePercentage(marks[student.id])
        : null,
      grade: marks[student.id] ? calculateGrade(marks[student.id]) : null,
    }));

    console.log("Saving marks:", {
      subject: selectedSubject.name,
      class: selectedSubject.class,
      stream: selectedSubject.stream,
      assessmentType,
      maxMarks,
      marks: marksData,
    });

    alert(
      `Marks for ${selectedSubject.name} - ${selectedSubject.class} ${selectedSubject.stream} saved successfully!`,
    );
    setSaving(false);
  };

  const handleBulkFill = () => {
    const average = prompt("Enter average mark for all students:", "50");
    if (average && !isNaN(parseInt(average))) {
      const avgNum = parseInt(average);
      const newMarks: Record<string, number> = {};
      filteredStudents.forEach((student) => {
        const variance = Math.floor(Math.random() * 20) - 10;
        let mark = avgNum + variance;
        mark = Math.max(0, Math.min(maxMarks, mark));
        newMarks[student.id] = mark;
      });
      setMarks(newMarks);
    }
  };

  const getStatistics = () => {
    const markValues = Object.values(marks).filter((m) => m !== undefined);
    if (markValues.length === 0) return null;
    const sum = markValues.reduce((a, b) => a + b, 0);
    const average = sum / markValues.length;
    const highest = Math.max(...markValues);
    const lowest = Math.min(...markValues);
    const passCount = markValues.filter(
      (m) => (m / maxMarks) * 100 >= 50,
    ).length;
    const passRate = (passCount / markValues.length) * 100;
    return { average, highest, lowest, passRate, total: markValues.length };
  };

  const stats = getStatistics();

  const getMarkColor = (marks: number) => {
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 80) return styles.excellent;
    if (percentage >= 70) return styles.good;
    if (percentage >= 60) return styles.average;
    if (percentage >= 50) return styles.pass;
    return styles.fail;
  };

  return (
    <div className={styles.marksContainer}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>
          ← Back to Subjects
        </button>
        <div className={styles.subjectInfo}>
          <h2>✏️ Marks Entry</h2>
          <p>
            {selectedSubject.name} • {selectedSubject.class}{" "}
            {selectedSubject.stream}
          </p>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <label>Assessment Type:</label>
          <select
            value={assessmentType}
            onChange={(e) => setAssessmentType(e.target.value)}
          >
            <option value="CAT1">CAT 1</option>
            <option value="CAT2">CAT 2</option>
            <option value="CAT3">CAT 3</option>
            <option value="Assignment">Assignment</option>
            <option value="Quiz">Quiz</option>
            <option value="Project">Project</option>
          </select>
        </div>
        <div className={styles.controlGroup}>
          <label>Maximum Marks:</label>
          <input
            type="number"
            value={maxMarks}
            onChange={(e) => setMaxMarks(parseInt(e.target.value) || 100)}
            min="1"
            max="500"
          />
        </div>
        <div className={styles.controlGroup}>
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search student..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className={styles.bulkFillBtn} onClick={handleBulkFill}>
          📊 Bulk Fill
        </button>
      </div>

      {stats && (
        <div className={styles.statsSummary}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Average:</span>
            <span className={styles.statValue}>
              {stats.average.toFixed(1)}%
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Highest:</span>
            <span className={styles.statValue}>{stats.highest}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Lowest:</span>
            <span className={styles.statValue}>{stats.lowest}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Pass Rate:</span>
            <span className={styles.statValue}>
              {stats.passRate.toFixed(0)}%
            </span>
          </div>
        </div>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.marksTable}>
          <thead>
            <tr>
              <th>#</th>
              <th>Admission No.</th>
              <th>Student Name</th>
              <th>Gender</th>
              <th>Marks / {maxMarks}</th>
              <th>Percentage</th>
              <th>Grade</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents
              .filter(
                (s) =>
                  s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  s.admissionNumber.includes(searchTerm),
              )
              .map((student, idx) => {
                const currentMark = marks[student.id];
                const percentage = currentMark
                  ? ((currentMark / maxMarks) * 100).toFixed(1)
                  : "-";
                const grade = currentMark ? calculateGrade(currentMark) : "-";
                const status = currentMark ? "Entered" : "Pending";

                return (
                  <tr key={student.id}>
                    <td>{idx + 1}</td>
                    <td>{student.admissionNumber}</td>
                    <td>
                      <div className={styles.studentCell}>
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className={styles.studentAvatar}
                        />
                        {student.name}
                      </div>
                    </td>
                    <td>{student.gender}</td>
                    <td>
                      <input
                        type="number"
                        className={`${styles.markInput} ${currentMark !== undefined ? getMarkColor(currentMark) : ""}`}
                        value={currentMark !== undefined ? currentMark : ""}
                        onChange={(e) =>
                          handleMarkChange(student.id, e.target.value)
                        }
                        min="0"
                        max={maxMarks}
                        placeholder="Enter marks"
                      />
                    </td>
                    <td
                      className={
                        percentage !== "-" ? getMarkColor(currentMark || 0) : ""
                      }
                    >
                      {percentage}%
                    </td>
                    <td className={styles.gradeCell}>{grade}</td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${currentMark !== undefined ? styles.entered : styles.pending}`}
                      >
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.saveBtn}
          onClick={handleSaveMarks}
          disabled={saving}
        >
          {saving ? "Saving..." : "💾 Save All Marks"}
        </button>
        <button
          className={styles.previewBtn}
          onClick={() => alert("Generating preview...")}
        >
          👁️ Preview Results
        </button>
      </div>
    </div>
  );
};

export default MarksEntry;

