import { BrowserRouter, Route, Routes } from "react-router-dom";
import StudentDashboard from "./components/students/StudentDashboard";
import ClassTeacherDashboard from "./components/classteacher/ClassTeacherDashboard";
import SubjectTeacherDashboard from "./components/subjectteacher/SubjectTeacherDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudentDashboard />} />
        <Route path="/classteacher" element={<ClassTeacherDashboard />} />
        <Route path="/subjectTeacher" element={<SubjectTeacherDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
