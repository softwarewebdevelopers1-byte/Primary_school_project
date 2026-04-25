// components/students/StudentDashboard.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./StudentDashboard.module.css";
import StudentPortfolio from "./StudentPortfolio";
import LearningMaterials from "./LearningMaterials";
import Assessments from "./Assessments";
import Questions from "./Questions";
import {
  Assessment,
  LearningMaterial,
  Portfolio,
  QuestionTask,
  Student,
} from "./types";

type Tab = "dashboard" | "materials" | "assessments" | "questions" | "portfolio";

const student: Student = {
  id: "STU001",
  name: "Emma Mwangi",
  grade: "Grade 7",
  class: "7A",
  admissionNumber: "2024/001",
  parentEmail: "parent.emma@example.com",
  parentPhone: "+254 712 345 678",
  avatar:
    "https://ui-avatars.com/api/?name=Emma+Mwangi&background=F97316&color=fff&bold=true",
  school: "Hillview Primary School",
  house: "Mara House",
  learningStreak: 18,
  weeklyGoalHours: 8,
  completedHours: 5.5,
};

const initialPortfolio: Portfolio = {
  studentId: student.id,
  badges: [
    {
      id: "B1",
      rank: 1,
      subject: "Mathematics",
      term: "Term 1",
      year: 2026,
      dateEarned: "2026-02-15",
      title: "Problem Solving Champion",
    },
    {
      id: "B2",
      rank: 2,
      subject: "Science",
      term: "Term 1",
      year: 2026,
      dateEarned: "2026-02-26",
      title: "Lab Star",
    },
    {
      id: "B3",
      rank: 3,
      subject: "English",
      term: "Term 1",
      year: 2026,
      dateEarned: "2026-03-02",
      title: "Creative Writer",
    },
  ],
  averageScore: 86.4,
  totalAssessments: 14,
  totalQuestions: 48,
  attendanceRate: 96,
  teacherComments: [
    "Emma explains her thinking clearly and helps classmates during group work.",
    "Her revision habits are consistent, especially before science tasks.",
    "Reading confidence has improved a lot this month.",
  ],
  strengths: ["Problem solving", "Class participation", "Science experiments"],
  growthAreas: ["Essay structure", "Time management during tests"],
  subjectProgress: [
    { subject: "Mathematics", mastery: 91, target: 94, teacher: "Mr. Otieno" },
    { subject: "Science", mastery: 88, target: 90, teacher: "Mrs. Wanjiku" },
    { subject: "English", mastery: 79, target: 85, teacher: "Mr. Kamau" },
    { subject: "Social Studies", mastery: 84, target: 88, teacher: "Ms. Auma" },
  ],
};

const initialMaterials: LearningMaterial[] = [
  {
    id: "LM001",
    title: "Algebra Starter Pack",
    subject: "Mathematics",
    teacher: "Mr. Otieno",
    uploadedDate: "2026-04-16",
    fileType: "pdf",
    fileUrl: "#algebra-starter-pack",
    description: "Worked examples, revision notes, and a short challenge set.",
    duration: "18 min read",
    topic: "Equations",
    isNew: true,
    completed: true,
    downloads: 14,
    saved: true,
  },
  {
    id: "LM002",
    title: "Photosynthesis Animation",
    subject: "Science",
    teacher: "Mrs. Wanjiku",
    uploadedDate: "2026-04-18",
    fileType: "video",
    fileUrl: "#photosynthesis-animation",
    description: "A visual walkthrough of chlorophyll, sunlight, and energy flow.",
    duration: "9 min video",
    topic: "Plants",
    isNew: true,
    completed: false,
    downloads: 6,
    saved: false,
  },
  {
    id: "LM003",
    title: "Narrative Writing Checklist",
    subject: "English",
    teacher: "Mr. Kamau",
    uploadedDate: "2026-04-11",
    fileType: "doc",
    fileUrl: "#narrative-writing-checklist",
    description: "A practical checklist for structure, transitions, and endings.",
    duration: "12 min read",
    topic: "Writing",
    isNew: false,
    completed: false,
    downloads: 9,
    saved: true,
  },
  {
    id: "LM004",
    title: "Map Skills Revision Slides",
    subject: "Social Studies",
    teacher: "Ms. Auma",
    uploadedDate: "2026-04-09",
    fileType: "ppt",
    fileUrl: "#map-skills-revision-slides",
    description: "Compass points, scale, and symbol interpretation in simple steps.",
    duration: "15 slides",
    topic: "Geography",
    isNew: false,
    completed: true,
    downloads: 11,
    saved: false,
  },
];

const initialAssessments: Assessment[] = [
  {
    id: "AS001",
    title: "Mathematics Mid-Term Review",
    subject: "Mathematics",
    teacher: "Mr. Otieno",
    dueDate: "2026-04-24T17:00:00",
    totalMarks: 40,
    status: "pending",
    instructions: "Answer every question and show your working clearly.",
    attemptsAllowed: 1,
    questions: [
      {
        id: "AS001-Q1",
        text: "Solve for x: 3x + 12 = 27",
        type: "short-answer",
        marks: 10,
      },
      {
        id: "AS001-Q2",
        text: "Which fraction is equivalent to 3/4?",
        type: "multiple-choice",
        options: ["6/8", "4/10", "9/16", "2/3"],
        marks: 10,
      },
      {
        id: "AS001-Q3",
        text: "Explain how you would check your answer to an equation.",
        type: "essay",
        marks: 20,
      },
    ],
  },
];

