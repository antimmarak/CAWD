// Supabase Client Configuration
// For local development: Create .env file with your credentials
// For Netlify: Set environment variables in Netlify dashboard
// Build script will inject these values during deployment

// Default values (will be replaced by build script during deployment)
// DO NOT edit these directly - use .env file and run npm run build
const SUPABASE_URL = 'https://nydxhitjiqtxluuxowcj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55ZHhoaXRqaXF0eGx1dXhvd2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4Mjc5NjQsImV4cCI6MjA3OTQwMzk2NH0._iGtoSu-tGkTx3gLEFDOO0Y9aKmPRpfaRExUfDBabDc';

// Initialize Supabase client
let supabaseClient = null;

function initSupabase() {
    // Check if Supabase library is loaded and URL is configured
    if (typeof supabase !== 'undefined' && SUPABASE_URL && SUPABASE_URL !== 'https://nydxhitjiqtxluuxowcj.supabase.co') {
        try {
            supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase initialized successfully');
            return supabaseClient;
        } catch (error) {
            console.error('❌ Error initializing Supabase:', error);
            return null;
        }
    } else {
        if (SUPABASE_URL === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55ZHhoaXRqaXF0eGx1dXhvd2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4Mjc5NjQsImV4cCI6MjA3OTQwMzk2NH0._iGtoSu-tGkTx3gLEFDOO0Y9aKmPRpfaRExUfDBabDc' || !SUPABASE_URL) {
            console.warn('⚠️ Supabase not configured. Using localStorage fallback.');
        } else {
            console.warn('⚠️ Supabase client library not loaded. Using localStorage fallback.');
        }
        return null;
    }
}

// Get Supabase client instance
function getSupabase() {
    if (!supabaseClient) {
        supabaseClient = initSupabase();
    }
    return supabaseClient;
}

// Check if Supabase is available
function isSupabaseAvailable() {
    return supabaseClient !== null && supabaseClient !== undefined;
}

// Initialize on page load if Supabase is available
if (typeof window !== 'undefined') {
    // Wait for Supabase to be loaded
    if (typeof supabase !== 'undefined') {
        initSupabase();
    } else {
        // Try to initialize after a short delay
        setTimeout(() => {
            if (typeof supabase !== 'undefined') {
                initSupabase();
            }
        }, 100);
    }
}
