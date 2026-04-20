import { useMemo, useState } from "react";
import styles from "./Assessments.module.css";
import { Assessment } from "./types";

interface AssessmentsProps {
  studentId: string;
  assessments: Assessment[];
  onSubmitAssessment: (assessmentId: string, answers: Record<string, string>) => void;
}

function Assessments({
  assessments,
  onSubmitAssessment,
}: AssessmentsProps) {
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState<Assessment["status"] | "all">("all");
  const [errorMessage, setErrorMessage] = useState("");

  const selectedAssessment = useMemo(
    () => assessments.find((item) => item.id === selectedAssessmentId) ?? null,
    [assessments, selectedAssessmentId],
  );

  const filteredAssessments = useMemo(
    () =>
      assessments.filter((item) => statusFilter === "all" || item.status === statusFilter),
    [assessments, statusFilter],
  );

  const handleOpenAssessment = (assessment: Assessment) => {
    setSelectedAssessmentId(assessment.id);
    setAnswers(
      assessment.questions.reduce<Record<string, string>>((acc, question) => {
        acc[question.id] = question.studentAnswer ?? "";
        return acc;
      }, {}),
    );
    setErrorMessage("");
  };

  const handleSubmit = () => {
    if (!selectedAssessment) {
      return;
    }

    const missing = selectedAssessment.questions.some(
      (question) => !answers[question.id]?.trim(),
    );

    if (missing) {
      setErrorMessage("Please answer every question before submitting.");
      return;
    }

    onSubmitAssessment(selectedAssessment.id, answers);
    setSelectedAssessmentId(null);
    setAnswers({});
    setErrorMessage("");
  };

  if (selectedAssessment) {
    return (
      <section className={styles.page}>
        <button
          className={styles.backButton}
          onClick={() => setSelectedAssessmentId(null)}
          type="button"
        >
          Back to assessments
        </button>

        <article className={styles.formCard}>
          <div className={styles.formHeader}>
            <div>
              <span className={styles.eyebrow}>{selectedAssessment.subject}</span>
              <h2>{selectedAssessment.title}</h2>
            </div>
            <div className={styles.headerMeta}>
              <span>Due {new Date(selectedAssessment.dueDate).toLocaleString()}</span>
              <span>{selectedAssessment.totalMarks} marks</span>
              <span>{selectedAssessment.attemptsAllowed} attempt</span>
            </div>
          </div>

          <p className={styles.instructions}>{selectedAssessment.instructions}</p>

          <div className={styles.formBody}>
            {selectedAssessment.questions.map((question, index) => (
              <div key={question.id} className={styles.questionCard}>
                <div className={styles.questionHeader}>
                  <strong>Question {index + 1}</strong>
                  <span>{question.marks} marks</span>
                </div>
                <p>{question.text}</p>

                {question.type === "multiple-choice" && question.options ? (
                  <div className={styles.optionList}>
                    {question.options.map((option) => (
                      <label key={option} className={styles.optionItem}>
                        <input
                          checked={answers[question.id] === option}
                          name={question.id}
                          onChange={() =>
                            setAnswers((current) => ({ ...current, [question.id]: option }))
                          }
                          type="radio"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <textarea
                    className={styles.textarea}
                    rows={question.type === "essay" ? 6 : 3}
                    value={answers[question.id] ?? ""}
                    onChange={(event) =>
                      setAnswers((current) => ({
                        ...current,
                        [question.id]: event.target.value,
                      }))
                    }
                    placeholder="Type your answer here"
                  />
                )}
              </div>
            ))}
          </div>

          {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

          <div className={styles.formActions}>
            <button className={styles.secondaryButton} onClick={() => setSelectedAssessmentId(null)} type="button">
              Save for later
            </button>
            <button className={styles.primaryButton} onClick={handleSubmit} type="button">
              Submit assessment
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
          <span className={styles.eyebrow}>Assessment center</span>
          <h2>Start, submit, and track classroom assessments</h2>
          <p>
            Pending work stays visible, submitted tasks remain easy to review, and
            graded items keep feedback close to the score.
          </p>
        </div>

        <div className={styles.filterGroup}>
          <button
            className={`${styles.filterButton} ${statusFilter === "all" ? styles.filterButtonActive : ""}`}
            onClick={() => setStatusFilter("all")}
            type="button"
          >
            All
          </button>
          <button
            className={`${styles.filterButton} ${statusFilter === "pending" ? styles.filterButtonActive : ""}`}
            onClick={() => setStatusFilter("pending")}
            type="button"
          >
            Pending
          </button>
          <button
            className={`${styles.filterButton} ${statusFilter === "submitted" ? styles.filterButtonActive : ""}`}
            onClick={() => setStatusFilter("submitted")}
            type="button"
          >
            Submitted
          </button>
          <button
            className={`${styles.filterButton} ${statusFilter === "graded" ? styles.filterButtonActive : ""}`}
            onClick={() => setStatusFilter("graded")}
            type="button"
          >
            Graded
          </button>
        </div>
      </header>

      <div className={styles.grid}>
        {filteredAssessments.map((assessment) => (
          <article key={assessment.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <span className={styles.subjectBadge}>{assessment.subject}</span>
                <h3>{assessment.title}</h3>
              </div>
              <span className={`${styles.statusBadge} ${styles[`status${assessment.status.charAt(0).toUpperCase()}${assessment.status.slice(1)}`]}`}>
                {assessment.status}
              </span>
            </div>

            <p className={styles.instructions}>{assessment.instructions}</p>

            <dl className={styles.metaGrid}>
              <div>
                <dt>Teacher</dt>
                <dd>{assessment.teacher}</dd>
              </div>
              <div>
                <dt>Deadline</dt>
                <dd>{new Date(assessment.dueDate).toLocaleString()}</dd>
              </div>
              <div>
                <dt>Total marks</dt>
                <dd>{assessment.totalMarks}</dd>
              </div>
              <div>
                <dt>Questions</dt>
                <dd>{assessment.questions.length}</dd>
              </div>
            </dl>

            {typeof assessment.obtainedMarks === "number" && (
              <div className={styles.scoreBanner}>
                Score: {assessment.obtainedMarks}/{assessment.totalMarks}
              </div>
            )}

            {assessment.submittedAt && (
              <p className={styles.submittedText}>
                Submitted {new Date(assessment.submittedAt).toLocaleString()}
              </p>
            )}

            <div className={styles.cardActions}>
              {assessment.status === "pending" ? (
                <button className={styles.primaryButton} onClick={() => handleOpenAssessment(assessment)} type="button">
                  Start assessment
                </button>
              ) : (
                <button className={styles.secondaryButton} onClick={() => handleOpenAssessment(assessment)} type="button">
                  Review answers
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Assessments;
