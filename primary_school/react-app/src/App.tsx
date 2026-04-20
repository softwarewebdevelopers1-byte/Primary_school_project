import { BrowserRouter, Route, Routes } from "react-router-dom";
import StudentDashboard from "./components/students/StudentDashboard";
import ClassTeacherDashboard from "./components/classteacher/ClassTeacherDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudentDashboard />} />
        <Route path="/classteacher" element={<ClassTeacherDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
