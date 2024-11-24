"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSettings } from "../contexts/SettingsContext";

interface Course {
  course_id: string;
  course_name: string;
  course_description: string;
  teacher_name: string;
}

interface SelectCourseProps {
  onCourseSelect: (courseId: string) => void;
  onLogout: () => void;
}

const SelectCourse: React.FC<SelectCourseProps> = () => {
  const router = useRouter();
  const { t } = useSettings();
  const [courses, setCourses] = useState<Course[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessionRes = await fetch("/api/session");
        const sessionData = await sessionRes.json();
        if (sessionData.authenticated) {
          setUserRole(sessionData.user.role);
        }

        const coursesRes = await fetch("/api/select-course");
        const coursesData = await coursesRes.json();
        if (coursesRes.ok) {
          setCourses(coursesData.courses);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEnterCourse = async (courseId: string) => {
    try {
      const response = await fetch("/api/set-course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId }),
      });

      if (!response.ok) {
        throw new Error("Failed to set course");
      }

      if (userRole === "teacher") {
        router.push("/dashboard/teacher");
      } else if (userRole === "student") {
        router.push("/dashboard/student");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to enter course");
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="h-16 w-16">
                <div className="absolute h-16 w-16 rounded-full border-4 border-t-blue-500 border-b-blue-700 border-l-blue-600 border-r-blue-600 animate-spin"></div>
                <div className="absolute h-16 w-16 rounded-full border-4 border-blue-500 opacity-20"></div>
              </div>
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-lg font-medium">
              {t.loadingCourses}
            </div>
            <div className="text-gray-400 dark:text-gray-500 text-sm">
              {t.pleaseWaitCourses}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 text-transparent bg-clip-text">
            {t.myCourses}
          </h1>
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
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <div
              key={course.course_id}
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <div className="h-32 bg-gradient-to-br from-blue-500 to-indigo-600 p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                <h2 className="text-xl font-bold text-white relative z-10 mb-1">
                  {course.course_name}
                </h2>
                <p className="text-white/90 text-sm relative z-10">
                  ID: {course.course_id}
                </p>
              </div>

              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <svg
                      className="w-5 h-5 text-gray-400 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex-1">
                      {course.course_description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {course.teacher_name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleEnterCourse(course.course_id)}
                  className="w-full flex items-center justify-center space-x-2 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg transition-all duration-300 transform group-hover:scale-[1.02]"
                >
                  <span>{t.enterCourse}</span>
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
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {courses.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <svg
                className="w-16 h-16 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01"
                />
              </svg>
              <p className="text-lg font-medium">{t.noCoursesFound}</p>
              <p className="text-sm">{t.checkBackLater}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SelectCourse;
