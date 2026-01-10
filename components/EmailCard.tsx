"use client";

import { Email } from "@/types/email";
import { useState, useRef, MouseEvent, TouchEvent } from "react";

interface EmailCardProps {
  email: Email;
  onSwipeLeft: (email: Email) => void;
  onSwipeRight: (email: Email) => void;
  isTop: boolean;
}

export default function EmailCard({ email, onSwipeLeft, onSwipeRight, isTop }: EmailCardProps) {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleStart = (clientX: number) => {
    if (!isTop) return;
    setStartX(clientX);
    setCurrentX(clientX);
    setIsDragging(true);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || !isTop) return;
    setCurrentX(clientX);
  };

  const handleEnd = () => {
    if (!isDragging || !isTop) return;

    const diff = currentX - startX;
    const threshold = 100;

    if (diff > threshold) {
      // Swipe right - save
      onSwipeRight(email);
    } else if (diff < -threshold) {
      // Swipe left - delete
      onSwipeLeft(email);
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
  const rotation = translateX / 20;
  const opacity = 1 - Math.abs(translateX) / 300;

  return (
    <div
      ref={cardRef}
      className={`absolute w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 cursor-grab active:cursor-grabbing transition-all ${
        !isTop ? "pointer-events-none" : ""
      }`}
      style={{
        transform: `translateX(${translateX}px) rotate(${rotation}deg) scale(${isTop ? 1 : 0.95})`,
        opacity: isTop ? opacity : 0.5,
        zIndex: isTop ? 10 : 1,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe indicators */}
      {isDragging && (
        <>
          <div
            className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-lg transform rotate-12"
            style={{ opacity: Math.max(0, translateX / 200) }}
          >
            SAVE
          </div>
          <div
            className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-lg transform -rotate-12"
            style={{ opacity: Math.max(0, -translateX / 200) }}
          >
            DELETE
          </div>
        </>
      )}

      {/* Email content */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {email.from.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 truncate max-w-xs">
                {email.from}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{email.date}</p>
            </div>
          </div>
          {!email.isRead && (
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          )}
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 line-clamp-2">
          {email.subject}
        </h3>

        <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
          {email.preview}
        </p>
      </div>

      {/* Swipe hint for the first card */}
      {isTop && !isDragging && (
        <div className="mt-4 text-center text-sm text-gray-400">
          👈 Swipe to delete • Swipe to save 👉
        </div>
      )}
    </div>
  );
}
