# EmailSwipe 📧

Tinder for your inbox - swipe through emails in seconds

## About

EmailSwipe is a fun and intuitive way to manage your emails. Just like swiping on dating apps, you can quickly go through your emails by:
- **Swiping left** to delete unwanted emails
- **Swiping right** to save important ones

## Features

- 📬 **Gmail Integration** - Connect your real Gmail account
- 🎯 Intuitive swipe gestures (mobile and desktop)
- 🎨 Beautiful, modern UI with dark mode support
- 📊 Track saved and deleted emails
- ↺ Undo functionality
- 🎉 Inbox Zero celebration
- 🔘 Button controls as alternative to swiping
- 🔄 Toggle between Demo mode and Real emails
- 🔐 Secure OAuth 2.0 authentication

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

### Gmail Integration Setup (Optional)

To connect your real Gmail account:

1. Follow the detailed instructions in [GMAIL_SETUP.md](GMAIL_SETUP.md)
2. You'll need to create a Google Cloud project and get OAuth credentials
3. Add your credentials to the `.env.local` file
4. Sign in with Gmail and toggle to "Real Emails" mode

**Note**: The app works perfectly in Demo mode without any setup!

### Building for Production

```bash
npm run build
npm start
```

## How to Use

### Demo Mode (No Setup Required)

1. Open the app and you'll see a stack of email cards with sample data
2. Swipe left (or click the ✕ button) to delete an email
3. Swipe right (or click the ✓ button) to save an email
4. Use the undo button (↺) to reverse your last action
5. Track your progress with the counter at the top

### Real Gmail Mode (After Setup)

1. Click "Sign In with Gmail" in the header
2. Authorize the app to access your Gmail
3. Toggle from "Demo Mode" to "Real Emails"
4. Swipe left to **move emails to trash**
5. Swipe right to **archive emails** (removes from inbox)
6. Your actual Gmail is modified in real-time!

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **NextAuth.js** - OAuth authentication
- **Google Gmail API** - Email integration
- **React Hooks** - State management

## Future Enhancements

- ✅ ~~Gmail integration~~ (Complete!)
- ✅ ~~OAuth authentication~~ (Complete!)
- Microsoft Outlook/Office 365 integration
- Email filtering and search
- Custom swipe actions (star, mark as important, etc.)
- Analytics and insights
- Keyboard shortcuts
- Mobile app (React Native)

## License

MIT
