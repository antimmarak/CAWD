// Reports Generation

let currentReportData = [];

function loadFilterDropdowns() {
    const user = getCurrentUser();
    let classes;
    
    // Teachers only see their assigned classes
    if (user && user.role === 'teacher') {
        classes = getClassesForTeacher(user.id);
    } else {
        classes = getClasses();
    }
    
    const students = getStudents();

    // Load classes dropdown
    const classSelect = document.getElementById('filterClass');
    classSelect.innerHTML = '<option value="">All Classes</option>' +
        classes.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');

    // Load students dropdown (filter by teacher's classes if teacher)
    let filteredStudents = students;
    if (user && user.role === 'teacher') {
        const classIds = classes.map(c => c.id);
        filteredStudents = students.filter(s => classIds.includes(s.classId));
    }
    
    const studentSelect = document.getElementById('filterStudent');
    studentSelect.innerHTML = '<option value="">All Students</option>' +
        filteredStudents.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('');
}

function generateReport() {
    const user = getCurrentUser();
    const classId = document.getElementById('filterClass').value;
    const studentId = document.getElementById('filterStudent').value;
    const dateFrom = document.getElementById('filterDateFrom').value;
    const dateTo = document.getElementById('filterDateTo').value;

    let records = getAttendanceRecords();

    // Teachers only see records for their assigned classes
    if (user && user.role === 'teacher') {
        const classIds = getClassesForTeacher(user.id).map(c => c.id);
        records = records.filter(r => classIds.includes(r.classId));
    }

    // Apply filters
    if (classId) {
        records = records.filter(r => r.classId === classId);
    }

    if (studentId) {
        records = records.filter(r => r.studentId === studentId);
    }

    if (dateFrom && dateTo) {
        records = records.filter(r => r.date >= dateFrom && r.date <= dateTo);
    } else if (dateFrom) {
        records = records.filter(r => r.date >= dateFrom);
    } else if (dateTo) {
        records = records.filter(r => r.date <= dateTo);
    }

    // Sort by date (most recent first)
    records.sort((a, b) => new Date(b.date) - new Date(a.date));

    currentReportData = records;
    displayReport(records);
    displaySummary(records);
}

function displayReport(records) {
    const students = getStudents();
    const classes = getClasses();
    const tableBody = document.getElementById('reportTableBody');
    const table = document.getElementById('reportTable');
    const emptyState = document.getElementById('emptyReportState');
    const exportBtn = document.getElementById('exportBtn');

    if (records.length === 0) {
        table.style.display = 'none';
        emptyState.style.display = 'block';
        exportBtn.style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';
    table.style.display = 'table';
    exportBtn.style.display = 'inline-block';

    tableBody.innerHTML = records.map(record => {
        const student = students.find(s => s.id === record.studentId);
        const classItem = classes.find(c => c.id === record.classId);
        const statusIcon = record.status === 'present' ? '✅' : record.status === 'late' ? '⏰' : '❌';
        const statusText = record.status.charAt(0).toUpperCase() + record.status.slice(1);

        return `
            <tr>
                <td>${formatDate(record.date)}</td>
                <td>${student ? escapeHtml(student.name) : 'Unknown'}</td>
                <td>${classItem ? escapeHtml(classItem.name) : 'Unknown'}</td>
                <td>${statusIcon} ${statusText}</td>
            </tr>
        `;
    }).join('');
}

function displaySummary(records) {
    const summaryDiv = document.getElementById('reportSummary');
    const summaryStats = document.getElementById('summaryStats');

    if (records.length === 0) {
        summaryDiv.style.display = 'none';
        return;
    }

    summaryDiv.style.display = 'block';

    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;
    const total = records.length;
    const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

    summaryStats.innerHTML = `
        <div class="summary-card">
            <h3>${total}</h3>
            <p>Total Records</p>
        </div>
        <div class="summary-card">
            <h3>${present}</h3>
            <p>Present</p>
        </div>
        <div class="summary-card">
            <h3>${absent}</h3>
            <p>Absent</p>
        </div>
        <div class="summary-card">
            <h3>${late}</h3>
            <p>Late</p>
        </div>
        <div class="summary-card">
            <h3>${attendanceRate}%</h3>
            <p>Attendance Rate</p>
        </div>
    `;
}

function exportToCSV() {
    if (currentReportData.length === 0) {
        showToast('No data to export', 'error');
        return;
    }

    const students = getStudents();
    const classes = getClasses();

    // CSV header
    let csv = 'Date,Student Name,Email,Class,Status\n';

    // CSV rows
    currentReportData.forEach(record => {
        const student = students.find(s => s.id === record.studentId);
        const classItem = classes.find(c => c.id === record.classId);
        const status = record.status.charAt(0).toUpperCase() + record.status.slice(1);

        const date = formatDate(record.date);
        const studentName = student ? student.name : 'Unknown';
        const studentEmail = student ? student.email : '';
        const className = classItem ? classItem.name : 'Unknown';

        // Escape commas and quotes in CSV
        const escapeCSV = (str) => {
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        csv += `${escapeCSV(date)},${escapeCSV(studentName)},${escapeCSV(studentEmail)},${escapeCSV(className)},${escapeCSV(status)}\n`;
    });

    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Report exported successfully', 'success');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load dropdowns on page load
document.addEventListener('DOMContentLoaded', loadFilterDropdowns);

