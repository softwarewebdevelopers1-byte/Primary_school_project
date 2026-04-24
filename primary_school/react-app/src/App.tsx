import { BrowserRouter, Route, Routes } from "react-router-dom";
import StudentDashboard from "./components/students/StudentDashboard";
import SubjectTeacherDashboard from "./components/subjectteacher/SubjectTeacherDashboard";
import LoginPage from "./components/auth/login";
import ErrorPage from "./components/error";
import ClassTeacherDashboard from "./components/classteacher/ClassTeacherDashboard";
import DeputyHeadDashboard from "./components/deputyhead/DeputyHeadDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/students" element={<StudentDashboard />} />
        <Route path="/classTeacher" element={<ClassTeacherDashboard />} />
        <Route path="/subjectTeacher" element={<SubjectTeacherDashboard />} />
        <Route path="/deputyHead" element={<DeputyHeadDashboard />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
