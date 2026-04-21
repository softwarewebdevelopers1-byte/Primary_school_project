// components/auth/LoginPage.tsx

import React, { useState } from "react";
import styles from "./LoginPage.module.css";

// Mock user database - simulates what would come from backend
const mockUsers = [
  {
    id: "1",
    email: "superadmin@school.com",
    password: "admin123",
    role: "superadmin",
    name: "Super Admin",
    avatar:
      "https://ui-avatars.com/api/?name=Super+Admin&background=EF4444&color=fff",
  },
  {
    id: "2",
    email: "admin@school.com",
    password: "admin123",
    role: "admin",
    name: "School Admin",
    avatar:
      "https://ui-avatars.com/api/?name=School+Admin&background=4F46E5&color=fff",
  },
  {
    id: "3",
    email: "headteacher@school.com",
    password: "head123",
    role: "headteacher",
    name: "John Mwangi",
    avatar:
      "https://ui-avatars.com/api/?name=John+Mwangi&background=10B981&color=fff",
  },
  {
    id: "4",
    email: "deputy@school.com",
    password: "deputy123",
    role: "deputy",
    name: "Jane Wanjiku",
    avatar:
      "https://ui-avatars.com/api/?name=Jane+Wanjiku&background=F59E0B&color=fff",
  },
  {
    id: "5",
    email: "teacher@school.com",
    password: "teacher123",
    role: "teacher",
    name: "Peter Otieno",
    subject: "Mathematics",
    avatar:
      "https://ui-avatars.com/api/?name=Peter+Otieno&background=8B5CF6&color=fff",
  },
  {
    id: "6",
    email: "classteacher@school.com",
    password: "class123",
    role: "classteacher",
    name: "Mary Achieng",
    class: "Grade 7A",
    avatar:
      "https://ui-avatars.com/api/?name=Mary+Achieng&background=EC4899&color=fff",
  },
];

interface LoginPageProps {
  onLogin?: (user: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Find user in mock database
    const user = mockUsers.find(
      (u) => u.email === email && u.password === password,
    );

    if (!user) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
      return;
    }

    // Store user data in localStorage/sessionStorage
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        ...(user.subject && { subject: user.subject }),
        ...(user.class && { class: user.class }),
      }),
    );

    // Call the onLogin callback if provided
    if (onLogin) {
      onLogin(user);
    } else {
      // Redirect based on role
      switch (user.role) {
        case "student":
          window.location.href = "/students";
          break;
        case "headteacher":
          window.location.href = "/deputyHead";
          break;
        case "deputy":
          window.location.href = "/deputyHead";
          break;
        case "classteacher":
          window.location.href = "/classTeacher";
          break;
        case "teacher":
          window.location.href = "/subjectTeacher";
          break;
        default:
          window.location.href = "/dashboard";
      }
    }

    setLoading(false);
  };

  const handleDemoLogin = (role: string) => {
    const demoUser = mockUsers.find((u) => u.role === role);
    if (demoUser) {
      setEmail(demoUser.email);
      setPassword(demoUser.password);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginWrapper}>
        {/* Left Side - Branding */}
        <div className={styles.brandSection}>
          <div className={styles.brandContent}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>🏫</span>
              <span className={styles.logoText}>School Management System</span>
            </div>
            <h1>Welcome Back!</h1>
            <p>
              Login to access your dashboard and manage school activities
              efficiently.
            </p>
            <div className={styles.features}>
              <div className={styles.feature}>
                <span>📊</span>
                <span>Real-time Analytics</span>
              </div>
              <div className={styles.feature}>
                <span>👨‍🎓</span>
                <span>Student Management</span>
              </div>
              <div className={styles.feature}>
                <span>📝</span>
                <span>Assessment & Grading</span>
              </div>
              <div className={styles.feature}>
                <span>📧</span>
                <span>Parent Communication</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className={styles.formSection}>
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              <h2>Sign In</h2>
              <p>Enter your credentials to access your account</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label htmlFor="email">Email Address</label>
                <div className={styles.inputIcon}>
                  <span className={styles.icon}>📧</span>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="password">Password</label>
                <div className={styles.inputIcon}>
                  <span className={styles.icon}>🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {error && (
                <div className={styles.errorMessage}>
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <div className={styles.formOptions}>
                <label className={styles.rememberMe}>
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <a href="#" className={styles.forgotPassword}>
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                className={styles.loginBtn}
                disabled={loading}
              >
                {loading ? <span className={styles.loader}></span> : "Sign In"}
              </button>
            </form>

            <div className={styles.demoSection}>
              <p className={styles.demoTitle}>Demo Credentials</p>
              <div className={styles.demoButtons}>
                <button
                  className={styles.demoBtn}
                  onClick={() => handleDemoLogin("superadmin")}
                >
                  Super Admin
                </button>
                <button
                  className={styles.demoBtn}
                  onClick={() => handleDemoLogin("admin")}
                >
                  Admin
                </button>
                <button
                  className={styles.demoBtn}
                  onClick={() => handleDemoLogin("headteacher")}
                >
                  Head Teacher
                </button>
                <button
                  className={styles.demoBtn}
                  onClick={() => handleDemoLogin("deputy")}
                >
                  Deputy Head
                </button>
                <button
                  className={styles.demoBtn}
                  onClick={() => handleDemoLogin("classteacher")}
                >
                  Class Teacher
                </button>
                <button
                  className={styles.demoBtn}
                  onClick={() => handleDemoLogin("teacher")}
                >
                  Subject Teacher
                </button>
              </div>
              <p className={styles.demoNote}>
                Click any demo button to auto-fill credentials
              </p>
            </div>

            <div className={styles.footerNote}>
              <p>© 2024 School Management System. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
