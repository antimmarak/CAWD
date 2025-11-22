// Utility Functions

// Show toast notification
function showToast(message, type = 'success') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Format date for input (YYYY-MM-DD)
function formatDateForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

// Get today's date in YYYY-MM-DD format
function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

// Show confirmation modal
function showConfirmModal(message, onConfirm, onCancel = null) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>Confirm Action</h3>
            </div>
            <div class="modal-body">
                <p>${message}</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancelBtn">Cancel</button>
                <button class="btn btn-danger" id="confirmBtn">Confirm</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('confirmBtn').addEventListener('click', () => {
        modal.remove();
        if (onConfirm) onConfirm();
    });

    document.getElementById('cancelBtn').addEventListener('click', () => {
        modal.remove();
        if (onCancel) onCancel();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            if (onCancel) onCancel();
        }
    });
}

// Validate form fields
function validateForm(formElement) {
    const requiredFields = formElement.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('error');
            isValid = false;
        } else {
            field.classList.remove('error');
        }
    });

    // Validate email fields
    const emailFields = formElement.querySelectorAll('input[type="email"]');
    emailFields.forEach(field => {
        if (field.value && !validateEmail(field.value)) {
            field.classList.add('error');
            isValid = false;
        }
    });

    return isValid;
}

// Clear form
function clearForm(formElement) {
    formElement.reset();
    formElement.querySelectorAll('.error').forEach(field => {
        field.classList.remove('error');
    });
}

// Validate email format
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Update navigation based on user role
function updateNavigation() {
    const user = getCurrentUser();
    if (!user) return;

    // Show/hide admin panel link
    const adminLinks = document.querySelectorAll('a[href="admin.html"]');
    adminLinks.forEach(link => {
        link.style.display = user.role === 'admin' ? '' : 'none';
    });

    // Show/hide classes and students links for teachers
    if (user.role === 'teacher') {
        const classesLinks = document.querySelectorAll('a[href="classes.html"]');
        const studentsLinks = document.querySelectorAll('a[href="students.html"]');
        classesLinks.forEach(link => link.style.display = 'none');
        studentsLinks.forEach(link => link.style.display = 'none');
    }
}

// Toggle mobile menu
function toggleMobileMenu() {
    const menu = document.getElementById('navMenu');
    const toggle = document.querySelector('.menu-toggle');
    if (menu && toggle) {
        menu.classList.toggle('active');
        toggle.classList.toggle('active');
    }
}

// Initialize mobile menu functionality
function initMobileMenu() {
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const menu = document.getElementById('navMenu');
        const toggle = document.querySelector('.menu-toggle');
        const navbar = document.querySelector('.navbar');
        
        if (menu && toggle && navbar && window.innerWidth < 768) {
            if (menu.classList.contains('active') && !navbar.contains(event.target)) {
                menu.classList.remove('active');
                toggle.classList.remove('active');
            }
        }
    });
    
    // Close menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth < 768) {
                const menu = document.getElementById('navMenu');
                const toggle = document.querySelector('.menu-toggle');
                if (menu && toggle) {
                    menu.classList.remove('active');
                    toggle.classList.remove('active');
                }
            }
        });
    });
    
    // Close menu on window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth >= 768) {
                const menu = document.getElementById('navMenu');
                const toggle = document.querySelector('.menu-toggle');
                if (menu && toggle) {
                    menu.classList.remove('active');
                    toggle.classList.remove('active');
                }
            }
        }, 250);
    });
}

