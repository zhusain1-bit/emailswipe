"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { mockEmails } from "@/data/mockEmails";
import { Email } from "@/types/email";
import EmailCard from "@/components/EmailCard";

export default function Home() {
  const { data: session, status } = useSession();
  const [emails, setEmails] = useState<Email[]>([]);
  const [savedEmails, setSavedEmails] = useState<Email[]>([]);
  const [deletedEmails, setDeletedEmails] = useState<Email[]>([]);
  const [showFeedback, setShowFeedback] = useState<{
    type: "saved" | "deleted" | null;
    message: string;
  }>({ type: null, message: "" });
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"demo" | "real">("demo");

  // Fetch real emails when user is authenticated
  useEffect(() => {
    if (session && mode === "real") {
      fetchEmails();
    } else if (mode === "demo") {
      setEmails(mockEmails);
    }
  }, [session, mode]);

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
    setTimeout(() => setShowFeedback({ type: null, message: "" }), 2000);

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
    setTimeout(() => setShowFeedback({ type: null, message: "" }), 2000);

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

  const handleUndo = () => {
    if (savedEmails.length > 0) {
      const lastSaved = savedEmails[savedEmails.length - 1];
      setSavedEmails(savedEmails.slice(0, -1));
      setEmails([lastSaved, ...emails]);
    } else if (deletedEmails.length > 0) {
      const lastDeleted = deletedEmails[deletedEmails.length - 1];
      setDeletedEmails(deletedEmails.slice(0, -1));
      setEmails([lastDeleted, ...emails]);
    }
  };

  const handleReset = () => {
    setEmails(mockEmails);
    setSavedEmails([]);
    setDeletedEmails([]);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                📧 EmailSwipe
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tinder for your inbox
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {session && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setMode(mode === "demo" ? "real" : "demo")}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                      mode === "real"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {mode === "real" ? "Real Emails" : "Demo Mode"}
                  </button>
                </div>
              )}
              <div className="text-right">
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                  Saved: {savedEmails.length}
                </p>
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                  Deleted: {deletedEmails.length}
                </p>
              </div>
              {session ? (
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors text-sm"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => signIn("google")}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-sm"
                >
                  Sign In with Gmail
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center">
          {/* Email stack */}
          <div className="relative w-full max-w-md h-[500px] mb-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-4xl mb-4">⏳</div>
                <p className="text-gray-600 dark:text-gray-400">Loading emails...</p>
              </div>
            ) : emails.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Inbox Zero!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You've reviewed all your emails
                </p>
                <button
                  onClick={mode === "real" ? fetchEmails : handleReset}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  {mode === "real" ? "Refresh Emails" : "Reset Demo"}
                </button>
              </div>
            ) : (
              <>
                {emails.slice(0, 3).map((email, index) => (
                  <EmailCard
                    key={email.id}
                    email={email}
                    onSwipeLeft={handleSwipeLeft}
                    onSwipeRight={handleSwipeRight}
                    isTop={index === 0}
                  />
                ))}
              </>
            )}
          </div>

          {/* Controls */}
          {emails.length > 0 && (
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleSwipeLeft(emails[0])}
                className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all transform hover:scale-110 flex items-center justify-center text-2xl"
                aria-label="Delete email"
              >
                ✕
              </button>
              {(savedEmails.length > 0 || deletedEmails.length > 0) && (
                <button
                  onClick={handleUndo}
                  className="w-12 h-12 bg-gray-400 hover:bg-gray-500 text-white rounded-full shadow-lg transition-all transform hover:scale-110 flex items-center justify-center text-xl"
                  aria-label="Undo"
                >
                  ↺
                </button>
              )}
              <button
                onClick={() => handleSwipeRight(emails[0])}
                className="w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-all transform hover:scale-110 flex items-center justify-center text-2xl"
                aria-label="Save email"
              >
                ✓
              </button>
            </div>
          )}

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

          {/* Stats */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {emails.length} email{emails.length !== 1 ? "s" : ""} remaining
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
