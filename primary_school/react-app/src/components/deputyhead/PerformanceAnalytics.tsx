// components/deputyhead/PerformanceAnalytics.tsx

import React, { useState } from "react";
import styles from "./PerformanceAnalytics.module.css";
import { UserRole } from "./types";

interface PerformanceAnalyticsProps {
  userRole: UserRole;
}

const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({
  userRole,
}) => {
  const [selectedTerm, setSelectedTerm] = useState<string>("term1");
  const [selectedYear, setSelectedYear] = useState<string>("2024");

  // Dummy performance data
  const subjectPerformance = [
    {
      subject: "Mathematics",
      scores: [72, 75, 78, 74, 76],
      average: 75,
      trend: "up",
      color: "#4F46E5",
    },
    {
      subject: "English",
      scores: [78, 76, 80, 79, 82],
      average: 79,
      trend: "up",
      color: "#10B981",
    },
    {
      subject: "Kiswahili",
      scores: [74, 73, 75, 74, 76],
      average: 74.4,
      trend: "stable",
      color: "#F59E0B",
    },
    {
      subject: "Science",
      scores: [71, 70, 69, 72, 71],
      average: 70.6,
      trend: "down",
      color: "#EF4444",
    },
    {
      subject: "Social Studies",
      scores: [76, 77, 78, 80, 79],
      average: 78,
      trend: "up",
      color: "#8B5CF6",
    },
  ];

  const classRankings = [
    {
      rank: 1,
      class: "Grade 7A",
      average: 82.5,
      topStudent: "Emma Mwangi",
      performance: "Excellent",
    },
    {
      rank: 2,
      class: "Grade 8A",
      average: 79.3,
      topStudent: "Brian Kipchoge",
      performance: "Good",
    },
    {
      rank: 3,
      class: "Grade 7B",
      average: 77.8,
      topStudent: "James Otieno",
      performance: "Good",
    },
    {
      rank: 4,
      class: "Grade 8B",
      average: 74.2,
      topStudent: "Cynthia Achieng",
      performance: "Average",
    },
    {
      rank: 5,
      class: "Grade 7C",
      average: 71.6,
      topStudent: "Aisha Hassan",
      performance: "Average",
    },
  ];

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return "📈";
    if (trend === "down") return "📉";
    return "➡️";
  };

  return (
    <div className={styles.analyticsContainer}>
      <div className={styles.header}>
        <h2>📊 Performance Analytics</h2>
        <p>Comprehensive analysis of academic performance across the school</p>
      </div>

      <div className={styles.filters}>
        <select
          value={selectedTerm}
          onChange={(e) => setSelectedTerm(e.target.value)}
        >
          <option value="term1">Term 1</option>
          <option value="term2">Term 2</option>
          <option value="term3">Term 3</option>
        </select>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="2023">2023</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
        </select>
      </div>

      <div className={styles.summaryCards}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryValue}>76.8%</div>
          <div className={styles.summaryLabel}>School Average</div>
          <div className={styles.summaryTrend}>↑ +2.3% from last term</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryValue}>82.5%</div>
          <div className={styles.summaryLabel}>Highest Class Avg</div>
          <div className={styles.summarySub}>Grade 7A</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryValue}>71.6%</div>
          <div className={styles.summaryLabel}>Lowest Class Avg</div>
          <div className={styles.summarySub}>Grade 7C</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryValue}>85%</div>
          <div className={styles.summaryLabel}>Pass Rate</div>
          <div className={styles.summaryTrend}>↑ +5% from last term</div>
        </div>
      </div>

      <div className={styles.chartSection}>
        <h3>Subject Performance Trends</h3>
        <div className={styles.subjectCharts}>
          {subjectPerformance.map((subject, idx) => (
            <div key={idx} className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <span className={styles.subjectName}>{subject.subject}</span>
                <span className={`${styles.trend} ${styles[subject.trend]}`}>
                  {getTrendIcon(subject.trend)} {subject.trend}
                </span>
              </div>
              <div className={styles.chartValue}>{subject.average}%</div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${subject.average}%`,
                    background: subject.color,
                  }}
                />
              </div>
              <div className={styles.scoreDistribution}>
                {subject.scores.map((score, i) => (
                  <div
                    key={i}
                    className={styles.scoreDot}
                    style={{ background: subject.color, height: `${score}%` }}
                  >
                    <span className={styles.scoreTooltip}>{score}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.rankingSection}>
        <h3>Class Rankings</h3>
        <div className={styles.rankingTable}>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Class</th>
                <th>Average Score</th>
                <th>Top Student</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              {classRankings.map((cls) => (
                <tr
                  key={cls.rank}
                  className={cls.rank === 1 ? styles.topRank : ""}
                >
                  <td className={styles.rankCell}>
                    {cls.rank === 1 && "🥇"}
                    {cls.rank === 2 && "🥈"}
                    {cls.rank === 3 && "🥉"}
                    {cls.rank > 3 && cls.rank}
                  </td>
                  <td>{cls.class}</td>
                  <td className={styles.scoreCell}>{cls.average}%</td>
                  <td>{cls.topStudent}</td>
                  <td>
                    <span
                      className={`${styles.performanceBadge} ${styles[cls.performance.toLowerCase()]}`}
                    >
                      {cls.performance}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {userRole === "headteacher" && (
        <div className={styles.recommendations}>
          <h3>📋 Recommendations</h3>
          <div className={styles.recommendationsList}>
            <div className={styles.recommendationItem}>
              <div className={styles.recommendationIcon}>📚</div>
              <div>
                <strong>Focus on Science Department</strong>
                <p>
                  Science scores have declined by 2% this term. Consider
                  additional resources and teacher support.
                </p>
              </div>
            </div>
            <div className={styles.recommendationItem}>
              <div className={styles.recommendationIcon}>👨‍🎓</div>
              <div>
                <strong>Student Mentorship Program</strong>
                <p>
                  Grade 7C shows potential for improvement. Implement peer
                  tutoring with Grade 7A.
                </p>
              </div>
            </div>
            <div className={styles.recommendationItem}>
              <div className={styles.recommendationIcon}>🏆</div>
              <div>
                <strong>Recognize Excellence</strong>
                <p>
                  Top performers in Mathematics and English should be recognized
                  in the upcoming assembly.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceAnalytics;
