# Supabase Setup Guide

This guide will help you set up Supabase as the backend for the Class Attendance System.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Fill in your project details:
   - **Name**: Class Attendance System (or any name you prefer)
   - **Database Password**: Choose a strong password (save it securely)
   - **Region**: Choose the closest region to your users
5. Click "Create new project"
6. Wait for the project to be created (takes 1-2 minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (the `anon` key, not the `service_role` key)

## Step 3: Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Open the `supabase-schema.sql` file from this project
4. Copy the entire SQL content
5. Paste it into the SQL Editor
6. Click "Run" to execute the SQL
7. Verify that all tables were created by going to **Table Editor**

## Step 4: Configure the Application

1. Open `js/supabase.js` in your project
2. Replace the placeholder values:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```
   With your actual values from Step 2

## Step 5: Add Supabase Script to HTML Files

Add this script tag to all your HTML files (before other script tags):

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

Or add it to each HTML file's `<head>` section:

```html
<head>
    <!-- Other head content -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
</head>
```

## Step 6: Update Authentication (Optional - Recommended)

For better security, consider using Supabase Auth instead of custom authentication:

1. Go to **Authentication** → **Providers** in Supabase dashboard
2. Enable Email provider
3. Update `js/auth.js` to use Supabase Auth methods

## Step 7: Test the Connection

1. Open your application in a browser
2. Check the browser console for any errors
3. Try logging in with default credentials:
   - Username: `admin`
   - Password: `admin123`

## Troubleshooting

### Issue: "Supabase client library not loaded"
- **Solution**: Make sure you've added the Supabase CDN script to your HTML files

### Issue: "Invalid API key"
- **Solution**: Double-check that you're using the `anon` key, not the `service_role` key

### Issue: "Table does not exist"
- **Solution**: Make sure you've run the SQL schema file in the Supabase SQL Editor

### Issue: "Row Level Security policy violation"
- **Solution**: Check that your RLS policies are set up correctly. You may need to temporarily disable RLS for testing, but re-enable it for production.

## Security Notes

1. **Never commit your Supabase keys to version control**
2. **Use environment variables** for production deployments
3. **Enable Row Level Security (RLS)** on all tables
4. **Use Supabase Auth** for better password security
5. **Regularly update your Supabase client library**

## Production Deployment

For production:
1. Use environment variables for Supabase credentials
2. Enable all security features
3. Set up proper backup strategies
4. Monitor your Supabase usage and costs
5. Consider using Supabase Edge Functions for complex operations

## Support

- Supabase Documentation: [https://supabase.com/docs](https://supabase.com/docs)
- Supabase Discord: [https://discord.supabase.com](https://discord.supabase.com)

