"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Email } from "@/types/email";
import EmailCard from "@/components/EmailCard";

type ViewMode = "months" | "swipe";

const MONTH_COLORS = [
  "bg-pink-500",
  "bg-blue-400",
  "bg-indigo-600",
  "bg-orange-500",
  "bg-amber-400",
  "bg-yellow-400",
  "bg-sky-400",
  "bg-red-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-teal-500",
  "bg-rose-500",
];

export default function Home() {
  const { data: session, status } = useSession();
  const [allEmails, setAllEmails] = useState<Email[]>([]);
  const [currentMonthEmails, setCurrentMonthEmails] = useState<Email[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("months");
  const [keptEmails, setKeptEmails] = useState<Email[]>([]);
  const [deletedEmails, setDeletedEmails] = useState<Email[]>([]);
  const [showFeedback, setShowFeedback] = useState<{
    type: "kept" | "deleted" | null;
    message: string;
  }>({ type: null, message: "" });
  const [loading, setLoading] = useState(false);

  // Fetch emails when user is authenticated
  useEffect(() => {
    if (session) {
      fetchEmails();
    }
  }, [session]);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/emails");
      const data = await response.json();
      if (data.emails) {
        setAllEmails(data.emails);
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
    // Remove from current month emails
    setCurrentMonthEmails(currentMonthEmails.filter((e) => e.id !== email.id));
    setAllEmails(allEmails.filter((e) => e.id !== email.id));
    setDeletedEmails([...deletedEmails, email]);

    // Show feedback
    setShowFeedback({ type: "deleted", message: "Email deleted" });
    setTimeout(() => setShowFeedback({ type: null, message: "" }), 1500);

    // Call delete API
    if (session) {
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
    // Just remove from view - keep the email in inbox
    setCurrentMonthEmails(currentMonthEmails.filter((e) => e.id !== email.id));
    setAllEmails(allEmails.filter((e) => e.id !== email.id));
    setKeptEmails([...keptEmails, email]);

    // Show feedback
    setShowFeedback({ type: "kept", message: "Email kept" });
    setTimeout(() => setShowFeedback({ type: null, message: "" }), 1500);

    // No API call - just remove from view
  };

  const handleReset = () => {
    fetchEmails();
    setKeptEmails([]);
    setDeletedEmails([]);
    setViewMode("months");
  };

  // Group emails by month
  const groupedByMonth = allEmails.reduce((groups, email) => {
    const date = new Date(email.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(email);
    return groups;
  }, {} as Record<string, Email[]>);

  const sortedMonths = Object.keys(groupedByMonth).sort((a, b) => b.localeCompare(a));

  // Format month for display
  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    }).toUpperCase().replace(", ", " '");
  };

  const handleMonthClick = (monthKey: string) => {
    setSelectedMonth(monthKey);
    setCurrentMonthEmails([...groupedByMonth[monthKey]]);
    setViewMode("swipe");
  };

  const handleBackToMonths = () => {
    setViewMode("months");
    setSelectedMonth("");
  };

  // Show loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
          Loading...
        </div>
      </div>
    );
  }

  // Not signed in
  if (!session) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black mb-4 text-gray-900 dark:text-white">
            swipewipe
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Sign in with Gmail to start swiping through your emails
          </p>
          <button
            onClick={() => signIn("google")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            Sign In with Gmail
          </button>
        </div>
      </div>
    );
  }

  // Month selection view
  if (viewMode === "months") {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Impact, sans-serif' }}>
              swipewipe
            </h1>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => signOut()}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors text-xs"
              >
                Sign Out
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <div className="w-8 h-8 flex flex-col justify-center items-center space-y-1">
                  <div className="w-6 h-0.5 bg-gray-900 dark:bg-white"></div>
                  <div className="w-6 h-0.5 bg-gray-900 dark:bg-white"></div>
                  <div className="w-6 h-0.5 bg-gray-900 dark:bg-white"></div>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Month blocks */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-600 dark:text-gray-400">Loading emails...</p>
          </div>
        ) : allEmails.length === 0 ? (
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
              Refresh Emails
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            {sortedMonths.map((monthKey, index) => (
              <button
                key={monthKey}
                onClick={() => handleMonthClick(monthKey)}
                className={`${MONTH_COLORS[index % MONTH_COLORS.length]} text-white py-16 px-8 text-left hover:opacity-90 transition-opacity`}
              >
                <h2 className="text-5xl font-black tracking-tight">
                  {formatMonth(monthKey)}
                </h2>
                <p className="text-white/90 mt-2 text-sm">
                  {groupedByMonth[monthKey].length} email{groupedByMonth[monthKey].length !== 1 ? "s" : ""}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Swipe view
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBackToMonths}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatMonth(selectedMonth)}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Swipe to manage emails
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right text-sm">
                <p className="text-green-600 dark:text-green-400">
                  Kept: {keptEmails.length}
                </p>
                <p className="text-red-600 dark:text-red-400">
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
            {currentMonthEmails.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  All Done!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You've reviewed all emails for this month
                </p>
                <button
                  onClick={handleBackToMonths}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Back to Months
                </button>
              </div>
            ) : (
              <>
                {currentMonthEmails.slice(0, 3).map((email, index) => (
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
          {currentMonthEmails.length > 0 && (
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleSwipeLeft(currentMonthEmails[0])}
                className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all transform hover:scale-110 flex items-center justify-center text-2xl"
                aria-label="Delete email"
              >
                ✕
              </button>
              <button
                onClick={() => handleSwipeRight(currentMonthEmails[0])}
                className="w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-all transform hover:scale-110 flex items-center justify-center text-2xl"
                aria-label="Keep email"
              >
                ✓
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {currentMonthEmails.length} email{currentMonthEmails.length !== 1 ? "s" : ""} remaining
            </p>
          </div>
        </div>
      </main>

      {/* Feedback toast */}
      {showFeedback.type && (
        <div
          className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white font-semibold transition-all ${
            showFeedback.type === "kept" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {showFeedback.message}
        </div>
      )}
    </div>
  );
}
