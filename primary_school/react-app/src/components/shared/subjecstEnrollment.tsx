import React from "react";
function StudentSubjectEnrollment() {
  let students = React.useState([]);
  return (
    <div>
      <select>
        <option>trial</option>
        <option>again</option>
        <option>check</option>
      </select>
    </div>
  );
}
export { StudentSubjectEnrollment };
