// Data Management Layer - Supabase Backend
// Falls back to localStorage if Supabase is not configured

let USE_SUPABASE = false;

// Check if Supabase is configured and available
function checkSupabaseAvailable() {
    try {
        if (SUPABASE_URL === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55ZHhoaXRqaXF0eGx1dXhvd2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4Mjc5NjQsImV4cCI6MjA3OTQwMzk2NH0._iGtoSu-tGkTx3gLEFDOO0Y9aKmPRpfaRExUfDBabDc') {
            return false;
        }
        const supabase = getSupabase();
        return supabase !== null && supabase !== undefined;
    } catch (e) {
        return false;
    }
}

// Initialize - check for Supabase availability
if (typeof window !== 'undefined') {
    USE_SUPABASE = checkSupabaseAvailable();
    if (!USE_SUPABASE) {
        // Fallback to localStorage
        initializeLocalStorageData();
    }
}

// ========== LOCALSTORAGE FALLBACK ==========
function initializeLocalStorageData() {
    if (!localStorage.getItem('attendance_users')) {
        const defaultAdmin = {
            id: generateId(),
            username: 'admin',
            password: 'admin123',
            role: 'admin',
            assignedClasses: [],
            createdAt: new Date().toISOString()
        };
        localStorage.setItem('attendance_users', JSON.stringify([defaultAdmin]));
    }
    if (!localStorage.getItem('attendance_classes')) {
        localStorage.setItem('attendance_classes', JSON.stringify([]));
    }
    if (!localStorage.getItem('attendance_students')) {
        localStorage.setItem('attendance_students', JSON.stringify([]));
    }
    if (!localStorage.getItem('attendance_records')) {
        localStorage.setItem('attendance_records', JSON.stringify([]));
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ========== CLASS OPERATIONS ==========

async function getClasses() {
    if (USE_SUPABASE) {
        try {
            const { data, error } = await getSupabase()
                .from('classes')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching classes:', error);
            return [];
        }
    } else {
        const classes = localStorage.getItem('attendance_classes');
        return Promise.resolve(classes ? JSON.parse(classes) : []);
    }
}

async function addClass(classData) {
    if (USE_SUPABASE) {
        try {
            const { data, error } = await getSupabase()
                .from('classes')
                .insert([{
                    name: classData.name,
                    subject: classData.subject,
                    schedule: classData.schedule
                }])
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error adding class:', error);
            throw error;
        }
    } else {
        const classes = await getClasses();
        const newClass = {
            id: generateId(),
            name: classData.name,
            subject: classData.subject,
            schedule: classData.schedule,
            createdAt: new Date().toISOString()
        };
        classes.push(newClass);
        localStorage.setItem('attendance_classes', JSON.stringify(classes));
        return Promise.resolve(newClass);
    }
}

async function updateClass(id, classData) {
    if (USE_SUPABASE) {
        try {
            const { data, error } = await getSupabase()
                .from('classes')
                .update({
                    name: classData.name,
                    subject: classData.subject,
                    schedule: classData.schedule
                })
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating class:', error);
            throw error;
        }
    } else {
        const classes = await getClasses();
        const index = classes.findIndex(c => c.id === id);
        if (index !== -1) {
            classes[index] = { ...classes[index], ...classData };
        localStorage.setItem('attendance_classes', JSON.stringify(classes));
        return Promise.resolve(classes[index]);
    }
        return null;
    }
}

async function deleteClass(id) {
    if (USE_SUPABASE) {
        try {
            // Supabase will handle cascade deletes
            const { error } = await getSupabase()
                .from('classes')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting class:', error);
            throw error;
        }
    } else {
        const classes = await getClasses();
        const filtered = classes.filter(c => c.id !== id);
        localStorage.setItem('attendance_classes', JSON.stringify(filtered));
        
        const students = await getStudents();
        const studentsToDelete = students.filter(s => s.classId === id).map(s => s.id);
        studentsToDelete.forEach(studentId => deleteStudent(studentId));
        
        const records = await getAttendanceRecords();
        const filteredRecords = records.filter(r => r.classId !== id);
        localStorage.setItem('attendance_records', JSON.stringify(filteredRecords));
        return Promise.resolve(true);
    }
}

async function getClassById(id) {
    if (USE_SUPABASE) {
        try {
            const { data, error } = await getSupabase()
                .from('classes')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching class:', error);
            return null;
        }
    } else {
        const classes = await getClasses();
        return Promise.resolve(classes.find(c => c.id === id) || null);
    }
}

// ========== STUDENT OPERATIONS ==========

async function getStudents() {
    if (USE_SUPABASE) {
        try {
            const { data, error } = await getSupabase()
                .from('students')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            // Map class_id to classId for compatibility
            return (data || []).map(s => ({
                ...s,
                classId: s.class_id
            }));
        } catch (error) {
            console.error('Error fetching students:', error);
            return [];
        }
    } else {
        const students = localStorage.getItem('attendance_students');
        return Promise.resolve(students ? JSON.parse(students) : []);
    }
}

async function addStudent(studentData) {
    if (USE_SUPABASE) {
        try {
            const { data, error } = await getSupabase()
                .from('students')
                .insert([{
                    name: studentData.name,
                    email: studentData.email,
                    class_id: studentData.classId,
                    enrollment_date: studentData.enrollmentDate || new Date().toISOString().split('T')[0]
                }])
                .select()
                .single();
            
            if (error) throw error;
            return { ...data, classId: data.class_id };
        } catch (error) {
            console.error('Error adding student:', error);
            throw error;
        }
    } else {
        const students = await getStudents();
        const newStudent = {
            id: generateId(),
            name: studentData.name,
            email: studentData.email,
            classId: studentData.classId,
            enrollmentDate: studentData.enrollmentDate || new Date().toISOString().split('T')[0]
        };
        students.push(newStudent);
        localStorage.setItem('attendance_students', JSON.stringify(students));
        return Promise.resolve(newStudent);
    }
}

async function updateStudent(id, studentData) {
    if (USE_SUPABASE) {
        try {
            const updateData = {
                name: studentData.name,
                email: studentData.email,
                class_id: studentData.classId,
                enrollment_date: studentData.enrollmentDate
            };
            
            const { data, error } = await getSupabase()
                .from('students')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            return { ...data, classId: data.class_id };
        } catch (error) {
            console.error('Error updating student:', error);
            throw error;
        }
    } else {
        const students = await getStudents();
        const index = students.findIndex(s => s.id === id);
        if (index !== -1) {
            students[index] = { ...students[index], ...studentData };
            localStorage.setItem('attendance_students', JSON.stringify(students));
            return Promise.resolve(students[index]);
        }
        return Promise.resolve(null);
    }
}

async function deleteStudent(id) {
    if (USE_SUPABASE) {
        try {
            const { error } = await getSupabase()
                .from('students')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting student:', error);
            throw error;
        }
    } else {
        const students = await getStudents();
        const filtered = students.filter(s => s.id !== id);
        localStorage.setItem('attendance_students', JSON.stringify(filtered));
        
        const records = await getAttendanceRecords();
        const filteredRecords = records.filter(r => r.studentId !== id);
        localStorage.setItem('attendance_records', JSON.stringify(filteredRecords));
        return Promise.resolve(true);
    }
}

async function getStudentById(id) {
    if (USE_SUPABASE) {
        try {
            const { data, error } = await getSupabase()
                .from('students')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            return data ? { ...data, classId: data.class_id } : null;
        } catch (error) {
            console.error('Error fetching student:', error);
            return null;
        }
    } else {
        const students = await getStudents();
        return Promise.resolve(students.find(s => s.id === id) || null);
    }
}

async function getStudentsByClass(classId) {
    if (USE_SUPABASE) {
        try {
            const { data, error } = await getSupabase()
                .from('students')
                .select('*')
                .eq('class_id', classId);
            
            if (error) throw error;
            return (data || []).map(s => ({ ...s, classId: s.class_id }));
        } catch (error) {
            console.error('Error fetching students by class:', error);
            return [];
        }
    } else {
        const students = await getStudents();
        return Promise.resolve(students.filter(s => s.classId === classId));
    }
}

// ========== ATTENDANCE OPERATIONS ==========

async function getAttendanceRecords() {
    if (USE_SUPABASE) {
        try {
            const { data, error } = await getSupabase()
                .from('attendance_records')
                .select('*')
                .order('date', { ascending: false });
            
            if (error) throw error;
            return (data || []).map(r => ({
                ...r,
                studentId: r.student_id,
                classId: r.class_id
            }));
        } catch (error) {
            console.error('Error fetching attendance records:', error);
            return [];
        }
    } else {
        const records = localStorage.getItem('attendance_records');
        return Promise.resolve(records ? JSON.parse(records) : []);
    }
}

async function addAttendanceRecord(recordData) {
    if (USE_SUPABASE) {
        try {
            // Use upsert to handle duplicates
            const { data, error } = await getSupabase()
                .from('attendance_records')
                .upsert({
                    student_id: recordData.studentId,
                    class_id: recordData.classId,
                    date: recordData.date,
                    status: recordData.status
                }, {
                    onConflict: 'student_id,class_id,date'
                })
                .select()
                .single();
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error adding attendance record:', error);
            throw error;
        }
    } else {
        const records = await getAttendanceRecords();
        const existingIndex = records.findIndex(r => 
            r.studentId === recordData.studentId && 
            r.classId === recordData.classId && 
            r.date === recordData.date
        );
        
        if (existingIndex !== -1) {
            records[existingIndex] = {
                ...records[existingIndex],
                status: recordData.status
            };
        } else {
            const newRecord = {
                id: generateId(),
                studentId: recordData.studentId,
                classId: recordData.classId,
                date: recordData.date,
                status: recordData.status
            };
            records.push(newRecord);
        }
        localStorage.setItem('attendance_records', JSON.stringify(records));
        return Promise.resolve(true);
    }
}

async function getAttendanceByDateAndClass(date, classId) {
    if (USE_SUPABASE) {
        try {
            const { data, error } = await getSupabase()
                .from('attendance_records')
                .select('*')
                .eq('date', date)
                .eq('class_id', classId);
            
            if (error) throw error;
            return (data || []).map(r => ({
                ...r,
                studentId: r.student_id,
                classId: r.class_id
            }));
        } catch (error) {
            console.error('Error fetching attendance:', error);
            return [];
        }
    } else {
        const records = await getAttendanceRecords();
        return Promise.resolve(records.filter(r => r.date === date && r.classId === classId));
    }
}

async function getAttendanceByStudent(studentId) {
    if (USE_SUPABASE) {
        try {
            const { data, error } = await getSupabase()
                .from('attendance_records')
                .select('*')
                .eq('student_id', studentId);
            
            if (error) throw error;
            return (data || []).map(r => ({
                ...r,
                studentId: r.student_id,
                classId: r.class_id
            }));
        } catch (error) {
            console.error('Error fetching attendance:', error);
            return [];
        }
    } else {
        const records = await getAttendanceRecords();
        return Promise.resolve(records.filter(r => r.studentId === studentId));
    }
}

async function getAttendanceByDateRange(startDate, endDate, classId = null, studentId = null) {
    if (USE_SUPABASE) {
        try {
            let query = getSupabase()
                .from('attendance_records')
                .select('*')
                .gte('date', startDate)
                .lte('date', endDate);
            
            if (classId) query = query.eq('class_id', classId);
            if (studentId) query = query.eq('student_id', studentId);
            
            const { data, error } = await query;
            
            if (error) throw error;
            return (data || []).map(r => ({
                ...r,
                studentId: r.student_id,
                classId: r.class_id
            }));
        } catch (error) {
            console.error('Error fetching attendance:', error);
            return [];
        }
    } else {
        const records = await getAttendanceRecords();
        return Promise.resolve(records.filter(r => {
            const recordDate = r.date;
            const matchesDate = recordDate >= startDate && recordDate <= endDate;
            const matchesClass = !classId || r.classId === classId;
            const matchesStudent = !studentId || r.studentId === studentId;
            return matchesDate && matchesClass && matchesStudent;
        }));
    }
}

// ========== USER OPERATIONS ==========

async function getUsers() {
    if (USE_SUPABASE) {
        try {
            const { data, error } = await getSupabase()
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return (data || []).map(u => ({
                ...u,
                assignedClasses: u.assigned_classes || []
            }));
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    } else {
        const users = localStorage.getItem('attendance_users');
        return Promise.resolve(users ? JSON.parse(users) : []);
    }
}

async function getUserByUsername(username) {
    if (USE_SUPABASE) {
        try {
            const { data, error } = await getSupabase()
                .from('users')
                .select('*')
                .eq('username', username)
                .single();
            
            if (error && error.code !== 'PGRST116') throw error;
            return data ? { ...data, assignedClasses: data.assigned_classes || [] } : null;
        } catch (error) {
            console.error('Error fetching user:', error);
            return null;
        }
    } else {
        const users = await getUsers();
        return Promise.resolve(users.find(u => u.username === username) || null);
    }
}

async function getUserById(id) {
    if (USE_SUPABASE) {
        try {
            const { data, error } = await getSupabase()
                .from('users')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            return data ? { ...data, assignedClasses: data.assigned_classes || [] } : null;
        } catch (error) {
            console.error('Error fetching user:', error);
            return null;
        }
    } else {
        const users = await getUsers();
        return Promise.resolve(users.find(u => u.id === id) || null);
    }
}

async function addUser(userData) {
    if (USE_SUPABASE) {
        try {
            // Check if username exists
            const existing = await getUserByUsername(userData.username);
            if (existing) {
                return { success: false, error: 'Username already exists' };
            }
            
            // In production, hash the password before storing
            const { data, error } = await getSupabase()
                .from('users')
                .insert([{
                    username: userData.username,
                    password_hash: userData.password, // TODO: Hash password in production
                    role: userData.role || 'teacher',
                    assigned_classes: userData.assignedClasses || []
                }])
                .select()
                .single();
            
            if (error) throw error;
            return { 
                success: true, 
                user: { ...data, assignedClasses: data.assigned_classes || [] } 
            };
        } catch (error) {
            console.error('Error adding user:', error);
            return { success: false, error: error.message };
        }
    } else {
        const users = await getUsers();
        if (getUserByUsername(userData.username)) {
            return { success: false, error: 'Username already exists' };
        }
        
        const newUser = {
            id: generateId(),
            username: userData.username,
            password: userData.password,
            role: userData.role || 'teacher',
            assignedClasses: userData.assignedClasses || [],
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        localStorage.setItem('attendance_users', JSON.stringify(users));
        return Promise.resolve({ success: true, user: newUser });
    }
}

async function updateUser(id, userData) {
    if (USE_SUPABASE) {
        try {
            if (userData.username) {
                const existing = await getUserByUsername(userData.username);
                if (existing && existing.id !== id) {
                    return { success: false, error: 'Username already exists' };
                }
            }
            
            const updateData = {};
            if (userData.username) updateData.username = userData.username;
            if (userData.password) updateData.password_hash = userData.password; // TODO: Hash password
            if (userData.role) updateData.role = userData.role;
            if (userData.assignedClasses) updateData.assigned_classes = userData.assignedClasses;
            
            const { data, error } = await getSupabase()
                .from('users')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            return { 
                success: true, 
                user: { ...data, assignedClasses: data.assigned_classes || [] } 
            };
        } catch (error) {
            console.error('Error updating user:', error);
            return { success: false, error: error.message };
        }
    } else {
        const users = await getUsers();
        const index = users.findIndex(u => u.id === id);
        if (index !== -1) {
            if (userData.username && userData.username !== users[index].username) {
                if (getUserByUsername(userData.username)) {
                    return { success: false, error: 'Username already exists' };
                }
            }
            users[index] = { ...users[index], ...userData };
            localStorage.setItem('attendance_users', JSON.stringify(users));
            return Promise.resolve({ success: true, user: users[index] });
        }
        return Promise.resolve({ success: false, error: 'User not found' });
    }
}

async function deleteUser(id) {
    if (USE_SUPABASE) {
        try {
            const { error } = await getSupabase()
                .from('users')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    } else {
        const users = await getUsers();
        const filtered = users.filter(u => u.id !== id);
        localStorage.setItem('attendance_users', JSON.stringify(filtered));
        return Promise.resolve(true);
    }
}

async function assignClassToTeacher(userId, classId) {
    if (USE_SUPABASE) {
        try {
            const user = await getUserById(userId);
            if (!user) return false;
            
            const assignedClasses = user.assignedClasses || [];
            if (!assignedClasses.includes(classId)) {
                assignedClasses.push(classId);
                await updateUser(userId, { assignedClasses });
            }
            return true;
        } catch (error) {
            console.error('Error assigning class:', error);
            return false;
        }
    } else {
        const user = await getUserById(userId);
        if (!user) return false;
        
        if (!user.assignedClasses.includes(classId)) {
            user.assignedClasses.push(classId);
            await updateUser(userId, { assignedClasses: user.assignedClasses });
        }
        return true;
    }
}

async function unassignClassFromTeacher(userId, classId) {
    if (USE_SUPABASE) {
        try {
            const user = await getUserById(userId);
            if (!user) return false;
            
            const assignedClasses = (user.assignedClasses || []).filter(id => id !== classId);
            await updateUser(userId, { assignedClasses });
            return true;
        } catch (error) {
            console.error('Error unassigning class:', error);
            return false;
        }
    } else {
        const user = await getUserById(userId);
        if (!user) return false;
        
        user.assignedClasses = user.assignedClasses.filter(id => id !== classId);
        await updateUser(userId, { assignedClasses: user.assignedClasses });
        return true;
    }
}

async function getClassesForTeacher(userId) {
    if (USE_SUPABASE) {
        try {
            const user = await getUserById(userId);
            if (!user || user.role !== 'teacher') return [];
            
            const assignedClassIds = user.assignedClasses || [];
            if (assignedClassIds.length === 0) return [];
            
            const { data, error } = await getSupabase()
                .from('classes')
                .select('*')
                .in('id', assignedClassIds);
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching teacher classes:', error);
            return [];
        }
    } else {
        const user = await getUserById(userId);
        if (!user || user.role !== 'teacher') return Promise.resolve([]);
        
        const classes = await getClasses();
        return Promise.resolve(classes.filter(c => user.assignedClasses.includes(c.id)));
    }
}

// ========== VALIDATION FUNCTIONS ==========

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateClassData(classData) {
    if (!classData.name || classData.name.trim() === '') {
        return { valid: false, error: 'Class name is required' };
    }
    if (!classData.subject || classData.subject.trim() === '') {
        return { valid: false, error: 'Subject is required' };
    }
    return { valid: true };
}

function validateStudentData(studentData) {
    if (!studentData.name || studentData.name.trim() === '') {
        return { valid: false, error: 'Student name is required' };
    }
    if (!studentData.email || !validateEmail(studentData.email)) {
        return { valid: false, error: 'Valid email is required' };
    }
    if (!studentData.classId) {
        return { valid: false, error: 'Class selection is required' };
    }
    return { valid: true };
}
