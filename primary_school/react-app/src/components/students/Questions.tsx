import { useMemo, useState } from "react";
import styles from "./Questions.module.css";
import { QuestionTask } from "./types";

interface QuestionsProps {
  studentId: string;
  questions: QuestionTask[];
  onSubmitQuestionTask: (taskId: string, answers: Record<string, string>) => void;
}

function getDeadlineState(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now();
  const hours = Math.round(diff / (1000 * 60 * 60));

  return {
    isLate: diff < 0,
    label:
      diff < 0
        ? "Deadline passed"
        : hours >= 24
          ? `${Math.floor(hours / 24)} days left`
          : `${Math.max(1, hours)} hours left`,
  };
}

function Questions({ questions, onSubmitQuestionTask }: QuestionsProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showLateOnly, setShowLateOnly] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedTask = useMemo(
    () => questions.find((item) => item.id === selectedTaskId) ?? null,
    [questions, selectedTaskId],
  );

  const visibleQuestions = useMemo(
    () =>
      showLateOnly
        ? questions.filter(
            (item) => item.status === "late" || getDeadlineState(item.deadline).isLate,
          )
        : questions,
    [questions, showLateOnly],
  );

  const openTask = (task: QuestionTask) => {
    setSelectedTaskId(task.id);
    setAnswers(
      task.questions.reduce<Record<string, string>>((acc, question) => {
        acc[question.id] = question.studentAnswer ?? "";
        return acc;
      }, {}),
    );
    setErrorMessage("");
  };

  const submitTask = () => {
    if (!selectedTask) {
      return;
    }

    const missing = selectedTask.questions.some((question) => !answers[question.id]?.trim());
    if (missing) {
      setErrorMessage("Answer each question before submitting.");
      return;
    }

    onSubmitQuestionTask(selectedTask.id, answers);
    setSelectedTaskId(null);
    setAnswers({});
    setErrorMessage("");
  };

  if (selectedTask) {
    const deadlineState = getDeadlineState(selectedTask.deadline);

    return (
      <section className={styles.page}>
        <button className={styles.backButton} onClick={() => setSelectedTaskId(null)} type="button">
          Back to question tasks
        </button>

        <article className={styles.formCard}>
          <div className={styles.formHeader}>
            <div>
              <span className={styles.eyebrow}>{selectedTask.subject}</span>
              <h2>{selectedTask.title}</h2>
            </div>
            <div className={styles.headerMeta}>
              <span>{selectedTask.teacher}</span>
              <span>{selectedTask.totalMarks} marks</span>
              <span>{new Date(selectedTask.deadline).toLocaleString()}</span>
            </div>
          </div>

          <div className={styles.warningPanel}>
            <strong>{deadlineState.label}</strong>
            <p>
              Late submissions lose {selectedTask.penalty}% of the total score.
              Submit before the deadline where possible.
            </p>
          </div>

          <p className={styles.instructions}>{selectedTask.instructions}</p>

          <div className={styles.formBody}>
            {selectedTask.questions.map((question, index) => (
              <div key={question.id} className={styles.questionCard}>
                <div className={styles.questionHeader}>
                  <strong>Question {index + 1}</strong>
                  <span>{question.marks} marks</span>
                </div>
                <p>{question.text}</p>
                <textarea
                  className={styles.textarea}
                  rows={4}
                  value={answers[question.id] ?? ""}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      [question.id]: event.target.value,
                    }))
                  }
                  placeholder="Write your answer"
                />
              </div>
            ))}
          </div>

          {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

          <div className={styles.formActions}>
            <button className={styles.secondaryButton} onClick={() => setSelectedTaskId(null)} type="button">
              Save for later
            </button>
            <button className={styles.primaryButton} onClick={submitTask} type="button">
              Submit task
            </button>
          </div>
        </article>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <header className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Question practice</span>
          <h2>Keep short tasks moving before deadlines slip</h2>
          <p>
            These quick question sets support revision and class practice. The
            dashboard highlights deadline risk so nothing is easy to miss.
          </p>
        </div>

        <button
          className={`${styles.toggleButton} ${showLateOnly ? styles.toggleButtonActive : ""}`}
          onClick={() => setShowLateOnly((current) => !current)}
          type="button"
        >
          {showLateOnly ? "Showing late items" : "Show late items only"}
        </button>
      </header>

      <div className={styles.grid}>
        {visibleQuestions.map((task) => {
          const deadline = getDeadlineState(task.deadline);
          const lateFlag = task.status === "late" || deadline.isLate;

          return (
            <article key={task.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <span className={styles.subjectBadge}>{task.subject}</span>
                  <h3>{task.title}</h3>
                </div>
                <span className={`${styles.deadlineBadge} ${lateFlag ? styles.deadlineLate : styles.deadlineSafe}`}>
                  {deadline.label}
                </span>
              </div>

              <p className={styles.instructions}>{task.instructions}</p>

              <dl className={styles.metaGrid}>
                <div>
                  <dt>Teacher</dt>
                  <dd>{task.teacher}</dd>
                </div>
                <div>
                  <dt>Penalty</dt>
                  <dd>{task.penalty}%</dd>
                </div>
                <div>
                  <dt>Questions</dt>
                  <dd>{task.questions.length}</dd>
                </div>
                <div>
                  <dt>Deadline</dt>
                  <dd>{new Date(task.deadline).toLocaleString()}</dd>
                </div>
              </dl>

              {typeof task.obtainedMarks === "number" && (
                <div className={styles.scoreBanner}>
                  Score: {task.obtainedMarks}/{task.totalMarks}
                </div>
              )}

              {task.submittedAt && (
                <p className={styles.submittedText}>
                  Submitted {new Date(task.submittedAt).toLocaleString()}
                </p>
              )}

              <div className={styles.cardActions}>
                <button
                  className={lateFlag ? styles.secondaryButton : styles.primaryButton}
                  onClick={() => openTask(task)}
                  type="button"
                >
                  {task.status === "pending" ? "Answer questions" : "Review responses"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default Questions;
