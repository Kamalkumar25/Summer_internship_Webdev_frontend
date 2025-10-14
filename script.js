async function addStudent() {
  let name = document.getElementById('studentName').value;
  if (name.trim() === '') {
    alert("Please enter a valid student name");
    return;
  }

  try {
    const response = await fetch('https://f0g2sv37p3.execute-api.us-east-1.amazonaws.com/prod/add-student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });

    if (!response.ok) {
      throw new Error("Failed to add student");
    }

    const newStudent = await response.json();
    students.push(newStudent);  // This assumes you are maintaining local state as well
    document.getElementById('studentName').value = "";
    renderTable();
  } catch (error) {
    console.error("Error adding student:", error);
    alert("Error adding student. See console for details.");
  }
}
