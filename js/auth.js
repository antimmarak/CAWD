// Authentication Management - Supabase Compatible

function checkAuth() {
    const session = localStorage.getItem('attendance_session');
    return session ? JSON.parse(session) : null;
}

async function getCurrentUser() {
    const session = checkAuth();
    if (!session) return null;
    
    try {
        const user = await getUserById(session.userId);
        return user;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

async function isAdmin() {
    const user = await getCurrentUser();
    return user && user.role === 'admin';
}

async function isTeacher() {
    const user = await getCurrentUser();
    return user && user.role === 'teacher';
}

async function login(username, password) {
    try {
        const user = await getUserByUsername(username);
        
        if (!user) {
            return { success: false, error: 'Invalid username or password' };
        }
        
        // For Supabase: In production, use proper password hashing
        // For now, simple comparison (NOT SECURE - for development only)
        const passwordMatch = USE_SUPABASE 
            ? user.password_hash === password // TODO: Use bcrypt or Supabase Auth
            : user.password === password;
        
        if (passwordMatch) {
            const session = {
                userId: user.id,
                username: user.username,
                role: user.role,
                loginTime: new Date().toISOString()
            };
            localStorage.setItem('attendance_session', JSON.stringify(session));
            return { success: true, user: user };
        }
        
        return { success: false, error: 'Invalid username or password' };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Login failed. Please try again.' };
    }
}

function logout() {
    localStorage.removeItem('attendance_session');
    window.location.href = 'index.html';
}

function requireAuth() {
    if (!checkAuth()) {
        window.location.href = 'index.html';
    }
}

async function requireAdmin() {
    requireAuth();
    const admin = await isAdmin();
    if (!admin) {
        showToast('Access denied. Admin privileges required.', 'error');
        window.location.href = 'dashboard.html';
    }
}
