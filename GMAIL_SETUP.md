# Gmail API Setup Guide

This guide will walk you through setting up Gmail integration for EmailSwipe.

## Prerequisites

- A Google account with Gmail
- Access to Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top and select **"New Project"**
3. Enter a project name (e.g., "EmailSwipe")
4. Click **"Create"**

## Step 2: Enable the Gmail API

1. In your Google Cloud Console, make sure your new project is selected
2. Go to **"APIs & Services"** > **"Library"**
3. Search for **"Gmail API"**
4. Click on it and then click **"Enable"**

## Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** > **"OAuth consent screen"**
2. Select **"External"** user type (unless you have a Google Workspace account)
3. Click **"Create"**
4. Fill in the required fields:
   - **App name**: EmailSwipe
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click **"Save and Continue"**
6. On the **Scopes** page, click **"Add or Remove Scopes"**
7. Add the following scopes:
   - `https://www.googleapis.com/auth/gmail.modify`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
8. Click **"Save and Continue"**
9. On **Test users**, add your Gmail address as a test user
10. Click **"Save and Continue"**
11. Review and click **"Back to Dashboard"**

## Step 4: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** > **"Credentials"**
2. Click **"Create Credentials"** > **"OAuth client ID"**
3. Select **"Web application"** as the application type
4. Enter a name (e.g., "EmailSwipe Web Client")
5. Under **"Authorized JavaScript origins"**, add:
   ```
   http://localhost:3000
   ```
6. Under **"Authorized redirect URIs"**, add:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. Click **"Create"**
8. A dialog will appear with your **Client ID** and **Client Secret**
   - **IMPORTANT**: Copy these values immediately!

## Step 5: Configure Environment Variables

1. Open the `.env.local` file in your EmailSwipe project
2. Replace the placeholder values with your credentials:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-here
GOOGLE_CLIENT_ID=your-client-id-from-step-4
GOOGLE_CLIENT_SECRET=your-client-secret-from-step-4
```

### Generating NEXTAUTH_SECRET

Run this command in your terminal to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and paste it as your `NEXTAUTH_SECRET` value.

## Step 6: Start the Application

1. Restart your development server if it's running:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000 in your browser

3. Click **"Sign In with Gmail"**

4. You'll be redirected to Google's OAuth consent screen

5. Grant the requested permissions

6. You'll be redirected back to EmailSwipe

7. Click the **"Demo Mode"** button to switch to **"Real Emails"**

8. Your actual Gmail emails will now load!

## Troubleshooting

### "Access blocked" error

- Make sure you added your Gmail address as a test user in the OAuth consent screen
- Your app is in "Testing" mode and can only be used by test users you specify

### "Redirect URI mismatch" error

- Double-check that you added `http://localhost:3000/api/auth/callback/google` to the authorized redirect URIs
- Make sure there are no extra spaces or typos

### Emails not loading

- Check the browser console for error messages
- Verify that the Gmail API is enabled in your Google Cloud project
- Make sure your access token hasn't expired (sign out and sign back in)

### Publishing Your App (Optional)

If you want to use this app without adding test users:

1. Go to **OAuth consent screen**
2. Click **"Publish App"**
3. Submit for verification (this process can take several days)

**Note**: For personal use, keeping it in testing mode with yourself as a test user is sufficient.

## Security Notes

- **Never commit your `.env.local` file to Git** (it's already in `.gitignore`)
- Keep your Client ID and Client Secret private
- If you accidentally expose your credentials, revoke them in Google Cloud Console and create new ones
- The app only requests the minimum permissions needed (read and modify emails)

## Next Steps

Once configured, you can:
- Toggle between Demo and Real Emails mode
- Swipe left to delete emails (moves to trash)
- Swipe right to archive emails (removes from inbox)
- Switch back to Demo mode anytime to test without affecting real emails

Enjoy swiping through your inbox!
