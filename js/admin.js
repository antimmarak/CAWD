// Admin Panel - User Management

let editingUserId = null;

function loadUsers() {
    const users = getUsers();
    const classes = getClasses();
    const currentUser = getCurrentUser();
    const tableBody = document.getElementById('usersTableBody');
    const emptyState = document.getElementById('emptyState');

    // Filter out current user from list
    const filteredUsers = users.filter(u => u.id !== currentUser.id);

    if (filteredUsers.length === 0) {
        tableBody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    tableBody.innerHTML = filteredUsers.map(user => {
        const assignedClassNames = user.assignedClasses
            .map(classId => {
                const classItem = classes.find(c => c.id === classId);
                return classItem ? classItem.name : null;
            })
            .filter(name => name !== null)
            .join(', ') || 'None';

        const roleBadge = user.role === 'admin' 
            ? '<span style="background: var(--danger-color); color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">Admin</span>'
            : '<span style="background: var(--primary-color); color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">Teacher</span>';

        return `
            <tr>
                <td>${escapeHtml(user.username)}</td>
                <td>${roleBadge}</td>
                <td>${escapeHtml(assignedClassNames)}</td>
                <td>${formatDate(user.createdAt)}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editUser('${user.id}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteUserHandler('${user.id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

function loadClassCheckboxes(selectedClassIds = []) {
    const classes = getClasses();
    const checkboxesDiv = document.getElementById('classCheckboxes');
    
    if (classes.length === 0) {
        checkboxesDiv.innerHTML = '<p style="color: var(--text-secondary);">No classes available. Create classes first.</p>';
        return;
    }

    checkboxesDiv.innerHTML = classes.map(classItem => {
        const isChecked = selectedClassIds.includes(classItem.id);
        return `
            <label class="checkbox-label">
                <input type="checkbox" value="${classItem.id}" ${isChecked ? 'checked' : ''}>
                <span>${escapeHtml(classItem.name)} - ${escapeHtml(classItem.subject)}</span>
            </label>
        `;
    }).join('');
}

function toggleClassAssignment() {
    const role = document.getElementById('userRole').value;
    const classSection = document.getElementById('classAssignmentSection');
    classSection.style.display = role === 'teacher' ? 'block' : 'none';
}

function openAddUserModal() {
    editingUserId = null;
    document.getElementById('modalTitle').textContent = 'Create New Account';
    document.getElementById('userForm').reset();
    document.getElementById('passwordLabel').textContent = 'Password *';
    document.getElementById('userPassword').required = true;
    document.getElementById('passwordHint').style.display = 'none';
    document.getElementById('userRole').value = 'teacher';
    toggleClassAssignment();
    loadClassCheckboxes();
    document.getElementById('userModal').style.display = 'flex';
}

function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
    editingUserId = null;
    document.getElementById('userForm').reset();
}

function editUser(id) {
    const user = getUserById(id);
    if (!user) return;

    editingUserId = id;
    document.getElementById('modalTitle').textContent = 'Edit User';
    document.getElementById('userUsername').value = user.username;
    document.getElementById('userPassword').value = '';
    document.getElementById('userPassword').required = false;
    document.getElementById('passwordLabel').textContent = 'Password';
    document.getElementById('passwordHint').style.display = 'block';
    document.getElementById('userRole').value = user.role;
    toggleClassAssignment();
    loadClassCheckboxes(user.assignedClasses);
    document.getElementById('userModal').style.display = 'flex';
}

function deleteUserHandler(id) {
    const user = getUserById(id);
    if (!user) return;

    if (user.role === 'admin') {
        showToast('Cannot delete admin accounts', 'error');
        return;
    }

    showConfirmModal(`Delete user "${user.username}"?`, () => {
        deleteUser(id);
        showToast('User deleted successfully', 'success');
        loadUsers();
    });
}

function filterUsers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#usersTableBody tr');
    
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
document.getElementById('userForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('userUsername').value.trim();
    const password = document.getElementById('userPassword').value;
    const role = document.getElementById('userRole').value;
    
    if (!username) {
        showToast('Username is required', 'error');
        return;
    }

    if (!editingUserId && !password) {
        showToast('Password is required for new users', 'error');
        return;
    }

    // Get selected classes
    const selectedClasses = Array.from(document.querySelectorAll('#classCheckboxes input[type="checkbox"]:checked'))
        .map(cb => cb.value);

    const userData = {
        username: username,
        role: role,
        assignedClasses: role === 'teacher' ? selectedClasses : []
    };

    if (password) {
        userData.password = password;
    }

    if (editingUserId) {
        const result = updateUser(editingUserId, userData);
        if (result.success) {
            showToast('User updated successfully', 'success');
            closeUserModal();
            loadUsers();
        } else {
            showToast(result.error || 'Failed to update user', 'error');
        }
    } else {
        const result = addUser(userData);
        if (result.success) {
            showToast('User created successfully', 'success');
            closeUserModal();
            loadUsers();
        } else {
            showToast(result.error || 'Failed to create user', 'error');
        }
    }
});

// Close modal on overlay click
document.getElementById('userModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeUserModal();
    }
});

// Load users on page load
document.addEventListener('DOMContentLoaded', loadUsers);

