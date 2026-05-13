import { type FormEvent, useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  const [activeSection, setActiveSection] = useState<"performance" | "concerns">("performance");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
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

  const currentSubjectMarks = useMemo(() => {
    const latestBySubject = new Map<string, PerformanceMark>();

    for (const mark of sortedMarks) {
      if (!latestBySubject.has(mark.subjectId)) {
        latestBySubject.set(mark.subjectId, mark);
      }
    }

    return Array.from(latestBySubject.values());
  }, [sortedMarks]);

  const averageScore = getAverageScore(currentSubjectMarks);
  const latestMark = sortedMarks[0] || null;
  const subjectsWithMarks = currentSubjectMarks.filter((mark) => getScore(mark) !== null).length;
  const totalPoints = currentSubjectMarks.reduce(
    (sum, mark) => sum + (typeof mark.points === "number" ? mark.points : 0),
    0,
  );
  const latestBand = latestMark?.cbcBand || "--";

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

  const handleDownloadResults = () => {
    if (!selectedStudent || sortedMarks.length === 0) {
      return;
    }

    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const generatedAt = new Date().toLocaleDateString();
    const title = "Student Results Report";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(title, 40, 42);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Student: ${selectedStudent.name}`, 40, 64);
    doc.text(`Admission No: ${selectedStudent.admissionNumber || "Not set"}`, 40, 80);
    doc.text(`Class: ${formatClass(selectedStudent)}`, 280, 64);
    doc.text(`Average: ${averageScore === null ? "--" : `${averageScore}%`}`, 280, 80);
    doc.text(`Latest Band: ${latestBand}`, 500, 64);
    doc.text(`Total Points: ${totalPoints}`, 500, 80);
    doc.text(`Generated: ${generatedAt}`, 680, 64);

    autoTable(doc, {
      startY: 106,
      head: [[
        "Subject",
        "Term",
        "Year",
        "Exam",
        "CAT 1",
        "CAT 2",
        "CAT 3",
        "CAT 4",
        "CAT 5",
        "Exam Mark",
        "Final",
        "%",
        "Band",
        "Points",
      ]],
      body: currentSubjectMarks.map((mark) => {
        const score = getScore(mark);
        return [
          mark.subjectName,
          mark.term,
          mark.year,
          formatExamType(mark.examType),
          mark.cat1 ?? "--",
          mark.cat2 ?? "--",
          mark.cat3 ?? "--",
          mark.cat4 ?? "--",
          mark.cat5 ?? "--",
          mark.exam ?? "--",
          mark.finalScore ?? "--",
          score === null ? "--" : Math.round(score),
          mark.cbcBand || "--",
          mark.points ?? "--",
        ];
      }),
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [11, 32, 24], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [253, 251, 247] },
      margin: { left: 40, right: 40 },
    });

    doc.save(`${selectedStudent.name.replace(/\s+/g, "-").toLowerCase()}-results.pdf`);
  };

  const handleSectionChange = (section: "performance" | "concerns") => {
    setActiveSection(section);
    setMobileSidebarOpen(false);
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
    <main className={`${styles.parentShell} ${sidebarCollapsed ? styles.parentShellCollapsed : ""}`}>
      <button
        className={styles.mobileSidebarButton}
        onClick={() => setMobileSidebarOpen(true)}
        type="button"
      >
        Menu
      </button>
      {mobileSidebarOpen && (
        <button
          aria-label="Close sidebar"
          className={styles.sidebarOverlay}
          onClick={() => setMobileSidebarOpen(false)}
          type="button"
        />
      )}
      <aside className={`${styles.parentSidebar} ${mobileSidebarOpen ? styles.parentSidebarOpen : ""}`}>
        <div className={styles.sidebarBrand}>
          <div className={styles.sidebarMark}>SM</div>
          <div className={styles.sidebarText}>
            <strong>Parent Portal</strong>
            <span>School Management</span>
          </div>
        </div>

        <button
          className={styles.sidebarCollapseButton}
          onClick={() => setSidebarCollapsed((current) => !current)}
          type="button"
        >
          {sidebarCollapsed ? "Expand" : "Collapse"}
        </button>

        <nav className={styles.sidebarNav} aria-label="Parent dashboard sections">
          <button
            className={`${styles.sidebarButton} ${activeSection === "performance" ? styles.sidebarButtonActive : ""}`}
            onClick={() => handleSectionChange("performance")}
            type="button"
          >
            <span>Performance</span>
            <small>Results and trends</small>
          </button>
          <button
            className={`${styles.sidebarButton} ${activeSection === "concerns" ? styles.sidebarButtonActive : ""}`}
            onClick={() => handleSectionChange("concerns")}
            type="button"
          >
            <span>Concerns</span>
            <small>Message deputy teacher</small>
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <button onClick={() => navigate("/change-password")} type="button">
            Change password
          </button>
          <button onClick={handleLogout} type="button">
            Log out
          </button>
        </div>
      </aside>

      <section className={styles.parentDashboard}>
        <header className={styles.parentHeader}>
          <div>
            <span className={styles.brandBadge}>Parent Portal</span>
            <h1>{activeSection === "performance" ? "Student Performance" : "Parent Concerns"}</h1>
            <p>
              Welcome {dashboard?.parent.name || "Parent"}. {activeSection === "performance"
                ? "Review results, bands, points, and progress comparisons."
                : "Send suggestions or concerns to the deputy teacher for school leadership follow-up."}
            </p>
          </div>

          {activeSection === "performance" && (
            <div className={styles.headerActions}>
              <button
                className={styles.secondaryButton}
                onClick={handleDownloadResults}
                disabled={!selectedStudent || sortedMarks.length === 0}
                type="button"
              >
                Download results
              </button>
            </div>
          )}
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
        ) : activeSection === "performance" ? (
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
                <span>Latest band</span>
                <strong>{latestBand}</strong>
                <small>{totalPoints} total point{totalPoints === 1 ? "" : "s"}</small>
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
            <p>{currentSubjectMarks.length} subject{currentSubjectMarks.length === 1 ? "" : "s"}</p>
              </div>

              {currentSubjectMarks.length === 0 ? (
                <div className={styles.emptyState}>
                  <h3>No marks have been posted yet</h3>
                  <p>When teachers publish marks, they will appear here for the parent to review.</p>
                </div>
              ) : (
                <div className={styles.marksList}>
                  {currentSubjectMarks.map((mark) => {
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
                          <div className={styles.bandCell}>
                            <dt>CBC Band</dt>
                            <dd>{mark.cbcBand || "--"}</dd>
                          </div>
                          <div className={styles.pointsCell}>
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

            <section className={styles.performancePanel}>
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
            </section>
          </>
        ) : (
          <section className={styles.concernsPage}>
            <article className={styles.messagePanel}>
                <div className={styles.sectionHeader}>
                  <div>
                    <span className={styles.eyebrow}>Suggestion</span>
                    <h2>Message deputy teacher</h2>
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
                    rows={8}
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

              <article className={styles.concernInfoPanel}>
                <span className={styles.eyebrow}>Follow up</span>
                <h2>How school leadership receives it</h2>
                <p>
                  Your message appears in the deputy teacher and headteacher Parent Concerns page.
                  Messages stay available for follow-up and are automatically removed after 20 days.
                </p>
              </article>
          </section>
        )}
      </section>
    </main>
  );
}

export default StudentDashboard;
