// Attendance Marking

let currentClassId = null;
let currentDate = null;
let studentsList = [];

function loadClassDropdown() {
    const user = getCurrentUser();
    let classes;
    
    // Teachers only see their assigned classes
    if (user && user.role === 'teacher') {
        classes = getClassesForTeacher(user.id);
    } else {
        classes = getClasses();
    }
    
    const select = document.getElementById('classSelect');
    select.innerHTML = '<option value="">Select a class</option>' +
        classes.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
    
    if (classes.length === 0 && user && user.role === 'teacher') {
        select.innerHTML = '<option value="">No classes assigned. Contact admin.</option>';
    }
}

function loadStudentsForAttendance() {
    const classId = document.getElementById('classSelect').value;
    const date = document.getElementById('dateSelect').value;

    if (!classId || !date) {
        showToast('Please select both class and date', 'error');
        return;
    }

    currentClassId = classId;
    currentDate = date;

    const students = getStudentsByClass(classId);
    const existingRecords = getAttendanceByDateAndClass(date, classId);

    if (students.length === 0) {
        document.getElementById('attendanceSection').style.display = 'none';
        document.getElementById('noStudentsMessage').style.display = 'block';
        return;
    }

    document.getElementById('noStudentsMessage').style.display = 'none';
    document.getElementById('attendanceSection').style.display = 'block';

    studentsList = students;
    const attendanceList = document.getElementById('attendanceList');

    attendanceList.innerHTML = students.map(student => {
        const existingRecord = existingRecords.find(r => r.studentId === student.id);
        const status = existingRecord ? existingRecord.status : 'present';

        return `
            <div class="attendance-item">
                <div class="attendance-student-info">
                    <strong>${escapeHtml(student.name)}</strong>
                    <span>${escapeHtml(student.email)}</span>
                </div>
                <div class="attendance-status">
                    <label class="radio-label">
                        <input type="radio" name="status_${student.id}" value="present" ${status === 'present' ? 'checked' : ''}>
                        <span>✅ Present</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="status_${student.id}" value="late" ${status === 'late' ? 'checked' : ''}>
                        <span>⏰ Late</span>
                    </label>
                    <label class="radio-label">
                        <input type="radio" name="status_${student.id}" value="absent" ${status === 'absent' ? 'checked' : ''}>
                        <span>❌ Absent</span>
                    </label>
                </div>
            </div>
        `;
    }).join('');
}

function markAllPresent() {
    studentsList.forEach(student => {
        const radio = document.querySelector(`input[name="status_${student.id}"][value="present"]`);
        if (radio) radio.checked = true;
    });
}

function markAllAbsent() {
    studentsList.forEach(student => {
        const radio = document.querySelector(`input[name="status_${student.id}"][value="absent"]`);
        if (radio) radio.checked = true;
    });
}

function saveAttendance() {
    if (!currentClassId || !currentDate) {
        showToast('Please select class and date first', 'error');
        return;
    }

    if (studentsList.length === 0) {
        showToast('No students to save', 'error');
        return;
    }

    let savedCount = 0;
    studentsList.forEach(student => {
        const selectedRadio = document.querySelector(`input[name="status_${student.id}"]:checked`);
        if (selectedRadio) {
            const status = selectedRadio.value;
            addAttendanceRecord({
                studentId: student.id,
                classId: currentClassId,
                date: currentDate,
                status: status
            });
            savedCount++;
        }
    });

    if (savedCount > 0) {
        showToast(`Attendance saved for ${savedCount} student(s)`, 'success');
    } else {
        showToast('No attendance data to save', 'error');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load class dropdown on page load
document.addEventListener('DOMContentLoaded', loadClassDropdown);

