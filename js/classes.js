// Classes Management

let editingClassId = null;

function loadClasses() {
    const classes = getClasses();
    const students = getStudents();
    const tableBody = document.getElementById('classesTableBody');
    const emptyState = document.getElementById('emptyState');

    if (classes.length === 0) {
        tableBody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    tableBody.innerHTML = classes.map(classItem => {
        const studentCount = students.filter(s => s.classId === classItem.id).length;
        return `
            <tr>
                <td>${escapeHtml(classItem.name)}</td>
                <td>${escapeHtml(classItem.subject)}</td>
                <td>${escapeHtml(classItem.schedule)}</td>
                <td>${studentCount}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editClass('${classItem.id}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteClassHandler('${classItem.id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

function openAddClassModal() {
    editingClassId = null;
    document.getElementById('modalTitle').textContent = 'Add Class';
    document.getElementById('classForm').reset();
    document.getElementById('classModal').style.display = 'flex';
}

function closeClassModal() {
    document.getElementById('classModal').style.display = 'none';
    editingClassId = null;
    document.getElementById('classForm').reset();
}

function editClass(id) {
    const classItem = getClassById(id);
    if (!classItem) return;

    editingClassId = id;
    document.getElementById('modalTitle').textContent = 'Edit Class';
    document.getElementById('className').value = classItem.name;
    document.getElementById('classSubject').value = classItem.subject;
    document.getElementById('classSchedule').value = classItem.schedule;
    document.getElementById('classModal').style.display = 'flex';
}

function deleteClassHandler(id) {
    const classItem = getClassById(id);
    if (!classItem) return;

    const students = getStudentsByClass(id);
    const message = students.length > 0
        ? `Delete "${classItem.name}"? This will also delete ${students.length} student(s) enrolled in this class.`
        : `Delete "${classItem.name}"?`;

    showConfirmModal(message, () => {
        deleteClass(id);
        showToast('Class deleted successfully', 'success');
        loadClasses();
    });
}

function filterClasses() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#classesTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Handle form submission
document.getElementById('classForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!validateForm(this)) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    const classData = {
        name: document.getElementById('className').value.trim(),
        subject: document.getElementById('classSubject').value.trim(),
        schedule: document.getElementById('classSchedule').value.trim()
    };

    const validation = validateClassData(classData);
    if (!validation.valid) {
        showToast(validation.error, 'error');
        return;
    }

    if (editingClassId) {
        updateClass(editingClassId, classData);
        showToast('Class updated successfully', 'success');
    } else {
        addClass(classData);
        showToast('Class added successfully', 'success');
    }

    closeClassModal();
    loadClasses();
});

// Close modal on overlay click
document.getElementById('classModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeClassModal();
    }
});

// Import Classes Functions
let importData = [];

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
                    current += '"';
                    i++;
                } else {
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
        if (values.length >= 2) {
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
    
    if (data.length === 0) {
        previewDiv.innerHTML = '<p style="color: var(--text-secondary);">No data to preview</p>';
        return;
    }
    
    let html = '<table style="width: 100%; font-size: 0.875rem; border-collapse: collapse;">';
    html += '<thead><tr style="background: var(--bg-color);"><th style="padding: 0.5rem; text-align: left;">Name</th><th style="padding: 0.5rem; text-align: left;">Subject</th><th style="padding: 0.5rem; text-align: left;">Schedule</th></tr></thead>';
    html += '<tbody>';
    
    const previewRows = data.slice(0, 5);
    previewRows.forEach(row => {
        html += '<tr>';
        html += `<td style="padding: 0.5rem;">${escapeHtml(row.name || '')}</td>`;
        html += `<td style="padding: 0.5rem;">${escapeHtml(row.subject || '')}</td>`;
        html += `<td style="padding: 0.5rem;">${escapeHtml(row.schedule || '')}</td>`;
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
    const existingClasses = getClasses();
    const classNames = new Set(existingClasses.map(c => c.name.toLowerCase()));
    
    data.forEach((row, index) => {
        const lineNum = index + 2;
        
        if (!row.name || row.name.trim() === '') {
            errors.push(`Line ${lineNum}: Class name is required`);
        } else if (classNames.has(row.name.toLowerCase())) {
            errors.push(`Line ${lineNum}: Class "${row.name}" already exists`);
            classNames.add(row.name.toLowerCase()); // Prevent duplicate errors in same file
        } else {
            classNames.add(row.name.toLowerCase());
        }
        
        if (!row.subject || row.subject.trim() === '') {
            errors.push(`Line ${lineNum}: Subject is required`);
        }
        
        if (!row.schedule || row.schedule.trim() === '') {
            errors.push(`Line ${lineNum}: Schedule is required`);
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
    let imported = 0;
    let skipped = 0;
    const existingClasses = getClasses();
    const existingNames = new Set(existingClasses.map(c => c.name.toLowerCase()));
    
    importData.forEach(row => {
        const className = row.name.trim();
        
        if (!existingNames.has(className.toLowerCase())) {
            const classData = {
                name: className,
                subject: row.subject.trim(),
                schedule: row.schedule.trim()
            };
            
            const validation = validateClassData(classData);
            if (validation.valid) {
                addClass(classData);
                existingNames.add(className.toLowerCase());
                imported++;
            } else {
                skipped++;
            }
        } else {
            skipped++;
        }
    });
    
    if (imported > 0) {
        showToast(`Successfully imported ${imported} class(es)${skipped > 0 ? `, ${skipped} skipped` : ''}`, 'success');
        closeImportModal();
        loadClasses();
    } else {
        showToast('No classes were imported. Please check your data.', 'error');
    }
}

function downloadTemplate() {
    const csvContent = `Name,Subject,Schedule
Mathematics,Math,Mon/Wed/Fri 10:00 AM
Science,Physics,Tue/Thu 2:00 PM
English,Literature,Mon/Wed 9:00 AM
History,Social Studies,Tue/Thu 11:00 AM
Computer Science,Programming,Mon/Wed/Fri 3:00 PM`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'classes_import_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Template downloaded successfully', 'success');
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

// Load classes on page load
document.addEventListener('DOMContentLoaded', loadClasses);