const initialQuestions: QuestionTask[] = [
  {
    id: "QT001",
    title: "Algebra Practice Set",
    subject: "Mathematics",
    teacher: "Mr. Otieno",
    deadline: "2026-04-22T20:00:00",
    totalMarks: 30,
    status: "pending",
    penalty: 10,
    instructions: "Keep answers short and show key steps where needed.",
    questions: [
      { id: "QT001-Q1", text: "Solve: 5x - 8 = 17", marks: 10 },
      { id: "QT001-Q2", text: "Write one real-life example of an equation.", marks: 10 },
      { id: "QT001-Q3", text: "What is the value of x in x/4 = 3?", marks: 10 },
    ],
  },
];

const tabLabels: Record<Tab, string> = {
  dashboard: "Dashboard",
  materials: "Learning Materials",
  assessments: "Assessments",
  questions: "Questions",
  portfolio: "Portfolio",
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const getDaysUntil = (value: string) => {
  const now = new Date();
  const target = new Date(value);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

function AppOverview({
  student: currentStudent,
  portfolio,
  materials,
  assessments,
  questions,
  onOpenTab,
}: {
  student: Student;
  portfolio: Portfolio;
  materials: LearningMaterial[];
  assessments: Assessment[];
  questions: QuestionTask[];
  onOpenTab: (tab: Tab) => void;
}) {
  const pendingAssessments = assessments.filter((item) => item.status === "pending").length;
  const submittedAssessments = assessments.filter((item) => item.status === "submitted").length;
  const pendingQuestions = questions.filter((item) => item.status === "pending").length;
  const completedMaterials = materials.filter((item) => item.completed).length;
  const savedMaterials = materials.filter((item) => item.saved).length;
  const weeklyGoal = Math.min(
    100,
    Math.round((currentStudent.completedHours / currentStudent.weeklyGoalHours) * 100),
  );

  const focusList = [
    {
      title: "Finish your mathematics review",
      note: `${pendingAssessments} assessment${pendingAssessments === 1 ? "" : "s"} waiting`,
      action: () => onOpenTab("assessments"),
      actionLabel: "Open assessments",
    },
    {
      title: "Catch up on learning materials",
      note: `${materials.length - completedMaterials} material${materials.length - completedMaterials === 1 ? "" : "s"} left this week`,
      action: () => onOpenTab("materials"),
      actionLabel: "Review materials",
    },
    {
      title: "Respond before deadlines",
      note: `${pendingQuestions} question task${pendingQuestions === 1 ? "" : "s"} still open`,
      action: () => onOpenTab("questions"),
      actionLabel: "Answer questions",
    },
  ];

  const upcoming = [...assessments, ...questions]
    .filter((item) => item.status === "pending" || item.status === "submitted")
    .sort((a, b) => new Date("dueDate" in a ? a.dueDate : a.deadline).getTime() - new Date("dueDate" in b ? b.dueDate : b.deadline).getTime())
    .slice(0, 4)
    .map((item) => ({
      id: item.id,
      title: item.title,
      subject: item.subject,
      date: "dueDate" in item ? item.dueDate : item.deadline,
      kind: "dueDate" in item ? "Assessment" : "Question set",
    }));

  return (
    <section className={styles.overview}>
      <div className={styles.heroCard}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>Student workspace</span>
          <h2>Stay on top of classes, tasks, and progress in one place.</h2>
          <p>
            Your dashboard keeps daily priorities visible, makes assignments easy
            to complete, and turns revision materials into a smoother routine.
          </p>
          <div className={styles.heroActions}>
            <button className={styles.primaryButton} onClick={() => onOpenTab("assessments")}>
              Continue learning
            </button>
            <button className={styles.secondaryButton} onClick={() => onOpenTab("portfolio")}>
              View portfolio
            </button>
          </div>
        </div>

        <div className={styles.heroPanel}>
          <div className={styles.goalHeader}>
            <span>Weekly study goal</span>
            <strong>{weeklyGoal}%</strong>
          </div>
          <div className={styles.progressTrack}>
            <div className={styles.progressBar} style={{ width: `${weeklyGoal}%` }} />
          </div>
          <div className={styles.goalMeta}>
            <span>{currentStudent.completedHours}h completed</span>
            <span>{currentStudent.weeklyGoalHours}h target</span>
          </div>

          <div className={styles.heroStats}>
            <div>
              <strong>{currentStudent.learningStreak} days</strong>
              <span>Learning streak</span>
            </div>
            <div>
              <strong>{portfolio.averageScore}%</strong>
              <span>Average score</span>
            </div>
            <div>
              <strong>{portfolio.attendanceRate}%</strong>
              <span>Attendance</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.metricsGrid}>
        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>Pending assessments</span>
          <strong>{pendingAssessments}</strong>
          <p>{submittedAssessments} submitted and awaiting feedback.</p>
        </article>
        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>Materials completed</span>
          <strong>
            {completedMaterials}/{materials.length}
          </strong>
          <p>{savedMaterials} resources saved for quick revision.</p>
        </article>
        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>Question tasks</span>
          <strong>{pendingQuestions}</strong>
          <p>Complete them before the penalty window opens.</p>
        </article>
        <article className={styles.metricCard}>
          <span className={styles.metricLabel}>Recent wins</span>
          <strong>{portfolio.badges.length}</strong>
          <p>Badges earned this term across class activities.</p>
        </article>
      </div>

      <div className={styles.overviewGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.eyebrow}>Today&apos;s focus</span>
              <h3>Recommended next steps</h3>
            </div>
          </div>
          <div className={styles.focusList}>
            {focusList.map((item) => (
              <div key={item.title} className={styles.focusItem}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.note}</p>
                </div>
                <button className={styles.inlineButton} onClick={item.action}>
                  {item.actionLabel}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.eyebrow}>Timeline</span>
              <h3>Upcoming deadlines</h3>
            </div>
          </div>
          <div className={styles.timeline}>
            {upcoming.map((item) => (
              <div key={item.id} className={styles.timelineItem}>
                <div className={styles.timelineDate}>
                  <strong>{formatDate(item.date)}</strong>
                  <span>{getDaysUntil(item.date)} days</span>
                </div>
                <div>
                  <strong>{item.title}</strong>
                  <p>
                    {item.kind} • {item.subject}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function StudentDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [materials, setMaterials] = useState(initialMaterials);
  const [assessments, setAssessments] = useState(initialAssessments);
  const [questions, setQuestions] = useState(initialQuestions);

  const portfolio = useMemo(() => {
    const scores = [
      ...assessments.filter((item) => typeof item.obtainedMarks === "number").map((item) => ((item.obtainedMarks ?? 0) / item.totalMarks) * 100),
      ...questions.filter((item) => typeof item.obtainedMarks === "number").map((item) => ((item.obtainedMarks ?? 0) / item.totalMarks) * 100),
    ];

    const averageScore =
      scores.length > 0
        ? Number((scores.reduce((sum, value) => sum + value, 0) / scores.length).toFixed(1))
        : initialPortfolio.averageScore;

    return {
      ...initialPortfolio,
      averageScore,
      totalAssessments: assessments.length,
      totalQuestions: questions.reduce((sum, item) => sum + item.questions.length, 0),
    };
  }, [assessments, questions]);

  const pendingCount =
    assessments.filter((item) => item.status === "pending").length +
    questions.filter((item) => item.status === "pending").length;

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navItems: Tab[] = ["dashboard", "materials", "assessments", "questions", "portfolio"];

  return (
    <div className={styles.dashboardShell}>
      <header className={styles.topbar}>
        <div className={styles.brandBlock}>
          <span className={styles.brandBadge}>{student.school}</span>
          <h1>Student Dashboard</h1>
          <p>Organized learning, clear progress, and faster follow-through.</p>
        </div>

        <div className={styles.studentCard}>
          <img src={student.avatar} alt={student.name} className={styles.avatar} />
          <div>
            <strong>{student.name}</strong>
            <p>
              {student.class} • {student.grade}
            </p>
            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                fontSize: 11,
                color: "#f97316",
                fontWeight: 700,
                cursor: "pointer",
                textDecoration: "underline"
              }}
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <nav className={styles.tabBar} aria-label="Student sections">
        {navItems.map((tab) => (
          <button
            key={tab}
            className={`${styles.tabButton} ${activeTab === tab ? styles.tabButtonActive : ""}`}
            onClick={() => setActiveTab(tab)}
            type="button"
          >
            {tabLabels[tab]}
          </button>
        ))}
      </nav>

      <main className={styles.mainContent}>
        {activeTab === "dashboard" && (
          <AppOverview
            student={student}
            portfolio={portfolio}
            materials={materials}
            assessments={assessments}
            questions={questions}
            onOpenTab={setActiveTab}
          />
        )}

        {activeTab === "materials" && (
          <LearningMaterials
            studentId={student.id}
            materials={materials}
            onToggleSaved={() => {}}
            onToggleComplete={() => {}}
            onDownload={() => {}}
          />
        )}

        {activeTab === "assessments" && (
          <Assessments
            studentId={student.id}
            assessments={assessments}
            onSubmitAssessment={() => {}}
          />
        )}

        {activeTab === "questions" && (
          <Questions
            studentId={student.id}
            questions={questions}
            onSubmitQuestionTask={() => {}}
          />
        )}

        {activeTab === "portfolio" && (
          <StudentPortfolio
            student={student}
            portfolio={portfolio}
            materials={materials}
            assessments={assessments}
            questions={questions}
          />
        )}
      </main>
    </div>
  );
}

export default StudentDashboard;
