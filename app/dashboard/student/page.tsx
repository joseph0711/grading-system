"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const StudentHome = () => {
  const router = useRouter();

  const handleGradingClick = () => {
    router.push("/grading/student");
  };

  const handleCourseInfoClick = () => {
    router.push("/course-info");
  };

  const handleViewScoreClick = () => {
    router.push("/view-score");
  };

  const handleBackToSelectCourse = async () => {
    try {
      // Clear the course_id cookie when going back to course selection
      await fetch("/api/set-course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId: "" }), // Empty string to clear the cookie
      });
      router.push("/select-course");
    } catch (error) {
      console.error("Error clearing course:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header Section */}
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToSelectCourse}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>Back to Courses</span>
            </button>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 text-transparent bg-clip-text">
              Student Dashboard
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500/90 hover:bg-red-600 text-white rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center space-y-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
            Welcome to Your Dashboard
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
            {[
              {
                title: "Grading",
                description: "Grade assignments and peer reviews",
                icon: "📝",
                onClick: handleGradingClick,
                className: "bg-gradient-to-br from-blue-500 to-blue-600",
              },
              {
                title: "Course Info",
                description: "View course details and materials",
                icon: "📚",
                onClick: handleCourseInfoClick,
                className: "bg-gradient-to-br from-green-500 to-green-600",
              },
              {
                title: "View Score",
                description: "Check your grades and feedback",
                icon: "📊",
                onClick: handleViewScoreClick,
                className: "bg-gradient-to-br from-yellow-500 to-yellow-600",
              },
            ].map((item) => (
              <div
                key={item.title}
                onClick={item.onClick}
                className={`${item.className} p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer text-white`}
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-sm opacity-90">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            © 2024 Student Portal
          </span>
          <button
            onClick={handleLogout}
            className="inline-flex items-center space-x-2 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>Settings</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default StudentHome;
