// components/deputyhead/SchoolOverview.tsx

import React from "react";
import styles from "./SchoolOverview.module.css";
import { UserRole, SchoolStats, PerformanceData } from "./types";

interface SchoolOverviewProps {
  userRole: UserRole;
}

const SchoolOverview: React.FC<SchoolOverviewProps> = ({ userRole }) => {
  const isHeadTeacher = userRole === "headteacher";

  // Dummy school statistics
  const stats: SchoolStats = {
    totalStudents: 1245,
    totalTeachers: 48,
    totalClasses: 8,
    totalStreams: 24,
    averageAttendance: 92,
    averagePerformance: 76.5,
    boysCount: 654,
    girlsCount: 591,
  };

  const performanceData: PerformanceData[] = [
    {
      subject: "Mathematics",
      classAverage: 72,
      target: 75,
      trend: "up",
      topStudent: "Emma Mwangi",
      topScore: 98,
    },
    {
      subject: "English",
      classAverage: 78,
      target: 75,
      trend: "up",
      topStudent: "James Otieno",
      topScore: 95,
    },
    {
      subject: "Kiswahili",
      classAverage: 74,
      target: 75,
      trend: "stable",
      topStudent: "Aisha Hassan",
      topScore: 92,
    },
    {
      subject: "Science",
      classAverage: 71,
      target: 75,
      trend: "down",
      topStudent: "Brian Kipchoge",
      topScore: 90,
    },
    {
      subject: "Social Studies",
      classAverage: 76,
      target: 75,
      trend: "up",
      topStudent: "Cynthia Achieng",
      topScore: 94,
    },
  ];

  const recentActivities = [
    {
      id: 1,
      action: "New teacher joined",
      user: "Mr. Peter Otieno",
      time: "2 hours ago",
      icon: "👨‍🏫",
    },
    {
      id: 2,
      action: "Student enrollment",
      user: "50 new students",
      time: "1 day ago",
      icon: "👨‍🎓",
    },
    {
      id: 3,
      action: "Exam results published",
      user: "Term 1 Results",
      time: "2 days ago",
      icon: "📊",
    },
    {
      id: 4,
      action: "Parent meeting",
      user: "Scheduled for Friday",
      time: "3 days ago",
      icon: "💬",
    },
  ];

  return (
    <div className={styles.overviewContainer}>
      <div className={styles.header}>
        <h2>🏫 School Overview</h2>
        <p>
          Welcome back, {isHeadTeacher ? "Head Teacher" : "Deputy Head Teacher"}
          ! Here's your school at a glance.
        </p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>👨‍🎓</div>
          <div className={styles.statValue}>{stats.totalStudents}</div>
          <div className={styles.statLabel}>Total Students</div>
          <div className={styles.statSub}>
            <span>👦 {stats.boysCount}</span>
            <span>👧 {stats.girlsCount}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>👨‍🏫</div>
          <div className={styles.statValue}>{stats.totalTeachers}</div>
          <div className={styles.statLabel}>Teachers</div>
          <div className={styles.statSub}>Student-Teacher Ratio: 26:1</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📚</div>
          <div className={styles.statValue}>{stats.totalClasses}</div>
          <div className={styles.statLabel}>Classes</div>
          <div className={styles.statSub}>{stats.totalStreams} Streams</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📊</div>
          <div className={styles.statValue}>{stats.averagePerformance}%</div>
          <div className={styles.statLabel}>Avg Performance</div>
          <div
            className={`${styles.statTrend} ${stats.averagePerformance >= 75 ? styles.positive : styles.negative}`}
          >
            {stats.averagePerformance >= 75
              ? "↑ Above Target"
              : "↓ Below Target"}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📅</div>
          <div className={styles.statValue}>{stats.averageAttendance}%</div>
          <div className={styles.statLabel}>Attendance</div>
          <div className={styles.statSub}>This term</div>
        </div>
      </div>

      <div className={styles.performanceSection}>
        <div className={styles.sectionHeader}>
          <h3>Subject Performance</h3>
          <button className={styles.viewAllBtn}>View All →</button>
        </div>
        <div className={styles.performanceGrid}>
          {performanceData.map((subject, idx) => (
            <div key={idx} className={styles.performanceCard}>
              <div className={styles.subjectHeader}>
                <span className={styles.subjectName}>{subject.subject}</span>
                <span className={`${styles.trend} ${styles[subject.trend]}`}>
                  {subject.trend === "up" && "↑"}
                  {subject.trend === "down" && "↓"}
                  {subject.trend === "stable" && "→"}
                </span>
              </div>
              <div className={styles.subjectStats}>
                <div>
                  <div className={styles.statValue}>
                    {subject.classAverage}%
                  </div>
                  <div className={styles.statLabel}>Class Avg</div>
                </div>
                <div>
                  <div className={styles.statValue}>{subject.target}%</div>
                  <div className={styles.statLabel}>Target</div>
                </div>
                <div>
                  <div className={styles.statValue}>{subject.topScore}%</div>
                  <div className={styles.statLabel}>Top Score</div>
                </div>
              </div>
              <div className={styles.topStudent}>
                🏆 Top: {subject.topStudent}
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${(subject.classAverage / subject.target) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.activitySection}>
        <div className={styles.sectionHeader}>
          <h3>Recent Activities</h3>
          <button className={styles.viewAllBtn}>View All →</button>
        </div>
        <div className={styles.activityList}>
          {recentActivities.map((activity) => (
            <div key={activity.id} className={styles.activityItem}>
              <div className={styles.activityIcon}>{activity.icon}</div>
              <div className={styles.activityContent}>
                <div className={styles.activityAction}>{activity.action}</div>
                <div className={styles.activityUser}>{activity.user}</div>
                <div className={styles.activityTime}>{activity.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isHeadTeacher && (
        <div className={styles.quickActions}>
          <h3>Quick Actions</h3>
          <div className={styles.actionButtons}>
            <button className={styles.actionBtn}>📊 Generate Report</button>
            <button className={styles.actionBtn}>👨‍🏫 Add Teacher</button>
            <button className={styles.actionBtn}>📢 Send Announcement</button>
            <button className={styles.actionBtn}>📅 Schedule Meeting</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolOverview;
