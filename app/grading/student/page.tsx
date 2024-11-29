"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSettings } from "@/app/contexts/SettingsContext";

const StudentGradingPage = () => {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>("");
  const [courseId, setCourseId] = useState<string>("");
  const { t } = useSettings();

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await fetch("/api/session");
        const data = await response.json();

        if (response.ok && data.authenticated) {
          if (data.user && data.user.role) {
            setUserRole(data.user.role);
            setCourseId(data.user.course_id);
          } else {
            console.error("No user role found in session");
            router.push("/select-course");
          }
        } else {
          console.error("Invalid session response:", data);
          router.push("/select-course");
        }
      } catch (error) {
        console.error("Error fetching session data:", error);
        router.push("/select-course");
      }
    };

    fetchSessionData();
  }, [router]);

  const handleBackToDashboard = () => {
    router.push("/dashboard/student");
  };

  const handlePeerReportClick = () => {
    router.push(`/grading/peer-report`);
  };

  const gradingOptions = [
    {
      id: "PeerGrading",
      title: t.peerGradingTitle,
      description: t.peerGradingDesc,
      icon: "📊",
      color: "from-blue-500 to-blue-600",
      onClick: handlePeerReportClick,
    },
    // Add more options here if needed
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <button
            onClick={handleBackToDashboard}
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
            <span>{t.backToDashboard}</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {t.studentGradingDashboard}
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {t.selectCategoryToGrade}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gradingOptions.map((option) => (
              <div
                key={option.id}
                onClick={option.onClick}
                className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />
                <div className="p-6">
                  <div className="text-4xl mb-4">{option.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {option.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {option.description}
                  </p>
                </div>
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${option.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentGradingPage;
