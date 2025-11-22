# Class Attendance Web Application

A comprehensive class attendance management system built with vanilla HTML, CSS, and JavaScript. This application provides a complete solution for managing classes, students, and attendance records with a modern, responsive user interface.

## Features

### Core Functionality
- **Role-Based Authentication**: Secure login system with Admin and Teacher roles
- **Admin Panel**: User management system to create and manage teacher accounts
- **Dashboard**: Overview with statistics and recent activity (role-specific views)
- **Class Management**: Full CRUD operations for classes (Admin only)
- **Student Management**: Complete student directory with enrollment tracking (Admin only)
- **Attendance Marking**: Easy-to-use interface for marking attendance with date and class selection
- **Reports**: Generate detailed attendance reports with filtering and CSV export
- **Teacher Access Control**: Teachers can only access their assigned classes

### Technical Features
- Client-side data persistence using localStorage
- Responsive design for mobile, tablet, and desktop
- Modern UI with blue/indigo color scheme
- Form validation and error handling
- Search and filter capabilities
- Real-time statistics calculation

## Getting Started

### Installation
1. Clone or download this repository
2. Open `index.html` in a modern web browser
3. No build process or dependencies required!

### Default Login Credentials
- **Username**: `admin`
- **Password**: `admin123`

## Project Structure

```
CAWD/
├── index.html          # Login page
├── dashboard.html      # Main dashboard
├── classes.html        # Class management (Admin only)
├── students.html       # Student management (Admin only)
├── attendance.html     # Attendance marking
├── reports.html        # Reports and analytics
├── admin.html          # Admin panel - User management
├── css/
│   └── style.css      # Main stylesheet
├── js/
│   ├── data.js        # Data management (localStorage)
│   ├── auth.js        # Authentication logic with role support
│   ├── utils.js       # Utility functions
│   ├── dashboard.js   # Dashboard functionality
│   ├── classes.js     # Class CRUD operations
│   ├── students.js    # Student CRUD operations
│   ├── attendance.js  # Attendance marking
│   ├── reports.js     # Report generation
│   └── admin.js       # Admin panel functionality
└── README.md
```

## Usage Guide

### 1. Login
- Navigate to `index.html`
- Enter admin credentials
- You'll be redirected to the dashboard

### 2. Manage Classes
- Go to the "Classes" page
- Click "+ Add Class" to create a new class
- Fill in class name, subject, and schedule
- Edit or delete classes as needed

### 3. Manage Students
- Go to the "Students" page
- Click "+ Add Student" to enroll a new student
- Select the class for enrollment
- Edit or delete student records

### 4. Mark Attendance
- Go to the "Attendance" page
- Select a class and date
- Click "Load Students"
- Mark each student as Present, Late, or Absent
- Use bulk actions to mark all at once
- Click "Save Attendance" to store records

### 5. Generate Reports
- Go to the "Reports" page
- Apply filters (class, student, date range)
- Click "Generate Report"
- View summary statistics
- Export to CSV for external analysis

### 6. Admin Panel - User Management (Admin Only)
- Go to the "Admin Panel" page (visible only to admins)
- Click "+ Create New Account" to add a new teacher
- Enter username, password, and select role (Admin or Teacher)
- For teachers, assign classes they can access
- Edit user accounts to update credentials or class assignments
- Delete user accounts (except admin accounts)

## User Roles

### Admin
- Full access to all features
- Can manage classes, students, and users
- Can create teacher accounts
- Can assign classes to teachers
- Can view all attendance records

### Teacher
- Can only access assigned classes
- Can mark attendance for assigned classes
- Can view reports for assigned classes only
- Cannot manage classes, students, or users
- Dashboard shows only their assigned classes data

## Data Models

### User
```javascript
{
    id: string,
    username: string,
    password: string,
    role: 'admin' | 'teacher',
    assignedClasses: string[],  // Array of class IDs (for teachers)
    createdAt: date
}
```

### Class
```javascript
{
    id: string,
    name: string,
    subject: string,
    schedule: string,
    createdAt: date
}
```

### Student
```javascript
{
    id: string,
    name: string,
    email: string,
    classId: string,
    enrollmentDate: string
}
```

### Attendance Record
```javascript
{
    id: string,
    studentId: string,
    classId: string,
    date: string,
    status: 'present' | 'absent' | 'late'
}
```

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Edge (latest)
- Safari (latest)

Requires modern browser support for:
- ES6+ JavaScript
- CSS Grid and Flexbox
- localStorage API

## Data Persistence

All data is stored in the browser's localStorage. This means:
- Data persists across browser sessions
- Data is specific to each browser/device
- Clearing browser data will remove all records

## Security Notes

- This is a client-side only application
- Passwords are stored in plain text (not recommended for production)
- No server-side validation or security
- Suitable for local/demo use only

## Customization

### Changing Colors
Edit CSS variables in `css/style.css`:
```css
:root {
    --primary-color: #4f46e5;
    --primary-dark: #4338ca;
    /* ... */
}
```

### Modifying Default Admin
The default admin account is created automatically on first load. To modify it, edit `js/data.js` in the `initializeData()` function.

### Creating Teacher Accounts
1. Login as admin
2. Navigate to "Admin Panel"
3. Click "+ Create New Account"
4. Enter username and password
5. Select "Teacher" role
6. Check the classes to assign to this teacher
7. Click "Save"

## License

This project is provided as-is for educational and demonstration purposes.

## Support

For issues or questions, please refer to the code comments or modify the application as needed for your use case.

