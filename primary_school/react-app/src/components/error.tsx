// components/ErrorPage.tsx
import { useEffect, useState } from "react";
import styles from "./error.module.css";

const ErrorPage = () => {
  const [mounted, setMounted] = useState(false);
  const [dots, setDots] = useState(0);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setDots((d) => (d + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const dotsStr = ".".repeat(dots);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.bgGrid} />
      <div className={styles.bgCircle1} />
      <div className={styles.bgCircle2} />

      <div className={`${styles.card} ${mounted ? styles.cardMounted : ""}`}>
        {/* Crest Icon */}
        <div className={styles.iconWrap}>
          <div className={styles.crest}>
            <svg
              viewBox="0 0 38 38"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 8L4 15.5L19 23L34 15.5L19 8Z"
                fill="var(--gold)"
                opacity="0.9"
              />
              <path
                d="M10 19v7c0 0 3.5 4 9 4s9-4 9-4v-7"
                stroke="var(--gold)"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
                opacity="0.7"
              />
              <line
                x1="34"
                y1="15.5"
                x2="34"
                y2="24"
                stroke="var(--gold)"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.6"
              />
              <circle
                cx="34"
                cy="25"
                r="1.5"
                fill="var(--gold)"
                opacity="0.6"
              />
            </svg>
          </div>
        </div>

        {/* Error Code */}
        <div className={styles.errorCode}>404</div>
        <div className={styles.divider} />
        <h1 className={styles.pageTitle}>Page Not Found</h1>

        <p className={styles.description}>
          The page you're looking for doesn't exist or may have been moved.
          Please check the URL or navigate back to the dashboard.
        </p>

        {/* Status indicator */}
        <div className={styles.statusRow}>
          <div className={styles.statusDot} />
          <span className={styles.statusText}>Route unresolved{dotsStr}</span>
        </div>

        {/* Action buttons */}
        <div className={styles.btnGroup}>
          <button
            className={styles.btnSecondary}
            onClick={() => window.history.back()}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Go Back
          </button>
        </div>

        {/* Footer */}
        <p className={styles.footerNote}>
          Need help? Contact <strong>system support</strong> or your school
          administrator.
        </p>
      </div>
    </div>
  );
};

export default ErrorPage;
