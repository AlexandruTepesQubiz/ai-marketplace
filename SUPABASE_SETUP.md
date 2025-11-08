# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication for the AI Marketplace.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Your ElevenLabs API key already configured

## Step 1: Create a Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in the project details:
   - **Name**: AI Marketplace (or your preferred name)
   - **Database Password**: Use a strong password (save this!)
   - **Region**: Choose the closest region to your users
4. Click "Create new project" and wait for it to initialize (1-2 minutes)

## Step 2: Get Your Supabase Credentials

1. Once your project is ready, go to **Project Settings** (gear icon in the sidebar)
2. Click on **API** in the settings menu
3. Copy the following values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

## Step 3: Update Your Environment Variables

1. Open `.env.local` in your project
2. Replace the Supabase placeholders with your actual values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_DB_PASSWORD=your_database_password
```

## Step 4: Run the Database Migration

1. In your Supabase dashboard, click on the **SQL Editor** (in the sidebar)
2. Click **New query**
3. Copy the entire contents of `supabase/migrations/001_initial_setup.sql`
4. Paste it into the SQL editor
5. Click **Run** to execute the migration

This will create:
- A `profiles` table to store user information
- Row Level Security (RLS) policies for data protection
- Automatic triggers to create profiles when users sign up

## Step 5: Configure Email Settings (Optional but Recommended)

For production, you should configure custom email templates:

1. Go to **Authentication** > **Email Templates** in your Supabase dashboard
2. Customize the email templates for:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password

For development, Supabase's default emails will work fine.

## Step 6: Test Authentication

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000

3. Click "Sign In" or "Get Started"

4. Try creating a new account:
   - Enter your email
   - Enter a password (minimum 6 characters)
   - Enter your full name
   - Click "Sign Up"

5. Check your email for the confirmation link (may be in spam)

6. Click the confirmation link to verify your email

7. You should now be logged in!

## Step 7: Verify Database Setup

1. Go to **Table Editor** in your Supabase dashboard
2. You should see a `profiles` table
3. After signing up, you should see your profile in this table

## Features Enabled

With authentication set up, users can now:

- Create accounts with email/password
- Sign in and sign out
- Use the voice transcription feature (requires authentication)
- Have their profile automatically created upon signup
- Both buy and sell on the marketplace (no restrictions)

## Security Notes

- Row Level Security (RLS) is enabled to protect user data
- Users can only read all profiles but can only modify their own
- Authentication state is managed securely with HTTP-only cookies
- API keys are properly scoped (anon key is safe for client-side use)

## Troubleshooting

### "Invalid API key" error
- Double-check that you copied the correct anon key from Supabase
- Make sure there are no extra spaces in your .env.local file

### "Email not confirmed" error
- Check your email inbox (and spam folder)
- In development, you can disable email confirmation in Supabase:
  - Go to Authentication > Settings
  - Disable "Enable email confirmations"

### Users can't sign up
- Check the browser console for errors
- Verify the SQL migration ran successfully
- Check Supabase logs: Authentication > Logs

### Changes not reflecting
- Restart your Next.js development server after changing .env.local
- Clear your browser cache/cookies

## Next Steps

Now that authentication is set up, you can:
- Build marketplace features (listings, search, etc.)
- Add AI-powered recommendations
- Implement buyer-seller messaging
- Add payment processing
- Create user dashboards
