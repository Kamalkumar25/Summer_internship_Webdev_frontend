let students = JSON.parse(localStorage.getItem("students")) || [];

function renderTable(filter = "All") {
  const tableBody = document.getElementById("studentTable");
  tableBody.innerHTML = "";

  let filteredStudents = students;
  if (filter === "Present") filteredStudents = students.filter(s => s.status === "Present");
  else if (filter === "Absent") filteredStudents = students.filter(s => s.status === "Absent");

  filteredStudents.forEach((student, index) => {
    const actualIndex = students.findIndex(s => s.name === student.name);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${student.name}</td>
      <td>
        <span class="badge ${student.status === 'Present' ? 'bg-success' :
                            student.status === 'Absent' ? 'bg-danger' : 'bg-secondary'}">
          ${student.status || "Not Marked"}
        </span>
      </td>
      <td>
        <button class="btn btn-outline-success btn-sm me-1" onclick="markAttendance(${actualIndex}, 'Present')"><i class="fa-solid fa-check"></i></button>
        <button class="btn btn-outline-danger btn-sm me-1" onclick="markAttendance(${actualIndex}, 'Absent')"><i class="fa-solid fa-xmark"></i></button>
        <button class="btn btn-outline-secondary btn-sm" onclick="deleteStudent(${actualIndex})"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  updateSummary();
}

function addStudent() {
  const name = document.getElementById("studentName").value.trim();
  if (!name) return alert("Please enter a student name.");
  students.push({ name, status: "Not Marked" });
  localStorage.setItem("students", JSON.stringify(students));
  document.getElementById("studentName").value = "";
  renderTable();
}

function markAttendance(index, status) {
  students[index].status = status;
  localStorage.setItem("students", JSON.stringify(students));
  renderTable();
}

function deleteStudent(index) {
  if (confirm(`Do you really want to delete ${students[index].name}?`)) {
    students.splice(index, 1);
    localStorage.setItem("students", JSON.stringify(students));
    renderTable();
  }
}

function filterAttendance(type) { renderTable(type); }
function resetFilter() { renderTable("All"); }

function clearAll() {
  if (confirm("Do you want to clear all attendance records?")) {
    students = [];
    localStorage.removeItem("students");
    renderTable();
  }
}

function updateSummary() {
  document.getElementById("totalStudents").textContent = students.length;
  document.getElementById("presentCount").textContent = students.filter(s => s.status === "Present").length;
  document.getElementById("absentCount").textContent = students.filter(s => s.status === "Absent").length;
}

function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Format current date (Report Generated)
  const now = new Date();
  const formattedGeneratedDate = String(now.getDate()).padStart(2, '0') + '-' +
                                 String(now.getMonth() + 1).padStart(2, '0') + '-' +
                                 now.getFullYear();

  // Get attendance date from input
  const attendanceDateValue = document.getElementById("attendanceDate").value;
  let formattedAttendanceDate = "Not Selected";
  if (attendanceDateValue) {
    const dateObj = new Date(attendanceDateValue);
    formattedAttendanceDate = String(dateObj.getDate()).padStart(2, '0') + '-' +
                              String(dateObj.getMonth() + 1).padStart(2, '0') + '-' +
                              dateObj.getFullYear();
  }

  // PDF Header
  doc.setFontSize(16);
  doc.text("Student Attendance Report", 14, 15);
  doc.setFontSize(11);
  doc.text(`Report Generated On: ${formattedGeneratedDate}`, 14, 25);
  doc.text(`Attendance Taken On: ${formattedAttendanceDate}`, 14, 32);
  doc.text(`Total Students: ${students.length}`, 150, 25, { align: "right" });

  const presentCount = students.filter(s => s.status === 'Present').length;
  const absentCount = students.filter(s => s.status === 'Absent').length;

  doc.text(`Present: ${presentCount}`, 150, 32, { align: "right" });
  doc.text(`Absent: ${absentCount}`, 150, 39, { align: "right" });

  // Table Data
  const tableData = students.map((s, i) => [i + 1, s.name, s.status || "Not Marked"]);
  doc.autoTable({
    head: [["#", "Name", "Status"]],
    body: tableData,
    startY: 45,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 11 }
  });

  doc.save(`Attendance_Report_${formattedGeneratedDate}.pdf`);
}

function downloadExcel() {
  // Format date
  const now = new Date();
  const formattedGeneratedDate = String(now.getDate()).padStart(2, '0') + '-' +
                                 String(now.getMonth() + 1).padStart(2, '0') + '-' +
                                 now.getFullYear();

  const attendanceDateValue = document.getElementById("attendanceDate").value;
  let formattedAttendanceDate = "Not Selected";
  if (attendanceDateValue) {
    const dateObj = new Date(attendanceDateValue);
    formattedAttendanceDate = String(dateObj.getDate()).padStart(2, '0') + '-' +
                              String(dateObj.getMonth() + 1).padStart(2, '0') + '-' +
                              dateObj.getFullYear();
  }

  const wsData = [
    ["Student Attendance Report"],
    [`Report Generated On: ${formattedGeneratedDate}`],
    [`Attendance Taken On: ${formattedAttendanceDate}`],
    [],
    ["S.No", "Name", "Status"],
    ...students.map((s, i) => [i + 1, s.name, s.status || "Not Marked"])
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Attendance");
  XLSX.writeFile(wb, `Attendance_Report_${formattedGeneratedDate}.xlsx`);
}

renderTable();
