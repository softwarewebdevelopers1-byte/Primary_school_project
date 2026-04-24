import { BrowserRouter, Route, Routes } from "react-router-dom";
import StudentDashboard from "./components/students/StudentDashboard";
import LoginPage from "./components/auth/login";
import ErrorPage from "./components/error";
import ClassTeacherDashboard from "./components/classteacher/ClassTeacherDashboard";
import DeputyHeadDashboard from "./components/deputyhead/DeputyHeadDashboard";
import SubjectTeacherDashboard from "./components/subjectteacher/SubjectTeacherDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/students" element={<StudentDashboard />} />
        <Route path="/classTeacher" element={<ClassTeacherDashboard />} />
        <Route path="/deputyHead" element={<DeputyHeadDashboard />} />
        <Route path="/admin" element={<AdminDashboard></AdminDashboard>} />
        <Route path="/subjectTeacher" element={<SubjectTeacherDashboard />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
