// components/subjectteacher/StudentProgress.tsx

import React, { useState } from "react";
import styles from "./StudentProgress.module.css";
import { Subject, Student } from "./types";

interface StudentProgressProps {
  subjects: Subject[];
  students: Student[];
}

const StudentProgress: React.FC<StudentProgressProps> = ({
  subjects,
  students,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>(
    subjects[0]?.id || "",
  );
  const [selectedClass, setSelectedClass] = useState<string>("all");

  const filteredSubjects =
    selectedSubject === "all"
      ? subjects
      : subjects.filter((s) => s.id === selectedSubject);

  const filteredStudents = students.filter(
    (s) => selectedClass === "all" || s.stream === selectedClass,
  );

  const classes = ["all", ...new Set(students.map((s) => s.stream))];

  // Dummy performance data
  const getStudentPerformance = (studentId: string) => {
    return {
      average: Math.floor(Math.random() * 40) + 50,
      trend: Math.random() > 0.5 ? "up" : "down",
      assignments: Math.floor(Math.random() * 5) + 1,
      attendance: Math.floor(Math.random() * 30) + 70,
    };
  };

  return (
    <div className={styles.progressContainer}>
      <div className={styles.header}>
        <h2>📈 Student Progress</h2>
        <p>Track and monitor student performance across subjects</p>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>Subject:</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="all">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name} - {subject.class} {subject.stream}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label>Stream:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            {classes.map((className) => (
              <option key={className} value={className}>
                {className === "all" ? "All Streams" : className}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.statsSummary}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryValue}>78.5%</div>
          <div className={styles.summaryLabel}>Class Average</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryValue}>85%</div>
          <div className={styles.summaryLabel}>Pass Rate</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryValue}>12</div>
          <div className={styles.summaryLabel}>Top Performers</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryValue}>5</div>
          <div className={styles.summaryLabel}>Need Improvement</div>
        </div>
      </div>

      <div className={styles.chartSection}>
        <h3>Performance Distribution</h3>
        <div className={styles.distributionBars}>
          <div className={styles.distributionItem}>
            <span className={styles.gradeLabel}>A (80-100%)</span>
            <div className={styles.barContainer}>
              <div
                className={styles.bar}
                style={{ width: "25%", background: "#10b981" }}
              />
            </div>
            <span className={styles.percentage}>25%</span>
          </div>
          <div className={styles.distributionItem}>
            <span className={styles.gradeLabel}>B (70-79%)</span>
            <div className={styles.barContainer}>
              <div
                className={styles.bar}
                style={{ width: "30%", background: "#3b82f6" }}
              />
            </div>
            <span className={styles.percentage}>30%</span>
          </div>
          <div className={styles.distributionItem}>
            <span className={styles.gradeLabel}>C (50-69%)</span>
            <div className={styles.barContainer}>
              <div
                className={styles.bar}
                style={{ width: "28%", background: "#f59e0b" }}
              />
            </div>
            <span className={styles.percentage}>28%</span>
          </div>
          <div className={styles.distributionItem}>
            <span className={styles.gradeLabel}>D/E (Below 50%)</span>
            <div className={styles.barContainer}>
              <div
                className={styles.bar}
                style={{ width: "17%", background: "#ef4444" }}
              />
            </div>
            <span className={styles.percentage}>17%</span>
          </div>
        </div>
      </div>

      <div className={styles.studentsTable}>
        <h3>Student Performance Details</h3>
        <div className={styles.tableWrapper}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Student Name</th>
                <th>Stream</th>
                <th>Average Score</th>
                <th>Trend</th>
                <th>Assignments</th>
                <th>Attendance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, idx) => {
                const performance = getStudentPerformance(student.id);
                return (
                  <tr key={student.id}>
                    <td>{idx + 1}</td>
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
                    <td>{student.stream}</td>
                    <td
                      className={
                        performance.average >= 70
                          ? styles.highScore
                          : performance.average >= 50
                            ? styles.mediumScore
                            : styles.lowScore
                      }
                    >
                      {performance.average}%
                    </td>
                    <td>
                      {performance.trend === "up"
                        ? "📈 Improving"
                        : "📉 Declining"}
                    </td>
                    <td>{performance.assignments}/5</td>
                    <td>
                      <div className={styles.attendanceBar}>
                        <div
                          className={styles.attendanceFill}
                          style={{ width: `${performance.attendance}%` }}
                        />
                        <span>{performance.attendance}%</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${performance.average >= 70 ? styles.excellent : performance.average >= 50 ? styles.good : styles.atRisk}`}
                      >
                        {performance.average >= 70
                          ? "Excellent"
                          : performance.average >= 50
                            ? "Good"
                            : "At Risk"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentProgress;
