# Quick Start Guide

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Create .env File

Copy `.env.example` to `.env` and add your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run Build Script (Optional)

To inject environment variables into `js/supabase.js`:

```bash
npm run build
```

### 4. Start Local Server

```bash
npm run dev
```

Or use any static file server:
- Python: `python -m http.server 8000`
- Node: `npx serve .`
- VS Code: Use Live Server extension

## Netlify Deployment

### Option 1: Using Git (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. Connect repository to Netlify
3. Set environment variables in Netlify dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
4. Deploy automatically on push

### Option 2: Manual Deploy

1. Run build: `npm run build`
2. Drag & drop the folder to Netlify
3. Set environment variables in Netlify dashboard

See `NETLIFY_DEPLOY.md` for detailed instructions.

## Environment Variables

### Local Development
- Use `.env` file (not committed to git)
- Run `npm run build` to inject into code

### Netlify
- Set in Netlify dashboard: Site settings → Environment variables
- Build script will automatically use them

## Important Notes

- ✅ `.env` file is in `.gitignore` (never commit secrets)
- ✅ Build script injects env vars at build time
- ✅ Netlify automatically runs build on deploy
- ⚠️  Never commit `.env` file with real credentials

