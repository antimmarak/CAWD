// Students Management

let editingStudentId = null;

function loadStudents() {
    const students = getStudents();
    const classes = getClasses();
    const tableBody = document.getElementById('studentsTableBody');
    const emptyState = document.getElementById('emptyState');

    if (students.length === 0) {
        tableBody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    tableBody.innerHTML = students.map(student => {
        const classItem = classes.find(c => c.id === student.classId);
        return `
            <tr>
                <td>${escapeHtml(student.name)}</td>
                <td>${escapeHtml(student.email)}</td>
                <td>${classItem ? escapeHtml(classItem.name) : 'Unassigned'}</td>
                <td>${formatDate(student.enrollmentDate)}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editStudent('${student.id}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteStudentHandler('${student.id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

function loadClassDropdown() {
    const classes = getClasses();
    const select = document.getElementById('studentClass');
    select.innerHTML = '<option value="">Select a class</option>' +
        classes.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
}

function openAddStudentModal() {
    editingStudentId = null;
    document.getElementById('modalTitle').textContent = 'Add Student';
    document.getElementById('studentForm').reset();
    document.getElementById('studentEnrollmentDate').value = getTodayDate();
    loadClassDropdown();
    document.getElementById('studentModal').style.display = 'flex';
}

function closeStudentModal() {
    document.getElementById('studentModal').style.display = 'none';
    editingStudentId = null;
    document.getElementById('studentForm').reset();
}

function editStudent(id) {
    const student = getStudentById(id);
    if (!student) return;

    editingStudentId = id;
    document.getElementById('modalTitle').textContent = 'Edit Student';
    document.getElementById('studentName').value = student.name;
    document.getElementById('studentEmail').value = student.email;
    document.getElementById('studentEnrollmentDate').value = student.enrollmentDate;
    loadClassDropdown();
    document.getElementById('studentClass').value = student.classId;
    document.getElementById('studentModal').style.display = 'flex';
}

function deleteStudentHandler(id) {
    const student = getStudentById(id);
    if (!student) return;

    showConfirmModal(`Delete student "${student.name}"?`, () => {
        deleteStudent(id);
        showToast('Student deleted successfully', 'success');
        loadStudents();
    });
}

function filterStudents() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#studentsTableBody tr');
    const classes = getClasses();
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length === 0) return;
        
        const name = cells[0].textContent.toLowerCase();
        const email = cells[1].textContent.toLowerCase();
        const className = cells[2].textContent.toLowerCase();
        
        const matches = name.includes(searchTerm) || 
                       email.includes(searchTerm) || 
                       className.includes(searchTerm);
        
        row.style.display = matches ? '' : 'none';
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Handle form submission
document.getElementById('studentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!validateForm(this)) {
        showToast('Please fill in all required fields correctly', 'error');
        return;
    }

    const studentData = {
        name: document.getElementById('studentName').value.trim(),
        email: document.getElementById('studentEmail').value.trim(),
        classId: document.getElementById('studentClass').value,
        enrollmentDate: document.getElementById('studentEnrollmentDate').value
    };

    const validation = validateStudentData(studentData);
    if (!validation.valid) {
        showToast(validation.error, 'error');
        return;
    }

    if (editingStudentId) {
        updateStudent(editingStudentId, studentData);
        showToast('Student updated successfully', 'success');
    } else {
        addStudent(studentData);
        showToast('Student added successfully', 'success');
    }

    closeStudentModal();
    loadStudents();
});

// Close modal on overlay click
document.getElementById('studentModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeStudentModal();
    }
});

// Import Students Functions
let importData = [];

function downloadTemplate() {
    const classes = getClasses();
    const sampleClass = classes.length > 0 ? classes[0].name : 'Mathematics';
    
    const csvContent = `Name,Email,Class Name,Enrollment Date
John Doe,john.doe@example.com,${sampleClass},2024-01-15
Jane Smith,jane.smith@example.com,${sampleClass},2024-01-15
Mike Johnson,mike.johnson@example.com,${sampleClass},2024-01-15`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'students_import_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Template downloaded successfully', 'success');
}

function openImportModal() {
    document.getElementById('importModal').style.display = 'flex';
    document.getElementById('csvFile').value = '';
    document.getElementById('importPreview').style.display = 'none';
    document.getElementById('importErrors').style.display = 'none';
    document.getElementById('importBtn').disabled = true;
    importData = [];
}

function closeImportModal() {
    document.getElementById('importModal').style.display = 'none';
    document.getElementById('csvFile').value = '';
    document.getElementById('importPreview').style.display = 'none';
    document.getElementById('importErrors').style.display = 'none';
    importData = [];
}

function parseCSV(text) {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return [];
    
    // Parse CSV line handling quoted values
    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    // Escaped quote
                    current += '"';
                    i++;
                } else {
                    // Toggle quote state
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    }
    
    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/"/g, ''));
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length >= 3) {
            const row = {};
            headers.forEach((header, index) => {
                let value = (values[index] || '').replace(/^"|"$/g, '').trim();
                row[header] = value;
            });
            data.push(row);
        }
    }
    
    return data;
}

function previewImport(data) {
    const previewDiv = document.getElementById('previewTable');
    const classes = getClasses();
    
    if (data.length === 0) {
        previewDiv.innerHTML = '<p style="color: var(--text-secondary);">No data to preview</p>';
        return;
    }
    
    let html = '<table style="width: 100%; font-size: 0.875rem; border-collapse: collapse;">';
    html += '<thead><tr style="background: var(--bg-color);"><th style="padding: 0.5rem; text-align: left;">Name</th><th style="padding: 0.5rem; text-align: left;">Email</th><th style="padding: 0.5rem; text-align: left;">Class</th><th style="padding: 0.5rem; text-align: left;">Date</th></tr></thead>';
    html += '<tbody>';
    
    const previewRows = data.slice(0, 5);
    previewRows.forEach(row => {
        const className = row['class name'] || row['classname'] || '';
        const classExists = classes.find(c => c.name.toLowerCase() === className.toLowerCase());
        const statusClass = classExists ? '' : 'style="color: var(--danger-color);"';
        
        html += `<tr ${statusClass}>`;
        html += `<td style="padding: 0.5rem;">${escapeHtml(row.name || '')}</td>`;
        html += `<td style="padding: 0.5rem;">${escapeHtml(row.email || '')}</td>`;
        html += `<td style="padding: 0.5rem;">${escapeHtml(className)} ${!classExists ? '⚠️' : ''}</td>`;
        html += `<td style="padding: 0.5rem;">${escapeHtml(row['enrollment date'] || row['enrollmentdate'] || '')}</td>`;
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    if (data.length > 5) {
        html += `<p style="margin-top: 0.5rem; color: var(--text-secondary); font-size: 0.875rem;">... and ${data.length - 5} more rows</p>`;
    }
    
    previewDiv.innerHTML = html;
}

function validateImportData(data) {
    const errors = [];
    const classes = getClasses();
    const existingStudents = getStudents();
    const classMap = {};
    
    classes.forEach(c => {
        classMap[c.name.toLowerCase()] = c.id;
    });
    
    data.forEach((row, index) => {
        const lineNum = index + 2; // +2 because index starts at 0 and header is line 1
        
        if (!row.name || row.name.trim() === '') {
            errors.push(`Line ${lineNum}: Name is required`);
        }
        
        if (!row.email || row.email.trim() === '') {
            errors.push(`Line ${lineNum}: Email is required`);
        } else if (!validateEmail(row.email)) {
            errors.push(`Line ${lineNum}: Invalid email format (${row.email})`);
        }
        
        // Check for duplicate email
        if (existingStudents.find(s => s.email.toLowerCase() === row.email.toLowerCase())) {
            errors.push(`Line ${lineNum}: Email already exists (${row.email})`);
        }
        
        const className = (row['class name'] || row['classname'] || '').trim();
        if (!className) {
            errors.push(`Line ${lineNum}: Class name is required`);
        } else if (!classMap[className.toLowerCase()]) {
            errors.push(`Line ${lineNum}: Class "${className}" does not exist`);
        }
        
        const enrollmentDate = row['enrollment date'] || row['enrollmentdate'] || '';
        if (!enrollmentDate) {
            errors.push(`Line ${lineNum}: Enrollment date is required`);
        } else if (!/^\d{4}-\d{2}-\d{2}$/.test(enrollmentDate)) {
            errors.push(`Line ${lineNum}: Invalid date format. Use YYYY-MM-DD (${enrollmentDate})`);
        }
    });
    
    return errors;
}

function processImport() {
    if (importData.length === 0) {
        showToast('Please select a CSV file first', 'error');
        return;
    }
    
    const errors = validateImportData(importData);
    
    if (errors.length > 0) {
        const errorsDiv = document.getElementById('importErrors');
        errorsDiv.style.display = 'block';
        errorsDiv.innerHTML = `
            <div style="background: #fef2f2; border-left: 4px solid var(--danger-color); padding: 1rem; border-radius: var(--radius);">
                <strong style="color: var(--danger-color); display: block; margin-bottom: 0.5rem;">Errors found (${errors.length}):</strong>
                <ul style="margin: 0; padding-left: 1.5rem; color: var(--text-secondary); font-size: 0.875rem;">
                    ${errors.slice(0, 10).map(e => `<li>${escapeHtml(e)}</li>`).join('')}
                    ${errors.length > 10 ? `<li>... and ${errors.length - 10} more errors</li>` : ''}
                </ul>
            </div>
        `;
        showToast(`Found ${errors.length} error(s). Please fix them before importing.`, 'error');
        return;
    }
    
    // Import valid data
    const classes = getClasses();
    const classMap = {};
    classes.forEach(c => {
        classMap[c.name.toLowerCase()] = c.id;
    });
    
    let imported = 0;
    let skipped = 0;
    
    importData.forEach(row => {
        const className = (row['class name'] || row['classname'] || '').trim();
        const classId = classMap[className.toLowerCase()];
        
        if (classId) {
            const studentData = {
                name: row.name.trim(),
                email: row.email.trim(),
                classId: classId,
                enrollmentDate: row['enrollment date'] || row['enrollmentdate'] || getTodayDate()
            };
            
            const validation = validateStudentData(studentData);
            if (validation.valid) {
                // Check if student already exists
                const existing = getStudents().find(s => s.email.toLowerCase() === studentData.email.toLowerCase());
                if (!existing) {
                    addStudent(studentData);
                    imported++;
                } else {
                    skipped++;
                }
            } else {
                skipped++;
            }
        } else {
            skipped++;
        }
    });
    
    if (imported > 0) {
        showToast(`Successfully imported ${imported} student(s)${skipped > 0 ? `, ${skipped} skipped` : ''}`, 'success');
        closeImportModal();
        loadStudents();
    } else {
        showToast('No students were imported. Please check your data.', 'error');
    }
}

// Handle CSV file input
document.addEventListener('DOMContentLoaded', function() {
    const csvFileInput = document.getElementById('csvFile');
    if (csvFileInput) {
        csvFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) {
                importData = [];
                document.getElementById('importPreview').style.display = 'none';
                document.getElementById('importErrors').style.display = 'none';
                document.getElementById('importBtn').disabled = true;
                return;
            }
            
            if (!file.name.toLowerCase().endsWith('.csv')) {
                showToast('Please select a CSV file', 'error');
                e.target.value = '';
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const text = event.target.result;
                    importData = parseCSV(text);
                    
                    if (importData.length === 0) {
                        showToast('No data found in CSV file', 'error');
                        document.getElementById('importPreview').style.display = 'none';
                        document.getElementById('importBtn').disabled = true;
                        return;
                    }
                    
                    previewImport(importData);
                    document.getElementById('importPreview').style.display = 'block';
                    document.getElementById('importErrors').style.display = 'none';
                    document.getElementById('importBtn').disabled = false;
                    
                    // Validate and show errors if any
                    const errors = validateImportData(importData);
                    if (errors.length > 0) {
                        const errorsDiv = document.getElementById('importErrors');
                        errorsDiv.style.display = 'block';
                        errorsDiv.innerHTML = `
                            <div style="background: #fef2f2; border-left: 4px solid var(--danger-color); padding: 1rem; border-radius: var(--radius); margin-top: 1rem;">
                                <strong style="color: var(--danger-color); display: block; margin-bottom: 0.5rem;">Errors found (${errors.length}):</strong>
                                <ul style="margin: 0; padding-left: 1.5rem; color: var(--text-secondary); font-size: 0.875rem; max-height: 150px; overflow-y: auto;">
                                    ${errors.slice(0, 10).map(e => `<li>${escapeHtml(e)}</li>`).join('')}
                                    ${errors.length > 10 ? `<li>... and ${errors.length - 10} more errors</li>` : ''}
                                </ul>
                            </div>
                        `;
                    } else {
                        document.getElementById('importErrors').style.display = 'none';
                    }
                } catch (error) {
                    showToast('Error reading CSV file: ' + error.message, 'error');
                    document.getElementById('importPreview').style.display = 'none';
                    document.getElementById('importBtn').disabled = true;
                }
            };
            
            reader.onerror = function() {
                showToast('Error reading file', 'error');
                document.getElementById('importPreview').style.display = 'none';
                document.getElementById('importBtn').disabled = true;
            };
            
            reader.readAsText(file);
        });
    }
});

// Load students on page load
document.addEventListener('DOMContentLoaded', function() {
    loadStudents();
    loadClassDropdown();
});

