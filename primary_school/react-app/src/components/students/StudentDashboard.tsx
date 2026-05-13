import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import styles from "./StudentDashboard.module.css";

type PerformanceMark = {
  id: string;
  subjectId: string;
  subjectName: string;
  classGrade: string;
  classStream: string;
  term: number;
  year: number;
  examType: string;
  cat1: number | null;
  cat2: number | null;
  cat3: number | null;
  cat4: number | null;
  cat5: number | null;
  exam: number | null;
  finalScore: number | null;
  percentage: number | null;
  cbcBand: string | null;
  points: number | null;
};

type DashboardStudent = {
  id: string;
  name: string;
  admissionNumber: string;
  classGrade: string;
  classStream: string;
  gender: string;
  guardianName: string;
  guardianPhone: string;
  status: string;
  performance: PerformanceMark[];
};

type StudentDashboardResponse = {
  parent: {
    name: string;
    phone: string;
  };
  students: DashboardStudent[];
};

const formatClass = (student: DashboardStudent) =>
  [student.classGrade, student.classStream].filter(Boolean).join(" ") || "Class not set";

const formatExamType = (examType: string) =>
  examType ? examType.charAt(0).toUpperCase() + examType.slice(1) : "Exam";

const examOrder: Record<string, number> = {
  opener: 1,
  midterm: 2,
  closing: 3,
};

const getBarWidth = (score: number | null) =>
  `${Math.min(100, Math.max(score || 0, 3))}%`;

const getScore = (mark: PerformanceMark) =>
  typeof mark.percentage === "number"
    ? mark.percentage
    : typeof mark.finalScore === "number"
      ? mark.finalScore
      : null;

const getAverageScore = (marks: PerformanceMark[]) => {
  const scores = marks
    .map(getScore)
    .filter((score): score is number => typeof score === "number");

  if (scores.length === 0) {
    return null;
  }

  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
};

const getScoreTone = (score: number | null) => {
  if (score === null) return styles.scoreMuted;
  if (score >= 75) return styles.scoreStrong;
  if (score >= 50) return styles.scoreOkay;
  return styles.scoreLow;
};

function StudentDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<StudentDashboardResponse | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageNotice, setMessageNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get<StudentDashboardResponse>("/users/student-dashboard");

        if (!mounted) return;

        setDashboard(response);
        setSelectedStudentId(response.students[0]?.id || "");
      } catch (err: any) {
        if (!mounted) return;
        setError(err.message || "Could not load student performance.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedStudent = useMemo(() => {
    if (!dashboard) return null;
    return (
      dashboard.students.find((student) => student.id === selectedStudentId) ||
      dashboard.students[0] ||
      null
    );
  }, [dashboard, selectedStudentId]);

  const sortedMarks = useMemo(() => {
    const marks = selectedStudent?.performance || [];
    return [...marks].sort((left, right) => {
      if (right.year !== left.year) return right.year - left.year;
      if (right.term !== left.term) return right.term - left.term;
      const rightExamOrder = examOrder[right.examType] || 0;
      const leftExamOrder = examOrder[left.examType] || 0;
      if (rightExamOrder !== leftExamOrder) return rightExamOrder - leftExamOrder;
      return left.subjectName.localeCompare(right.subjectName);
    });
  }, [selectedStudent]);

  const comparisonRows = useMemo(() => {
    const marksBySubject = new Map<string, PerformanceMark[]>();

    for (const mark of sortedMarks) {
      const marks = marksBySubject.get(mark.subjectId) || [];
      marks.push(mark);
      marksBySubject.set(mark.subjectId, marks);
    }

    return Array.from(marksBySubject.values())
      .map((marks) => {
        const current = marks[0];
        const previous = marks[1] || null;
        const currentScore = current ? getScore(current) : null;
        const previousScore = previous ? getScore(previous) : null;

        return {
          subjectId: current?.subjectId || "",
          subjectName: current?.subjectName || "Subject",
          currentScore,
          previousScore,
          currentLabel: current
            ? `Term ${current.term}, ${current.year} ${formatExamType(current.examType)}`
            : "Current",
          previousLabel: previous
            ? `Term ${previous.term}, ${previous.year} ${formatExamType(previous.examType)}`
            : "Previous",
        };
      })
      .filter((row) => row.currentScore !== null || row.previousScore !== null);
  }, [sortedMarks]);

  const averageScore = getAverageScore(sortedMarks);
  const latestMark = sortedMarks[0] || null;
  const subjectsWithMarks = sortedMarks.filter((mark) => getScore(mark) !== null).length;

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleSendMessage = async (event: FormEvent) => {
    event.preventDefault();
    setMessageNotice(null);

    if (!messageText.trim()) {
      setMessageNotice({ type: "error", text: "Please write your suggestion first." });
      return;
    }

    try {
      setSendingMessage(true);
      await api.post("/users/parent-concerns", {
        studentId: selectedStudent?.id,
        message: messageText.trim(),
      });
      setMessageText("");
      setMessageNotice({
        type: "success",
        text: "Your message has been sent to school leadership.",
      });
    } catch (err: any) {
      setMessageNotice({
        type: "error",
        text: err.message || "Unable to send your message right now.",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <main className={styles.parentDashboard}>
        <section className={styles.statePanel}>
          <div className={styles.loadingDot} />
          <h1>Loading performance</h1>
          <p>Please wait while we prepare the student dashboard.</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.parentDashboard}>
        <section className={styles.statePanel}>
          <h1>Performance unavailable</h1>
          <p>{error}</p>
          <button className={styles.primaryButton} onClick={() => window.location.reload()} type="button">
            Try again
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.parentDashboard}>
      <header className={styles.parentHeader}>
        <div>
          <span className={styles.brandBadge}>Parent Portal</span>
          <h1>Student Performance</h1>
          <p>
            Welcome {dashboard?.parent.name || "Parent"}. Review linked learners and their
            current marks in one clear view.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            className={styles.secondaryButton}
            onClick={() => navigate("/change-password")}
            type="button"
          >
            Change password
          </button>
          <button className={styles.logoutButton} onClick={handleLogout} type="button">
            Log out
          </button>
        </div>
      </header>

      {dashboard && dashboard.students.length > 1 && (
        <section className={styles.studentSelector} aria-label="Linked students">
          {dashboard.students.map((student) => (
            <button
              key={student.id}
              className={`${styles.studentSelectButton} ${
                selectedStudent?.id === student.id ? styles.studentSelectButtonActive : ""
              }`}
              onClick={() => setSelectedStudentId(student.id)}
              type="button"
            >
              <strong>{student.name}</strong>
              <span>{formatClass(student)}</span>
            </button>
          ))}
        </section>
      )}

      {!selectedStudent ? (
        <section className={styles.statePanel}>
          <h2>No student record found</h2>
          <p>No active learner is linked to this parent phone number yet.</p>
        </section>
      ) : (
        <>
          <section className={styles.studentSummary}>
            <article className={styles.profilePanel}>
              <div className={styles.avatarFallback}>
                {selectedStudent.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <h2>{selectedStudent.name}</h2>
                <p>{formatClass(selectedStudent)}</p>
                <span>Admission: {selectedStudent.admissionNumber || "Not set"}</span>
              </div>
            </article>

            <article className={styles.summaryCard}>
              <span>Average score</span>
              <strong className={getScoreTone(averageScore)}>
                {averageScore === null ? "--" : `${averageScore}%`}
              </strong>
            </article>

            <article className={styles.summaryCard}>
              <span>Subjects graded</span>
              <strong>{subjectsWithMarks}</strong>
            </article>

            <article className={styles.summaryCard}>
              <span>Latest exam</span>
              <strong>{latestMark ? `Term ${latestMark.term}` : "--"}</strong>
              <small>{latestMark ? `${latestMark.year} ${formatExamType(latestMark.examType)}` : "No marks yet"}</small>
            </article>
          </section>

          <section className={styles.performancePanel}>
            <div className={styles.sectionHeader}>
              <div>
                <span className={styles.eyebrow}>Performance</span>
                <h2>Subject marks</h2>
              </div>
              <p>{sortedMarks.length} record{sortedMarks.length === 1 ? "" : "s"}</p>
            </div>

            {sortedMarks.length === 0 ? (
              <div className={styles.emptyState}>
                <h3>No marks have been posted yet</h3>
                <p>When teachers publish marks, they will appear here for the parent to review.</p>
              </div>
            ) : (
              <div className={styles.marksList}>
                {sortedMarks.map((mark) => {
                  const score = getScore(mark);
                  return (
                    <article key={mark.id} className={styles.markCard}>
                      <div className={styles.markMain}>
                        <div>
                          <strong>{mark.subjectName}</strong>
                          <span>
                            Term {mark.term}, {mark.year} - {formatExamType(mark.examType)}
                          </span>
                        </div>
                        <div className={`${styles.scoreBadge} ${getScoreTone(score)}`}>
                          {score === null ? "--" : `${Math.round(score)}%`}
                        </div>
                      </div>

                      <dl className={styles.markDetails}>
                        <div>
                          <dt>CAT 1</dt>
                          <dd>{mark.cat1 ?? "--"}</dd>
                        </div>
                        <div>
                          <dt>CAT 2</dt>
                          <dd>{mark.cat2 ?? "--"}</dd>
                        </div>
                        <div>
                          <dt>Exam</dt>
                          <dd>{mark.exam ?? "--"}</dd>
                        </div>
                        <div>
                          <dt>Band</dt>
                          <dd>{mark.cbcBand || "--"}</dd>
                        </div>
                        <div>
                          <dt>Points</dt>
                          <dd>{mark.points ?? "--"}</dd>
                        </div>
                      </dl>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className={styles.dashboardGrid}>
            <article className={styles.performancePanel}>
              <div className={styles.sectionHeader}>
                <div>
                  <span className={styles.eyebrow}>Comparison</span>
                  <h2>Current vs previous</h2>
                </div>
              </div>

              {comparisonRows.length === 0 ? (
                <div className={styles.emptyState}>
                  <h3>No comparison available</h3>
                  <p>At least one posted mark is needed before the chart can be shown.</p>
                </div>
              ) : (
                <div className={styles.chartList}>
                  {comparisonRows.map((row) => (
                    <div key={row.subjectId} className={styles.chartRow}>
                      <div className={styles.chartSubject}>
                        <strong>{row.subjectName}</strong>
                        <span>{row.currentLabel}</span>
                      </div>
                      <div className={styles.barGroup}>
                        <div className={styles.barLine}>
                          <span>Now</span>
                          <div className={styles.barTrack}>
                            <div
                              className={styles.currentBar}
                              style={{ width: getBarWidth(row.currentScore) }}
                            />
                          </div>
                          <strong>{row.currentScore === null ? "--" : `${Math.round(row.currentScore)}%`}</strong>
                        </div>
                        <div className={styles.barLine}>
                          <span>Previous</span>
                          <div className={styles.barTrack}>
                            <div
                              className={styles.previousBar}
                              style={{ width: getBarWidth(row.previousScore) }}
                            />
                          </div>
                          <strong>{row.previousScore === null ? "--" : `${Math.round(row.previousScore)}%`}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className={styles.messagePanel}>
              <div className={styles.sectionHeader}>
                <div>
                  <span className={styles.eyebrow}>Suggestion</span>
                  <h2>Message headteacher</h2>
                </div>
              </div>

              <form className={styles.messageForm} onSubmit={handleSendMessage}>
                <label htmlFor="parentMessage">
                  Suggestion or concern
                </label>
                <textarea
                  id="parentMessage"
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  placeholder="Write your suggestion or concern here..."
                  maxLength={1000}
                  rows={6}
                />
                <div className={styles.messageFooter}>
                  <span>{messageText.length}/1000</span>
                  <button className={styles.primaryButton} disabled={sendingMessage} type="submit">
                    {sendingMessage ? "Sending..." : "Send message"}
                  </button>
                </div>
                {messageNotice && (
                  <p className={`${styles.messageNotice} ${messageNotice.type === "success" ? styles.noticeSuccess : styles.noticeError}`}>
                    {messageNotice.text}
                  </p>
                )}
              </form>
            </article>
          </section>
        </>
      )}
    </main>
  );
}

export default StudentDashboard;
