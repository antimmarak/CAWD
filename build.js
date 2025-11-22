// Build script to inject environment variables into supabase.js
// Run this before deploying: node build.js
// For Netlify: Set environment variables in dashboard, build script will use them automatically

const fs = require('fs');
const path = require('path');

// Try to load .env file if it exists
try {
    require('dotenv').config();
} catch (e) {
    console.log('⚠️  dotenv not installed. Install with: npm install');
}

const supabaseJsPath = path.join(__dirname, 'js', 'supabase.js');

// Read the supabase.js file
let supabaseJs = fs.readFileSync(supabaseJsPath, 'utf8');

// Get environment variables (from .env file or process.env)
const supabaseUrl = process.env.SUPABASE_URL || 'https://nydxhitjiqtxluuxowcj.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55ZHhoaXRqaXF0eGx1dXhvd2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4Mjc5NjQsImV4cCI6MjA3OTQwMzk2NH0._iGtoSu-tGkTx3gLEFDOO0Y9aKmPRpfaRExUfDBabDc'

// Check if values are set
if (supabaseUrl === 'https://nydxhitjiqtxluuxowcj.supabase.co' || supabaseKey === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55ZHhoaXRqaXF0eGx1dXhvd2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4Mjc5NjQsImV4cCI6MjA3OTQwMzk2NH0._iGtoSu-tGkTx3gLEFDOO0Y9aKmPRpfaRExUfDBabDc') {
    console.warn('⚠️  Warning: Supabase credentials not found in environment variables.');
    console.warn('   Set SUPABASE_URL and SUPABASE_ANON_KEY in .env file or environment variables.');
    console.warn('   For Netlify: Set them in Site settings > Environment variables');
}

// Replace the default values with actual values
// This replaces the lines that set SUPABASE_URL and SUPABASE_ANON_KEY
supabaseJs = supabaseJs.replace(
    /const SUPABASE_URL = .*?;/,
    `const SUPABASE_URL = '${supabaseUrl}';`
);

supabaseJs = supabaseJs.replace(
    /const SUPABASE_ANON_KEY = .*?;/,
    `const SUPABASE_ANON_KEY = '${supabaseKey}';`
);

// Write back to file
fs.writeFileSync(supabaseJsPath, supabaseJs, 'utf8');

console.log('✅ Build complete!');
console.log(`   SUPABASE_URL: ${supabaseUrl.substring(0, 40)}${supabaseUrl.length > 40 ? '...' : ''}`);
console.log(`   SUPABASE_ANON_KEY: ${supabaseKey.substring(0, 20)}...`);
