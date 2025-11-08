# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication for the AI Marketplace.

> **⚡ Quick Note:** Users can sign in immediately without email confirmation! See Step 3 for how to disable email confirmation.

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

## Step 3: Disable Email Confirmation (Recommended for Development)

To allow users to sign in immediately without email confirmation:

1. In your Supabase dashboard, go to **Authentication** > **Providers**
2. Scroll down to **Auth Providers** section
3. Click on **Email** provider
4. Find the **Confirm email** toggle
5. **Turn OFF** the "Confirm email" option
6. Click **Save**

Now users can sign in immediately after signing up without needing to confirm their email!

## Step 4: Update Your Environment Variables

1. Open `.env.local` in your project
2. Replace the Supabase placeholders with your actual values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_DB_PASSWORD=your_database_password
```

## Step 5: Run the Database Migration

1. In your Supabase dashboard, click on the **SQL Editor** (in the sidebar)
2. Click **New query**
3. Copy the entire contents of `supabase/migrations/001_initial_setup.sql`
4. Paste it into the SQL editor
5. Click **Run** to execute the migration

This will create:
- A `profiles` table to store user information
- Row Level Security (RLS) policies for data protection
- Automatic triggers to create profiles when users sign up

## Step 6: Configure Email Settings (Optional)

For production, you can configure custom email templates:

1. Go to **Authentication** > **Email Templates** in your Supabase dashboard
2. Customize the email templates for:
   - Magic Link
   - Change Email Address
   - Reset Password

Note: Since email confirmation is disabled, you don't need to customize the confirmation email template.

## Step 7: Test Authentication

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000

3. Click "Sign Up" button

4. Create a new account:
   - Enter your email
   - Enter a password (minimum 6 characters)
   - Enter your full name
   - Click "Sign Up"

5. You should be automatically logged in! No email confirmation needed.

6. Your name should appear in the header with your initials in a blue circle.

## Step 8: Verify Database Setup

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

### Users can't sign up
- Check the browser console for errors
- Verify the SQL migration ran successfully
- Check Supabase logs: **Authentication** > **Logs**
- Make sure email confirmation is disabled (Step 3)

### Users can't sign in immediately after signup
- Verify that email confirmation is turned OFF in Supabase
- Go to **Authentication** > **Providers** > **Email** and ensure "Confirm email" is disabled

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
