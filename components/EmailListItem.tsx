"use client";

import { Email } from "@/types/email";
import { useState, useRef, MouseEvent, TouchEvent } from "react";

interface EmailListItemProps {
  email: Email;
  onSwipeLeft: (email: Email) => void;
  onSwipeRight: (email: Email) => void;
}

export default function EmailListItem({ email, onSwipeLeft, onSwipeRight }: EmailListItemProps) {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  const handleStart = (clientX: number) => {
    setStartX(clientX);
    setCurrentX(clientX);
    setIsDragging(true);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    setCurrentX(clientX);
  };

  const handleEnd = () => {
    if (!isDragging) return;

    const diff = currentX - startX;
    const threshold = 100;

    if (diff > threshold) {
      // Swipe right - archive/save
      setIsCompleted(true);
      setTimeout(() => onSwipeRight(email), 300);
    } else if (diff < -threshold) {
      // Swipe left - delete
      setIsCompleted(true);
      setTimeout(() => onSwipeLeft(email), 300);
    }

    setIsDragging(false);
    setStartX(0);
    setCurrentX(0);
  };

  // Mouse events
  const handleMouseDown = (e: MouseEvent) => {
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleEnd();
    }
  };

  // Touch events
  const handleTouchStart = (e: TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  const translateX = isDragging ? currentX - startX : 0;
  const opacity = isCompleted ? 0 : 1;
  const scale = isCompleted ? 0.9 : 1;

  return (
    <div
      ref={itemRef}
      className="relative mb-3 cursor-grab active:cursor-grabbing touch-none"
      style={{
        transform: `translateX(${translateX}px) scale(${scale})`,
        opacity,
        transition: isDragging ? "none" : "all 0.3s ease",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background indicators */}
      <div className="absolute inset-0 flex items-center justify-between px-6">
        <div
          className="text-red-500 font-bold text-lg"
          style={{ opacity: Math.max(0, -translateX / 200) }}
        >
          🗑️ DELETE
        </div>
        <div
          className="text-green-500 font-bold text-lg"
          style={{ opacity: Math.max(0, translateX / 200) }}
        >
          ✓ ARCHIVE
        </div>
      </div>

      {/* Email content */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border-l-4 border-transparent hover:border-blue-500 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {email.from.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {email.from}
                </p>
              </div>
              {!email.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
              )}
            </div>
            <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">
              {email.subject}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {email.preview}
            </p>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
            {email.date}
          </span>
        </div>
      </div>
    </div>
  );
}
