import { BrowserRouter, Route, Routes } from "react-router-dom";
import StudentDashboard from "./components/students/StudentDashboard";
import ClassTeacherDashboard from "./components/classteacher/ClassTeacherDashboard";
import SubjectTeacherDashboard from "./components/subjectteacher/SubjectTeacherDashboard";
import DeputyHeadDashboard from "./components/deputyhead/DeputyHeadDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudentDashboard />} />
        <Route path="/classteacher" element={<ClassTeacherDashboard />} />
        <Route path="/subjectTeacher" element={<SubjectTeacherDashboard />} />
        <Route path="/deputyhead" element={<DeputyHeadDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
