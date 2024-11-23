"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface StudentGradingSelectionProps {
  courseId: string;
}

const StudentGradingSelection: React.FC<StudentGradingSelectionProps> = ({
  courseId,
}) => {
  const router = useRouter();
  const [showPeerReport, setShowPeerReport] = useState(false);
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await fetch("/api/session");
        const data = await response.json();

        if (response.ok && data.authenticated) {
          if (data.user && data.user.role) {
            setUserRole(data.user.role);
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

  const handleBackNavigation = () => {
    router.push("/dashboard/student");
  };

  const handleButtonClick = (category: string) => {
    if (category === "Peer Grading of Group Report") {
      setShowPeerReport(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <button
            onClick={handleBackNavigation}
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
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Student Grading
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {showPeerReport ? (
            <PeerScoresForm
              courseId={courseId}
              onSuccess={() => console.log("Success")}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {["Peer Grading of Group Report"].map((category) => (
                <div
                  key={category}
                  onClick={() => handleButtonClick(category)}
                  className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  <div className="p-6">
                    <div className="mb-4">
                      <svg
                        className="w-12 h-12 text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                      {category}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Grade and provide feedback for your peers' group reports
                    </p>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentGradingSelection;
