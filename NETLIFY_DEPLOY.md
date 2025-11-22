# Netlify Deployment Guide

This guide will help you deploy the Class Attendance System to Netlify.

## Prerequisites

1. A Netlify account (sign up at [netlify.com](https://netlify.com))
2. Your Supabase project URL and API key
3. Git repository (GitHub, GitLab, or Bitbucket) - optional but recommended

## Method 1: Deploy via Netlify Dashboard (Recommended)

### Step 1: Prepare Your Repository

1. Push your code to GitHub, GitLab, or Bitbucket
2. Make sure all files are committed

### Step 2: Connect to Netlify

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Choose your Git provider (GitHub, GitLab, or Bitbucket)
4. Select your repository
5. Click "Deploy site"

### Step 3: Configure Build Settings

**Build settings:**
- **Build command**: Leave empty (or use `npm run build` if you want to use the build script)
- **Publish directory**: `.` (root directory)

### Step 4: Set Environment Variables

1. Go to **Site settings** → **Environment variables**
2. Add the following variables:

   ```
   SUPABASE_URL = https://your-project.supabase.co
   SUPABASE_ANON_KEY = your-anon-key-here
   ```

3. Click "Save"

### Step 5: Deploy

1. Go to **Deploys** tab
2. Click "Trigger deploy" → "Deploy site"
3. Wait for deployment to complete

### Step 6: Update Build Script (If Using)

If you want to use the build script to inject environment variables:

1. Go to **Site settings** → **Build & deploy** → **Build settings**
2. Set **Build command** to: `npm install && npm run build`
3. Save and redeploy

## Method 2: Deploy via Netlify CLI

### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

### Step 2: Login to Netlify

```bash
netlify login
```

### Step 3: Initialize Site

```bash
netlify init
```

Follow the prompts:
- Create & configure a new site
- Choose your team
- Set build command (leave empty or use `npm run build`)
- Set publish directory (use `.` for root)

### Step 4: Set Environment Variables

```bash
netlify env:set SUPABASE_URL "https://your-project.supabase.co"
netlify env:set SUPABASE_ANON_KEY "your-anon-key-here"
```

### Step 5: Deploy

```bash
netlify deploy --prod
```

## Method 3: Manual Deploy (Drag & Drop)

1. Go to [app.netlify.com](https://app.netlify.com)
2. Drag and drop your project folder to the deploy area
3. After deployment, go to **Site settings** → **Environment variables**
4. Add your Supabase credentials
5. Redeploy the site

**Note**: Manual deploy doesn't support environment variables in the same way. You'll need to:
- Either hardcode the values in `js/supabase.js` (not recommended for production)
- Or use Netlify Functions to serve the config
- Or use the build script approach

## Using Build Script with Environment Variables

If you want to inject environment variables during build:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. In Netlify, set build command:
   ```
   npm install && npm run build
   ```

4. Set environment variables in Netlify dashboard

## Post-Deployment

### Custom Domain (Optional)

1. Go to **Domain settings**
2. Click "Add custom domain"
3. Follow the instructions to configure your domain

### SSL Certificate

Netlify automatically provides SSL certificates for all sites (including custom domains).

### Environment-Specific Variables

You can set different values for:
- **Production**: Default environment
- **Deploy previews**: For pull requests
- **Branch deploys**: For specific branches

Go to **Site settings** → **Environment variables** to configure.

## Troubleshooting

### Issue: Environment variables not working

**Solution**: 
- Make sure variables are set in Netlify dashboard
- If using build script, ensure build command includes `npm run build`
- Check build logs for errors

### Issue: Supabase connection fails

**Solution**:
- Verify SUPABASE_URL and SUPABASE_ANON_KEY are correct
- Check Supabase project is active
- Ensure RLS policies allow public access (if needed)

### Issue: Build fails

**Solution**:
- Check build logs in Netlify dashboard
- Ensure `package.json` exists if using npm commands
- Verify all required files are in repository

### Issue: Site shows blank page

**Solution**:
- Check browser console for errors
- Verify all script files are loading
- Check that `index.html` is in root directory

## Continuous Deployment

Once connected to Git:
- Every push to main branch = automatic production deploy
- Pull requests = automatic preview deploy
- Branch pushes = branch deploy (if configured)

## Monitoring

- **Deploy logs**: View in Netlify dashboard
- **Function logs**: If using Netlify Functions
- **Analytics**: Enable in Netlify dashboard (paid feature)

## Security Notes

1. **Never commit `.env` file** - It's in `.gitignore`
2. **Use environment variables** in Netlify dashboard
3. **Rotate API keys** regularly
4. **Enable RLS** in Supabase for data security
5. **Use HTTPS** (automatic with Netlify)

## Support

- Netlify Docs: [https://docs.netlify.com](https://docs.netlify.com)
- Netlify Community: [https://community.netlify.com](https://community.netlify.com)

