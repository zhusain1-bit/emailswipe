"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { mockEmails } from "@/data/mockEmails";
import { Email } from "@/types/email";
import EmailListItem from "@/components/EmailListItem";

export default function Home() {
  const { data: session, status } = useSession();
  const [emails, setEmails] = useState<Email[]>(mockEmails);
  const [savedEmails, setSavedEmails] = useState<Email[]>([]);
  const [deletedEmails, setDeletedEmails] = useState<Email[]>([]);
  const [showFeedback, setShowFeedback] = useState<{
    type: "saved" | "deleted" | null;
    message: string;
  }>({ type: null, message: "" });
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"demo" | "real">("demo");
  const hasLoadedRef = useRef<{ demo: boolean; real: boolean }>({
    demo: true,
    real: false,
  });

  // Only fetch emails when switching modes and haven't loaded yet
  useEffect(() => {
    if (mode === "real" && session && !hasLoadedRef.current.real) {
      fetchEmails();
      hasLoadedRef.current.real = true;
    } else if (mode === "demo" && !hasLoadedRef.current.demo) {
      setEmails(mockEmails);
      hasLoadedRef.current.demo = true;
    }
  }, [mode, session]);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/emails");
      const data = await response.json();
      if (data.emails) {
        setEmails(data.emails);
      }
    } catch (error) {
      console.error("Error fetching emails:", error);
      setShowFeedback({ type: "deleted", message: "Failed to fetch emails" });
      setTimeout(() => setShowFeedback({ type: null, message: "" }), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipeLeft = async (email: Email) => {
    // Remove from emails
    setEmails(emails.filter((e) => e.id !== email.id));
    setDeletedEmails([...deletedEmails, email]);

    // Show feedback
    setShowFeedback({ type: "deleted", message: "Email deleted" });
    setTimeout(() => setShowFeedback({ type: null, message: "" }), 1500);

    // Call API if in real mode
    if (mode === "real" && session) {
      try {
        await fetch("/api/emails/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emailId: email.id }),
        });
      } catch (error) {
        console.error("Error deleting email:", error);
      }
    }
  };

  const handleSwipeRight = async (email: Email) => {
    // Remove from emails
    setEmails(emails.filter((e) => e.id !== email.id));
    setSavedEmails([...savedEmails, email]);

    // Show feedback
    setShowFeedback({ type: "saved", message: "Email archived" });
    setTimeout(() => setShowFeedback({ type: null, message: "" }), 1500);

    // Call API if in real mode
    if (mode === "real" && session) {
      try {
        await fetch("/api/emails/archive", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emailId: email.id }),
        });
      } catch (error) {
        console.error("Error archiving email:", error);
      }
    }
  };

  const handleModeToggle = () => {
    const newMode = mode === "demo" ? "real" : "demo";
    setMode(newMode);
    setSavedEmails([]);
    setDeletedEmails([]);

    // Reset emails based on mode
    if (newMode === "demo") {
      setEmails(mockEmails);
    }
  };

  const handleReset = () => {
    if (mode === "real") {
      hasLoadedRef.current.real = false;
      fetchEmails();
    } else {
      setEmails(mockEmails);
    }
    setSavedEmails([]);
    setDeletedEmails([]);
  };

  // Group emails by date
  const groupedEmails = emails.reduce((groups, email) => {
    const date = email.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(email);
    return groups;
  }, {} as Record<string, Email[]>);

  const sortedDates = Object.keys(groupedEmails).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  // Show loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                📧 EmailSwipe
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Swipe to manage your inbox
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {session && (
                <button
                  onClick={handleModeToggle}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    mode === "real"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {mode === "real" ? "Real Emails" : "Demo Mode"}
                </button>
              )}
              {session ? (
                <button
                  onClick={() => signOut()}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors text-xs"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => signIn("google")}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-xs"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-3 flex items-center justify-between text-sm">
            <div className="flex space-x-4">
              <span className="text-gray-600 dark:text-gray-400">
                {emails.length} remaining
              </span>
              <span className="text-green-600 dark:text-green-400">
                ✓ {savedEmails.length} archived
              </span>
              <span className="text-red-600 dark:text-red-400">
                🗑️ {deletedEmails.length} deleted
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-600 dark:text-gray-400">Loading emails...</p>
          </div>
        ) : emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Inbox Zero!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You've reviewed all your emails
            </p>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              {mode === "real" ? "Refresh Emails" : "Reset Demo"}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date) => (
              <div key={date} className="space-y-3">
                {/* Date header */}
                <div className="flex items-center space-x-3">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                    {formatDate(date)}
                  </h2>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {groupedEmails[date].length} email{groupedEmails[date].length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Emails for this date */}
                <div className="space-y-2">
                  {groupedEmails[date].map((email) => (
                    <EmailListItem
                      key={email.id}
                      email={email}
                      onSwipeLeft={handleSwipeLeft}
                      onSwipeRight={handleSwipeRight}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Swipe hint */}
        {emails.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            👈 Swipe left to delete • Swipe right to archive 👉
          </div>
        )}
      </main>

      {/* Feedback toast */}
      {showFeedback.type && (
        <div
          className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white font-semibold transition-all ${
            showFeedback.type === "saved" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {showFeedback.message}
        </div>
      )}
    </div>
  );
}
