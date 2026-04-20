// components/classteacher/ResultsDownload.tsx

import React, { useState } from "react";
import styles from "./ResultsDownload.module.css";
import {
  Student,
  Subject,
  StreamInfo,
  TermResult,
  PerformanceSummary,
} from "./types";

interface ResultsDownloadProps {
  students: Student[];
  subjects: Subject[];
  streamInfo: StreamInfo;
}

const ResultsDownload: React.FC<ResultsDownloadProps> = ({
  students,
  subjects,
  streamInfo,
}) => {
  const [selectedTerm, setSelectedTerm] = useState<number>(streamInfo.term);
  const [selectedYear, setSelectedYear] = useState<string>(
    streamInfo.academicYear,
  );
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel" | "csv">(
    "pdf",
  );
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate dummy results
  const generateResults = (): TermResult[] => {
    return students
      .map((student, index) => {
        const subjectsResults = subjects.map((subject) => {
          const cat1 = Math.floor(Math.random() * 40) + 40;
          const cat2 = Math.floor(Math.random() * 40) + 40;
          const cat3 = Math.floor(Math.random() * 40) + 40;
          const endTerm = Math.floor(Math.random() * 60) + 40;
          const assignments = [
            Math.floor(Math.random() * 20) + 10,
            Math.floor(Math.random() * 20) + 10,
          ];
          const total =
            cat1 +
            cat2 +
            cat3 +
            endTerm +
            assignments.reduce((a, b) => a + b, 0);
          let grade = "";
          let points = 0;

          if (total >= 80) {
            grade = "A";
            points = 12;
          } else if (total >= 75) {
            grade = "A-";
            points = 11;
          } else if (total >= 70) {
            grade = "B+";
            points = 10;
          } else if (total >= 65) {
            grade = "B";
            points = 9;
          } else if (total >= 60) {
            grade = "B-";
            points = 8;
          } else if (total >= 55) {
            grade = "C+";
            points = 7;
          } else if (total >= 50) {
            grade = "C";
            points = 6;
          } else if (total >= 45) {
            grade = "C-";
            points = 5;
          } else if (total >= 40) {
            grade = "D+";
            points = 4;
          } else if (total >= 35) {
            grade = "D";
            points = 3;
          } else if (total >= 30) {
            grade = "D-";
            points = 2;
          } else {
            grade = "E";
            points = 1;
          }

          return {
            subjectName: subject.name,
            cat1,
            cat2,
            cat3,
            endTerm,
            assignments,
            total,
            grade,
            points,
          };
        });

        const totalPoints = subjectsResults.reduce(
          (sum, s) => sum + s.points,
          0,
        );
        const totalMarks = subjectsResults.reduce((sum, s) => sum + s.total, 0);
        const average = totalMarks / subjects.length;

        let meanGrade = "";
        if (average >= 80) meanGrade = "A";
        else if (average >= 75) meanGrade = "A-";
        else if (average >= 70) meanGrade = "B+";
        else if (average >= 65) meanGrade = "B";
        else if (average >= 60) meanGrade = "B-";
        else if (average >= 55) meanGrade = "C+";
        else if (average >= 50) meanGrade = "C";
        else if (average >= 45) meanGrade = "C-";
        else if (average >= 40) meanGrade = "D+";
        else if (average >= 35) meanGrade = "D";
        else if (average >= 30) meanGrade = "D-";
        else meanGrade = "E";

        return {
          studentId: student.id,
          studentName: student.name,
          admissionNumber: student.admissionNumber,
          subjects: subjectsResults,
          totalMarks,
          average,
          meanGrade,
          totalPoints,
          position: index + 1,
          classSize: students.length,
        };
      })
      .sort((a, b) => b.totalPoints - a.totalPoints);
  };

  const results = generateResults();

  const subjectPerformance: PerformanceSummary[] = subjects.map((subject) => {
    const subjectMarks = results.map((r) => {
      const subjectData = r.subjects.find(
        (s) => s.subjectName === subject.name,
      );
      return subjectData
        ? (subjectData.total /
            (subjectData.cat1! +
              subjectData.cat2! +
              subjectData.cat3! +
              subjectData.endTerm! +
              subjectData.assignments!.reduce((a, b) => a + b, 0))) *
            100
        : 0;
    });
    const average =
      subjectMarks.reduce((a, b) => a + b, 0) / subjectMarks.length;
    const highest = Math.max(...subjectMarks);
    const lowest = Math.min(...subjectMarks);
    const passRate =
      (subjectMarks.filter((m) => m >= 50).length / subjectMarks.length) * 100;

    return {
      subject: subject.name,
      classAverage: average,
      highestScore: highest,
      lowestScore: lowest,
      passRate,
    };
  });

  const handleExport = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("Exporting results:", {
      format: exportFormat,
      term: selectedTerm,
      year: selectedYear,
      results,
    });
    alert(
      `Results exported successfully as ${exportFormat.toUpperCase()}!\n\nNote: In a real implementation, this would download the file.`,
    );
    setIsGenerating(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendToParents = () => {
    alert(
      `Sending results to parents of ${students.length} students via email/SMS...\n\nThis would trigger the notification system.`,
    );
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return styles.gradeA;
    if (grade.startsWith("B")) return styles.gradeB;
    if (grade.startsWith("C")) return styles.gradeC;
    if (grade.startsWith("D")) return styles.gradeD;
    return styles.gradeE;
  };

  return (
    <div className={styles.resultsContainer}>
      <div className={styles.header}>
        <h2>📊 Results & Reports</h2>
        <p>View, generate, and download term results for {streamInfo.name}</p>
      </div>

      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <label>Term:</label>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(parseInt(e.target.value))}
          >
            <option value={1}>Term 1</option>
            <option value={2}>Term 2</option>
            <option value={3}>Term 3</option>
          </select>
        </div>

        <div className={styles.controlGroup}>
          <label>Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>
        </div>

        <div className={styles.controlGroup}>
          <label>Export Format:</label>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as any)}
          >
            <option value="pdf">PDF Document</option>
            <option value="excel">Excel Spreadsheet</option>
            <option value="csv">CSV File</option>
          </select>
        </div>
      </div>

      <div className={styles.actionButtons}>
        <button
          className={styles.exportBtn}
          onClick={handleExport}
          disabled={isGenerating}
        >
          {isGenerating
            ? "Generating..."
            : `📥 Export as ${exportFormat.toUpperCase()}`}
        </button>
        <button className={styles.printBtn} onClick={handlePrint}>
          🖨️ Print Results
        </button>
        <button className={styles.sendBtn} onClick={handleSendToParents}>
          📧 Send to Parents
        </button>
      </div>

      <div className={styles.summaryCards}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryValue}>{students.length}</div>
          <div className={styles.summaryLabel}>Total Students</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryValue}>
            {results[0]?.studentName || "-"}
          </div>
          <div className={styles.summaryLabel}>Top Student</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryValue}>
            {results[0]?.totalPoints || 0}
          </div>
          <div className={styles.summaryLabel}>Highest Points</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryValue}>
            {results.reduce((sum, r) => sum + r.average, 0) / results.length ||
              0}
            %
          </div>
          <div className={styles.summaryLabel}>Class Average</div>
        </div>
      </div>

      <div className={styles.subjectPerformance}>
        <h3>Subject Performance Summary</h3>
        <div className={styles.performanceGrid}>
          {subjectPerformance.map((perf) => (
            <div key={perf.subject} className={styles.performanceCard}>
              <div className={styles.performanceSubject}>{perf.subject}</div>
              <div className={styles.performanceStats}>
                <div>Avg: {perf.classAverage.toFixed(1)}%</div>
                <div>High: {perf.highestScore.toFixed(1)}%</div>
                <div>Pass: {perf.passRate.toFixed(0)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.resultsTableWrapper}>
        <h3>Detailed Results</h3>
        <table className={styles.resultsTable}>
          <thead>
            <tr>
              <th>Position</th>
              <th>Admission No.</th>
              <th>Student Name</th>
              <th>Total Marks</th>
              <th>Average %</th>
              <th>Mean Grade</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, idx) => (
              <tr
                key={result.studentId}
                className={idx < 3 ? styles.topStudent : ""}
              >
                <td className={styles.position}>
                  {idx + 1 === 1 && "🥇"}
                  {idx + 1 === 2 && "🥈"}
                  {idx + 1 === 3 && "🥉"}
                  {idx + 1 > 3 && idx + 1}
                </td>
                <td>{result.admissionNumber}</td>
                <td>{result.studentName}</td>
                <td>{result.totalMarks}</td>
                <td>{result.average.toFixed(1)}%</td>
                <td
                  className={`${styles.grade} ${getGradeColor(result.meanGrade)}`}
                >
                  {result.meanGrade}
                </td>
                <td>{result.totalPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsDownload;
