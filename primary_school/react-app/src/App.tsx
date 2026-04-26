import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import StudentDashboard from "./components/students/StudentDashboard";
import LoginPage from "./components/auth/login";
import ErrorPage from "./components/error";
import ClassTeacherDashboard from "./components/classteacher/ClassTeacherDashboard";
import DeputyHeadDashboard from "./components/deputyhead/DeputyHeadDashboard";
import SubjectTeacherDashboard from "./components/subjectteacher/SubjectTeacherDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import LandingPage from "./components/landingPage";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const saved = localStorage.getItem("user");
  if (!saved) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/students" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
        <Route path="/classTeacher" element={<ProtectedRoute><ClassTeacherDashboard /></ProtectedRoute>} />
        <Route path="/deputyHead" element={<ProtectedRoute><DeputyHeadDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/subjectTeacher" element={<ProtectedRoute><SubjectTeacherDashboard /></ProtectedRoute>} />
        
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
