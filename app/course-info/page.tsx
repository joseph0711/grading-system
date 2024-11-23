"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface CourseInfo {
  course_name: string;
  teacher_name: string;
  course_description: string;
}

interface GradingCriteria {
  midterm_criteria: number;
  final_criteria: number;
  report_criteria: number;
  attendance_criteria: number;
  participation_criteria: number;
}

export default function CourseInfo() {
  const router = useRouter();
  const [courseId, setCourseId] = useState<string>("");
  const [courseInfo, setCourseInfo] = useState<CourseInfo | null>(null);
  const [gradingCriteria, setGradingCriteria] =
    useState<GradingCriteria | null>(null);
  const [error, setError] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Session handling
  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await fetch("/api/session");
        const data = await response.json();

        if (response.ok && data.authenticated) {
          if (data.user && data.user.course_id) {
            setCourseId(data.user.course_id);
            setUserRole(data.user.role);
          } else {
            console.error("No course ID found in session");
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

  // Fetch course data when courseId is available
  useEffect(() => {
    const fetchData = async () => {
      if (!courseId) return;

      try {
        // Fetch course info
        const courseResponse = await fetch(
          `/api/course-description?courseId=${courseId}`
        );
        const courseData = await courseResponse.json();

        if (!courseResponse.ok) throw new Error(courseData.message);
        setCourseInfo(courseData);

        // Fetch grading criteria
        const criteriaResponse = await fetch(
          `/api/course-grading-criteria?courseId=${courseId}`
        );
        const criteriaData = await criteriaResponse.json();

        if (!criteriaResponse.ok) throw new Error(criteriaData.message);
        setGradingCriteria(criteriaData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch course information"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  // Handle back navigation based on user role
  const handleBackNavigation = () => {
    switch (userRole.toLowerCase()) {
      case "teacher":
        router.push("/dashboard/teacher");
        break;
      case "student":
        router.push("/dashboard/student");
        break;
      default:
        router.push("/dashboard");
        break;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <div className="text-gray-600 dark:text-gray-300">{error}</div>
        </div>
      </div>
    );
  }

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
              Loading course information...
            </div>
            <div className="text-gray-400 dark:text-gray-500 text-sm">
              Please wait while we fetch your course details
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!courseInfo || !gradingCriteria) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
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
            Course Information
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Course Details
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  Course Name
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {courseInfo.course_name}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  Teacher
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {courseInfo.teacher_name}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  Course Description
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {courseInfo.course_description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Grading Criteria Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Grading Criteria
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                Midterm Examination
              </h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {gradingCriteria.midterm_criteria}%
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                Final Examination
              </h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {gradingCriteria.final_criteria}%
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                Report
              </h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {gradingCriteria.report_criteria}%
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                Attendance
              </h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {gradingCriteria.attendance_criteria}%
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                Participation
              </h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {gradingCriteria.participation_criteria}%
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
