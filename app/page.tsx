"use client";

import { useState } from "react";
import { mockEmails } from "@/data/mockEmails";
import { Email } from "@/types/email";
import EmailCard from "@/components/EmailCard";

export default function Home() {
  const [emails, setEmails] = useState<Email[]>(mockEmails);
  const [savedEmails, setSavedEmails] = useState<Email[]>([]);
  const [deletedEmails, setDeletedEmails] = useState<Email[]>([]);
  const [showFeedback, setShowFeedback] = useState<{
    type: "saved" | "deleted" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleSwipeLeft = (email: Email) => {
    // Remove from emails
    setEmails(emails.filter((e) => e.id !== email.id));
    setDeletedEmails([...deletedEmails, email]);

    // Show feedback
    setShowFeedback({ type: "deleted", message: "Email deleted" });
    setTimeout(() => setShowFeedback({ type: null, message: "" }), 2000);
  };

  const handleSwipeRight = (email: Email) => {
    // Remove from emails
    setEmails(emails.filter((e) => e.id !== email.id));
    setSavedEmails([...savedEmails, email]);

    // Show feedback
    setShowFeedback({ type: "saved", message: "Email saved" });
    setTimeout(() => setShowFeedback({ type: null, message: "" }), 2000);
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
              <div className="text-right">
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                  Saved: {savedEmails.length}
                </p>
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                  Deleted: {deletedEmails.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center">
          {/* Email stack */}
          <div className="relative w-full max-w-md h-[500px] mb-8">
            {emails.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
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
                  Reset Demo
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
