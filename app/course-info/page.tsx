"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSettings } from "../contexts/SettingsContext";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../hooks/useAuth";
import CourseInfoSkeleton from "../components/skeletons/CourseInfoSkeleton";
import { usePageTitle } from "../hooks/usePageTitle";

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
  const { t } = useSettings();
  const router = useRouter();
  const [courseInfo, setCourseInfo] = useState<CourseInfo | null>(null);
  const [gradingCriteria, setGradingCriteria] =
    useState<GradingCriteria | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const { user, isLoading: authLoading } = useAuth(true);

  useEffect(() => {
    if (!user?.course_id) return;

    const fetchData = async () => {
      const startTime = Date.now();

      try {
        // Fetch course info and grading criteria concurrently
        const [courseResponse, criteriaResponse] = await Promise.all([
          fetch(`/api/course-description?courseId=${user.course_id}`),
          fetch(`/api/course-grading-criteria?courseId=${user.course_id}`),
        ]);

        const [courseData, criteriaData] = await Promise.all([
          courseResponse.json(),
          criteriaResponse.json(),
        ]);

        if (!courseResponse.ok) throw new Error(courseData.message);
        if (!criteriaResponse.ok) throw new Error(criteriaData.message);

        setCourseInfo(courseData);
        setGradingCriteria(criteriaData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch course information"
        );
      } finally {
        // Ensure minimum loading time
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(1000 - elapsedTime, 0);

        setTimeout(() => {
          setIsLoading(false);
          setShowSkeleton(false);
        }, remainingTime);
      }
    };

    fetchData();
  }, [user?.course_id]);

  const handleBackNavigation = () => {
    if (!user?.role) return;
    switch (user.role.toLowerCase()) {
      case "student":
        router.push("/dashboard/student");
        break;
    }
  };

  const content = () => {
    if (authLoading || isLoading || showSkeleton) {
      return <CourseInfoSkeleton />;
    }

    if (error) {
      return (
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="text-red-500 text-xl mb-4">{t.error}</div>
          <div className="text-gray-600 dark:text-gray-300">{error}</div>
        </div>
      );
    }

    if (!courseInfo || !gradingCriteria) {
      return <CourseInfoSkeleton />;
    }

    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t.courseDetails}
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  {t.courseName}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {courseInfo.course_name}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  {t.teacher}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {courseInfo.teacher_name || t.noTeacherAssigned}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  {t.courseDescription}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {courseInfo.course_description || t.noCourseDescription}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Grading Criteria Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t.gradingCriteria}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.midtermExamination}
              </h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {gradingCriteria.midterm_criteria}%
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.finalExamination}
              </h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {gradingCriteria.final_criteria}%
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.report}
              </h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {gradingCriteria.report_criteria}%
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.attendance}
              </h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {gradingCriteria.attendance_criteria}%
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.participation}
              </h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {gradingCriteria.participation_criteria}%
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  };

  usePageTitle("courseInfo");

  return (
    <ProtectedRoute requireCourse={true} allowedRoles={["student"]}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
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
              <span>{t.backToDashboard}</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t.courseInfo}
            </h1>
          </div>
        </header>

        {content()}
      </div>
    </ProtectedRoute>
  );
}
