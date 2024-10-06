// components/Header.js

import React from "react";

interface HeaderProps {
  title: string;
  showBackButton: boolean;
  onBack: () => void;
}

export default function Header({ title, showBackButton, onBack }: HeaderProps) {
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Back button or placeholder */}
        {showBackButton ? (
          <button
            className="text-gray-600 hover:text-gray-800"
            onClick={onBack}
          >
            {/* Left arrow icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        ) : (
          <div className="w-6" /> // Placeholder to keep title centered
        )}

        {/* Page title */}
        <h1 className="text-xl font-semibold text-gray-800 text-center flex-grow">
          {title}
        </h1>

        {/* Placeholder to balance flex items */}
        <div className="w-6" />
      </div>
    </header>
  );
}