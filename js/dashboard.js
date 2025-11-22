// Dashboard functionality

let dashboardData = {};

function loadDashboard() {
    loadWelcome();
    loadStatistics();
    loadRecentActivity();
    loadQuickStats();
    loadTodayOverview();
}

function loadWelcome() {
    const user = getCurrentUser();
    if (!user) return;
    
    const welcomeTitle = document.getElementById('welcomeTitle');
    const welcomeSubtitle = document.getElementById('welcomeSubtitle');
    const userInfoText = document.getElementById('userInfoText');
    
    if (welcomeTitle) {
        const hour = new Date().getHours();
        let greeting = 'Welcome Back!';
        if (hour < 12) greeting = 'Good Morning!';
        else if (hour < 18) greeting = 'Good Afternoon!';
        else greeting = 'Good Evening!';
        welcomeTitle.textContent = greeting;
    }
    
    if (userInfoText) {
        const roleText = user.role === 'admin' ? 'Administrator' : 'Teacher';
        userInfoText.innerHTML = `<strong>${escapeHtml(user.username)}</strong> • ${roleText}`;
    }
}

function loadStatistics() {
    const user = getCurrentUser();
    let classes, students, records;
    
    // Teachers only see their assigned classes data
    if (user && user.role === 'teacher') {
        classes = getClassesForTeacher(user.id);
        const classIds = classes.map(c => c.id);
        students = getStudents().filter(s => classIds.includes(s.classId));
        records = getAttendanceRecords().filter(r => classIds.includes(r.classId));
    } else {
        classes = getClasses();
        students = getStudents();
        records = getAttendanceRecords();
    }
    
    dashboardData = { classes, students, records };
    
    const today = getTodayDate();
    const todayRecords = records.filter(r => r.date === today);
    const totalTodayStudents = todayRecords.length;
    const presentToday = todayRecords.filter(r => r.status === 'present').length;
    const lateToday = todayRecords.filter(r => r.status === 'late').length;
    const absentToday = todayRecords.filter(r => r.status === 'absent').length;
    const attendanceRate = totalTodayStudents > 0 
        ? Math.round((presentToday / totalTodayStudents) * 100) 
        : 0;

    const statsGrid = document.getElementById('statsGrid');
    statsGrid.innerHTML = `
        <div class="stat-card stat-card-primary">
            <div class="stat-card-inner">
                <div class="stat-icon-wrapper stat-icon-primary">
                    <div class="stat-icon">👥</div>
                </div>
                <div class="stat-content">
                    <h3 class="stat-number">${students.length}</h3>
                    <p class="stat-label">${user && user.role === 'teacher' ? 'My Students' : 'Total Students'}</p>
                    <div class="stat-trend">
                        <span class="trend-icon">📈</span>
                        <span>Active</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="stat-card stat-card-success">
            <div class="stat-card-inner">
                <div class="stat-icon-wrapper stat-icon-success">
                    <div class="stat-icon">📚</div>
                </div>
                <div class="stat-content">
                    <h3 class="stat-number">${classes.length}</h3>
                    <p class="stat-label">${user && user.role === 'teacher' ? 'My Classes' : 'Total Classes'}</p>
                    <div class="stat-trend">
                        <span class="trend-icon">📚</span>
                        <span>Available</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="stat-card stat-card-warning">
            <div class="stat-card-inner">
                <div class="stat-icon-wrapper stat-icon-warning">
                    <div class="stat-icon">✅</div>
                </div>
                <div class="stat-content">
                    <h3 class="stat-number">${attendanceRate}%</h3>
                    <p class="stat-label">Today's Attendance</p>
                    <div class="stat-trend">
                        <span class="trend-icon">${attendanceRate >= 80 ? '📈' : '📉'}</span>
                        <span>${presentToday}/${totalTodayStudents} Present</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="stat-card stat-card-info">
            <div class="stat-card-inner">
                <div class="stat-icon-wrapper stat-icon-info">
                    <div class="stat-icon">📊</div>
                </div>
                <div class="stat-content">
                    <h3 class="stat-number">${records.length}</h3>
                    <p class="stat-label">Total Records</p>
                    <div class="stat-trend">
                        <span class="trend-icon">📋</span>
                        <span>All Time</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function loadRecentActivity() {
    const user = getCurrentUser();
    let records = dashboardData.records || getAttendanceRecords();
    let students = dashboardData.students || getStudents();
    let classes = dashboardData.classes || getClasses();
    
    // Teachers only see activity for their classes
    if (user && user.role === 'teacher') {
        const classIds = getClassesForTeacher(user.id).map(c => c.id);
        records = records.filter(r => classIds.includes(r.classId));
    }
    
    // Sort by date (most recent first) and take last 8
    const recentRecords = records
        .sort((a, b) => new Date(b.date + 'T00:00:00') - new Date(a.date + 'T00:00:00'))
        .slice(0, 8);

    const activityList = document.getElementById('activityList');
    
    if (recentRecords.length === 0) {
        activityList.innerHTML = `
            <div class="empty-activity">
                <div class="empty-icon">📭</div>
                <p>No recent activity</p>
                <a href="attendance.html" class="btn btn-primary btn-sm">Mark Attendance</a>
            </div>
        `;
        return;
    }

    activityList.innerHTML = recentRecords.map(record => {
        const student = students.find(s => s.id === record.studentId);
        const classItem = classes.find(c => c.id === record.classId);
        
        let statusConfig = {
            icon: '✅',
            text: 'Present',
            color: 'var(--success-color)',
            bg: 'rgba(16, 185, 129, 0.1)'
        };
        
        if (record.status === 'late') {
            statusConfig = {
                icon: '⏰',
                text: 'Late',
                color: 'var(--warning-color)',
                bg: 'rgba(245, 158, 11, 0.1)'
            };
        } else if (record.status === 'absent') {
            statusConfig = {
                icon: '❌',
                text: 'Absent',
                color: 'var(--danger-color)',
                bg: 'rgba(239, 68, 68, 0.1)'
            };
        }
        
        const isToday = record.date === getTodayDate();
        const timeAgo = isToday ? 'Today' : formatDate(record.date);
        
        return `
            <div class="activity-item-modern">
                <div class="activity-status-badge" style="background: ${statusConfig.bg}; color: ${statusConfig.color};">
                    <span class="status-icon">${statusConfig.icon}</span>
                </div>
                <div class="activity-content-modern">
                    <div class="activity-main">
                        <strong class="activity-student">${escapeHtml(student ? student.name : 'Unknown')}</strong>
                        <span class="activity-status" style="color: ${statusConfig.color};">${statusConfig.text}</span>
                    </div>
                    <div class="activity-meta-modern">
                        <span class="activity-class">${escapeHtml(classItem ? classItem.name : 'Unknown Class')}</span>
                        <span class="activity-separator">•</span>
                        <span class="activity-date">${timeAgo}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function loadQuickStats() {
    const user = getCurrentUser();
    let records = dashboardData.records || getAttendanceRecords();
    let students = dashboardData.students || getStudents();
    let classes = dashboardData.classes || getClasses();
    
    if (user && user.role === 'teacher') {
        const classIds = getClassesForTeacher(user.id).map(c => c.id);
        records = records.filter(r => classIds.includes(r.classId));
        students = students.filter(s => classIds.includes(s.classId));
    }
    
    const today = getTodayDate();
    const todayRecords = records.filter(r => r.date === today);
    const presentCount = todayRecords.filter(r => r.status === 'present').length;
    const lateCount = todayRecords.filter(r => r.status === 'late').length;
    const absentCount = todayRecords.filter(r => r.status === 'absent').length;
    
    const thisWeekRecords = records.filter(r => {
        const recordDate = new Date(r.date + 'T00:00:00');
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return recordDate >= weekAgo;
    });
    
    const quickStats = document.getElementById('quickStats');
    quickStats.innerHTML = `
        <div class="quick-stat-item">
            <div class="quick-stat-icon" style="background: rgba(16, 185, 129, 0.1); color: var(--success-color);">
                ✅
            </div>
            <div class="quick-stat-content">
                <div class="quick-stat-value">${presentCount}</div>
                <div class="quick-stat-label">Present Today</div>
            </div>
        </div>
        <div class="quick-stat-item">
            <div class="quick-stat-icon" style="background: rgba(245, 158, 11, 0.1); color: var(--warning-color);">
                ⏰
            </div>
            <div class="quick-stat-content">
                <div class="quick-stat-value">${lateCount}</div>
                <div class="quick-stat-label">Late Today</div>
            </div>
        </div>
        <div class="quick-stat-item">
            <div class="quick-stat-icon" style="background: rgba(239, 68, 68, 0.1); color: var(--danger-color);">
                ❌
            </div>
            <div class="quick-stat-content">
                <div class="quick-stat-value">${absentCount}</div>
                <div class="quick-stat-label">Absent Today</div>
            </div>
        </div>
        <div class="quick-stat-item">
            <div class="quick-stat-icon" style="background: rgba(99, 102, 241, 0.1); color: var(--primary-color);">
                📊
            </div>
            <div class="quick-stat-content">
                <div class="quick-stat-value">${thisWeekRecords.length}</div>
                <div class="quick-stat-label">This Week</div>
            </div>
        </div>
    `;
}

function loadTodayOverview() {
    const user = getCurrentUser();
    let records = dashboardData.records || getAttendanceRecords();
    let classes = dashboardData.classes || getClasses();
    
    if (user && user.role === 'teacher') {
        classes = getClassesForTeacher(user.id);
        const classIds = classes.map(c => c.id);
        records = records.filter(r => classIds.includes(r.classId));
    }
    
    const today = getTodayDate();
    const todayRecords = records.filter(r => r.date === today);
    const totalToday = todayRecords.length;
    const presentToday = todayRecords.filter(r => r.status === 'present').length;
    const lateToday = todayRecords.filter(r => r.status === 'late').length;
    const absentToday = todayRecords.filter(r => r.status === 'absent').length;
    
    const attendanceRate = totalToday > 0 ? Math.round((presentToday / totalToday) * 100) : 0;
    
    const todayOverview = document.getElementById('todayOverview');
    
    if (totalToday === 0) {
        todayOverview.innerHTML = `
            <div class="today-empty">
                <div class="today-empty-icon">📅</div>
                <p>No attendance marked today</p>
                <a href="attendance.html" class="btn btn-primary btn-sm">Start Marking</a>
            </div>
        `;
        return;
    }
    
    const presentPercent = totalToday > 0 ? Math.round((presentToday / totalToday) * 100) : 0;
    const latePercent = totalToday > 0 ? Math.round((lateToday / totalToday) * 100) : 0;
    const absentPercent = totalToday > 0 ? Math.round((absentToday / totalToday) * 100) : 0;
    
    todayOverview.innerHTML = `
        <div class="today-summary">
            <div class="today-summary-item">
                <div class="summary-label">Total Marked</div>
                <div class="summary-value">${totalToday}</div>
            </div>
            <div class="today-summary-item">
                <div class="summary-label">Attendance Rate</div>
                <div class="summary-value highlight">${attendanceRate}%</div>
            </div>
        </div>
        <div class="today-breakdown">
            <div class="breakdown-item">
                <div class="breakdown-bar">
                    <div class="breakdown-fill" style="width: ${presentPercent}%; background: var(--success-color);"></div>
                </div>
                <div class="breakdown-info">
                    <span class="breakdown-label">✅ Present</span>
                    <span class="breakdown-value">${presentToday} (${presentPercent}%)</span>
                </div>
            </div>
            <div class="breakdown-item">
                <div class="breakdown-bar">
                    <div class="breakdown-fill" style="width: ${latePercent}%; background: var(--warning-color);"></div>
                </div>
                <div class="breakdown-info">
                    <span class="breakdown-label">⏰ Late</span>
                    <span class="breakdown-value">${lateToday} (${latePercent}%)</span>
                </div>
            </div>
            <div class="breakdown-item">
                <div class="breakdown-bar">
                    <div class="breakdown-fill" style="width: ${absentPercent}%; background: var(--danger-color);"></div>
                </div>
                <div class="breakdown-info">
                    <span class="breakdown-label">❌ Absent</span>
                    <span class="breakdown-value">${absentToday} (${absentPercent}%)</span>
                </div>
            </div>
        </div>
    `;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load dashboard on page load
document.addEventListener('DOMContentLoaded', loadDashboard);

