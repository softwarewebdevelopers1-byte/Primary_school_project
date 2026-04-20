import styles from "./StudentPortfolio.module.css";
import { Assessment, LearningMaterial, Portfolio, QuestionTask, Student } from "./types";

interface StudentPortfolioProps {
  student: Student;
  portfolio: Portfolio;
  materials: LearningMaterial[];
  assessments: Assessment[];
  questions: QuestionTask[];
}

function StudentPortfolio({
  student,
  portfolio,
  materials,
  assessments,
  questions,
}: StudentPortfolioProps) {
  const completedMaterials = materials.filter((item) => item.completed).length;
  const submittedWork = [
    ...assessments.filter((item) => item.status === "submitted" || item.status === "graded"),
    ...questions.filter(
      (item) => item.status === "submitted" || item.status === "graded" || item.status === "late",
    ),
  ].length;

  return (
    <section className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.profileBlock}>
          <img src={student.avatar} alt={student.name} className={styles.avatar} />
          <div>
            <span className={styles.eyebrow}>Learner profile</span>
            <h2>{student.name}</h2>
            <p>
              {student.school} • {student.grade} • {student.class}
            </p>
            <p>Admission number: {student.admissionNumber}</p>
          </div>
        </div>

        <div className={styles.parentCard}>
          <strong>Parent contact</strong>
          <p>{student.parentEmail}</p>
          <p>{student.parentPhone}</p>
        </div>
      </header>

      <section className={styles.metricsGrid}>
        <article className={styles.metricCard}>
          <span>Average score</span>
          <strong>{portfolio.averageScore}%</strong>
        </article>
        <article className={styles.metricCard}>
          <span>Attendance</span>
          <strong>{portfolio.attendanceRate}%</strong>
        </article>
        <article className={styles.metricCard}>
          <span>Materials completed</span>
          <strong>{completedMaterials}</strong>
        </article>
        <article className={styles.metricCard}>
          <span>Submitted work</span>
          <strong>{submittedWork}</strong>
        </article>
      </section>

      <div className={styles.contentGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.eyebrow}>Achievement wall</span>
            <h3>Badges and recognition</h3>
          </div>
          <div className={styles.badgeGrid}>
            {portfolio.badges.map((badge) => (
              <article key={badge.id} className={styles.badgeCard}>
                <strong>{badge.title}</strong>
                <span>
                  {badge.subject} • Rank {badge.rank}
                </span>
                <p>
                  {badge.term} {badge.year}
                </p>
                <small>Earned {new Date(badge.dateEarned).toLocaleDateString()}</small>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.eyebrow}>Teacher insight</span>
            <h3>Strengths and next steps</h3>
          </div>

          <div className={styles.listBlock}>
            <strong>Strengths</strong>
            <ul>
              {portfolio.strengths.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className={styles.listBlock}>
            <strong>Growth areas</strong>
            <ul>
              {portfolio.growthAreas.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className={styles.commentsBlock}>
            {portfolio.teacherComments.map((comment) => (
              <p key={comment}>{comment}</p>
            ))}
          </div>
        </section>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <span className={styles.eyebrow}>Mastery snapshot</span>
          <h3>Progress by subject</h3>
        </div>

        <div className={styles.progressList}>
          {portfolio.subjectProgress.map((item) => (
            <div key={item.subject} className={styles.progressItem}>
              <div className={styles.progressMeta}>
                <div>
                  <strong>{item.subject}</strong>
                  <p>{item.teacher}</p>
                </div>
                <span>{item.mastery}%</span>
              </div>
              <div className={styles.progressTrack}>
                <div className={styles.progressBar} style={{ width: `${item.mastery}%` }} />
              </div>
              <small>Target: {item.target}% mastery</small>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

export default StudentPortfolio;
