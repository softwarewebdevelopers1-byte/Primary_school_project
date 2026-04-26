// components/auth/LoginPage.tsx

import React, { useState, useEffect } from "react";
import styles from "./LoginPage.module.css";
import { api } from "../../lib/api";

const roleLabels: Record<string, string> = {
  superadmin: "Super Admin",
  admin: "Admin",
  headteacher: "Head Teacher",
  deputyteacher: "Deputy Head",
  classteacher: "Class Teacher",
  subjectteacher: "Subject Teacher",
};

// SVG Icon Components
const EyeIcon: React.FC<{ open: boolean }> = ({ open }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

const MailIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const LockIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const WarnIcon: React.FC = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const HomeIcon: React.FC = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const FeatureIcon: React.FC<{ d: string }> = ({ d }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

interface LoginPageProps {
  onLogin?: (user: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response: any = await api.post("/users/login", { email, password });
      
      // Store user data in localStorage
      localStorage.setItem(
        "user",
        JSON.stringify(response),
      );

      const user = response.user;
      if (onLogin) {
        onLogin(user);
      } else {
        const primaryRole = user.primaryRole;
        const paths: Record<string, string> = {
          superadmin: "/admin",
          admin: "/admin",
          headteacher: "/headteacher",
          deputyteacher: "/deputyHead",
          classteacher: "/classTeacher",
          subjectteacher: "/subjectTeacher",
          student: "/students",
        };
        window.location.href = paths[primaryRole] || "/dashboard";
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: string) => {
    const user = mockUsers.find((x) => x.role === role);
    if (user) {
      setEmail(user.email);
      setPassword(user.password);
      setActiveDemo(role);
      setError("");
    }
  };

  const features = [
    { icon: "M18 20V10M12 20V4M6 20v-6", label: "Real-time Analytics" },
    {
      icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
      label: "Student Management",
    },
    {
      icon: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
      label: "Assessment & Grading",
    },
    {
      icon: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
      label: "Parent Communication",
    },
  ];

  return (
    <div
      className={`${styles.loginContainer} ${mounted ? styles.mounted : ""}`}
    >
      <div className={styles.loginWrapper}>
        {/* Left Panel - Branding Section */}
        <div className={styles.leftPanel}>
          {/* Decorative elements */}
          <div className={styles.decorativeCircle1} />
          <div className={styles.decorativeCircle2} />
          <div className={styles.decorativeCircle3} />

          <div className={styles.leftContent}>
            {/* Logo */}
            <div className={styles.logo}>
              <div className={styles.logoIcon}>
                <HomeIcon />
              </div>
              <span className={styles.logoText}>School Management</span>
            </div>

            {/* Heading */}
            <h1 className={styles.welcomeTitle}>
              Welcome
              <br />
              <em className={styles.welcomeEmphasis}>back.</em>
            </h1>
            <p className={styles.welcomeDescription}>
              Access your dashboard and manage school activities with clarity
              and ease.
            </p>

            {/* Features List */}
            <div className={styles.featuresList}>
              {features.map(({ icon, label }) => (
                <div key={label} className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <FeatureIcon d={icon} />
                  </div>
                  <span className={styles.featureLabel}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className={styles.leftFooter}>
            <div className={styles.footerDivider} />
            <p className={styles.copyright}>© 2024 School Management System</p>
          </div>
        </div>

        {/* Right Panel - Form Section */}
        <div className={styles.rightPanel}>
          <div className={styles.formContainer}>
            {/* Header */}
            <div className={styles.formHeader}>
              <p className={styles.formSubtitle}>Portal Access</p>
              <h2 className={styles.formTitle}>Sign in to your account</h2>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Email Field */}
              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.inputLabel}>
                  Email Address
                </label>
                <div className={styles.inputWrapper}>
                  <span
                    className={`${styles.inputIcon} ${focusedField === "email" ? styles.inputIconFocused : ""}`}
                  >
                    <MailIcon />
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="your@school.com"
                    required
                    autoComplete="email"
                    className={`${styles.input} ${focusedField === "email" ? styles.inputFocused : ""}`}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className={styles.inputGroup}>
                <label htmlFor="password" className={styles.inputLabel}>
                  Password
                </label>
                <div className={styles.inputWrapper}>
                  <span
                    className={`${styles.inputIcon} ${focusedField === "password" ? styles.inputIconFocused : ""}`}
                  >
                    <LockIcon />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className={`${styles.input} ${styles.inputWithRightPadding} ${focusedField === "password" ? styles.inputFocused : ""}`}
                  />
                  <button
                    type="button"
                    className={styles.eyeButton}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className={styles.formOptions}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" className={styles.checkbox} />
                  <span>Remember me</span>
                </label>
                <a href="#" className={styles.forgotLink}>
                  Forgot password?
                </a>
              </div>

              {/* Error Message */}
              {error && (
                <div className={styles.errorMessage}>
                  <span className={styles.errorIcon}>
                    <WarnIcon />
                  </span>
                  <span className={styles.errorText}>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? <span className={styles.loader} /> : "Sign In"}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
