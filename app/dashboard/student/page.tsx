"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSettings } from "../../contexts/SettingsContext";
import SettingsButtons from "../../components/SettingsButtons";

const StudentHome = () => {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { t } = useSettings();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/dashboard");
        const data = await response.json();

        if (response.ok && data.name) {
          setUserName(data.name);
        } else {
          console.error("Failed to fetch user data:", data.error);
          router.push("/select-course");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        router.push("/select-course");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

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
              <span>{t.backToCourses}</span>
            </button>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 text-transparent bg-clip-text">
              {t.studentDashboard}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <SettingsButtons />
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
              <span>{t.logout}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center space-y-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
            {loading ? t.loading : `${t.welcome}, ${userName}`}
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
    </div>
  );
};

export default StudentHome;
