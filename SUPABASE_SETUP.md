# Supabase Setup Guide

This guide will help you set up Supabase for the AI Docstring Generator project.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Supabase CLI installed (`npm install -g supabase`)
- A Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Step 1: Create a New Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in your project details:
   - **Name**: ai-docstring-generator
   - **Database Password**: (choose a strong password)
   - **Region**: (choose closest to your users)
4. Click "Create new project"

## Step 2: Get Your Project Credentials

1. Go to Project Settings > API
2. Copy the following values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the values in `.env`:
   ```env
   VITE_SUPABASE_URL=your_project_url_here
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

## Step 4: Run Database Migrations

### Option A: Using Supabase Dashboard (Recommended for first-time setup)

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/20240101000000_create_docgen_history.sql`
4. Paste into the SQL Editor
5. Click "Run"

### Option B: Using Supabase CLI

```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## Step 5: Deploy Edge Functions

### Using Supabase CLI

1. Install the Supabase CLI if you haven't already:
   ```bash
   npm install -g supabase
   ```

2. Login and link your project:
   ```bash
   supabase login
   supabase link --project-ref your-project-ref
   ```

3. Set the Gemini API key as a secret:
   ```bash
   supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Deploy the Edge Function:
   ```bash
   supabase functions deploy generate-docstring
   ```

### Verify Deployment

You can test your Edge Function:
```bash
curl -L -X POST 'https://your-project-ref.supabase.co/functions/v1/generate-docstring' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "language": "python",
    "functions": [{
      "name": "add",
      "params": ["a", "b"],
      "body": "return a + b",
      "type": "function"
    }],
    "format": "google"
  }'
```

## Step 6: Configure Authentication (Optional)

### Enable Email Authentication

1. Go to Authentication > Providers
2. Enable "Email" provider
3. Configure email templates if desired

### Enable GitHub OAuth (Optional)

1. Create a GitHub OAuth App:
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Click "New OAuth App"
   - **Homepage URL**: `https://your-project-ref.supabase.co`
   - **Authorization callback URL**: `https://your-project-ref.supabase.co/auth/v1/callback`
2. Copy Client ID and Client Secret
3. In Supabase Dashboard:
   - Go to Authentication > Providers
   - Enable GitHub
   - Paste Client ID and Client Secret

### Enable Google OAuth (Optional)

1. Create Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://your-project-ref.supabase.co/auth/v1/callback`
2. Copy Client ID and Client Secret
3. In Supabase Dashboard:
   - Go to Authentication > Providers
   - Enable Google
   - Paste Client ID and Client Secret

## Step 7: Verify Setup

1. Start your development server:
   ```bash
   npm install
   npm run dev
   ```

2. Test the following:
   - [ ] File upload works
   - [ ] Functions are detected
   - [ ] Docstring generation works
   - [ ] Authentication works (if enabled)
   - [ ] History is saved (if logged in)

## Troubleshooting

### Edge Function Issues

- Check logs: `supabase functions logs generate-docstring`
- Verify secrets are set: `supabase secrets list`
- Check function URL: Should be `https://your-project-ref.supabase.co/functions/v1/generate-docstring`

### Database Issues

- Check table exists: Run `SELECT * FROM docgen_history LIMIT 1;` in SQL Editor
- Verify RLS policies: Go to Authentication > Policies

### Authentication Issues

- Check redirect URLs in provider settings
- Verify site URL in Authentication > URL Configuration
- Check browser console for errors

## Security Notes

1. **Never commit your `.env` file** - it contains sensitive keys
2. **Keep your Gemini API key secret** - store only in Supabase secrets
3. **Use RLS policies** - they're already configured to protect user data
4. **Regular backups** - Enable automatic backups in Project Settings

## Production Checklist

Before deploying to production:

- [ ] Enable database backups
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring and alerts
- [ ] Review and test RLS policies
- [ ] Set up proper error tracking
- [ ] Configure rate limiting if needed
- [ ] Review Gemini API quotas and limits

## Support

For issues specific to:
- **Supabase**: [Supabase Docs](https://supabase.com/docs) or [Discord](https://discord.supabase.com)
- **Gemini API**: [Google AI Documentation](https://ai.google.dev/docs)
- **This project**: Open an issue on GitHub
