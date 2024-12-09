"use client";

import React, { useState, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useAutoSave } from "@/app/hooks/useAutoSave";
import { useToast } from "@/app/hooks/useToast";
import { useSettings } from "@/app/contexts/SettingsContext";
import GradingTableSkeleton from "@/app/components/skeletons/GradingTableSkeleton";
import { usePageTitle } from "@/app/hooks/usePageTitle";
import ProtectedRoute from "@/app/components/ProtectedRoute";

const ParticipationPage = () => {
  usePageTitle("participationGrading");
  const router = useRouter();
  const [courseId, setCourseId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);

  // Session handling
  useEffect(() => {
    const fetchCourseId = async () => {
      try {
        const response = await fetch("/api/session");
        const data = await response.json();

        if (response.ok && data.authenticated) {
          if (data.user && data.user.course_id) {
            setCourseId(data.user.course_id);
          } else {
            console.error("No course ID found in session");
            router.push("/select-course");
          }
        } else {
          console.error("Invalid session response:", data);
          router.push("/select-course");
        }
      } catch (error) {
        console.error("Error fetching course ID:", error);
        router.push("/select-course");
      }
    };

    fetchCourseId();
  }, [router]);

  interface Student {
    student_id: string;
    name: string;
    participation_times: number;
  }

  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { t } = useSettings();
  const showToast = useToast();

  // Fetch students
  useEffect(() => {
    if (courseId) {
      const fetchStudents = async () => {
        try {
          const response = await fetch(
            `/api/grading/participation?courseId=${courseId}`,
            {
              method: "GET",
              credentials: "include",
            }
          );
          const data = await response.json();

          const studentsWithParticipation = data.map((student: any) => ({
            student_id: student.student_id,
            name: student.name,
            participation_times: student.participation_times || 0,
          }));

          setStudents(studentsWithParticipation);
        } catch (error) {
          console.error("Error fetching student data:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchStudents();
    }
  }, [courseId]);

  useEffect(() => {
    if (!isLoading) {
      // Keep skeleton visible for at least 1 second
      const timer = setTimeout(() => {
        setShowSkeleton(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const { handleAutoSave, isSaving } = useAutoSave({
    onSave: async (value: any) => {
      return showToast.promise(
        fetch(`/api/grading/participation?courseId=${courseId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            students: [
              {
                student_id: value.studentId,
                participationTimes: value.participationTimes,
              },
            ],
          }),
        }).then(async (response) => {
          if (!response.ok) {
            throw new Error(t.saveFailed);
          }
          return response.json();
        }),
        {
          loading: t.loading,
          success: t.saveSuccess,
          error: t.saveFailed,
        }
      );
    },
  });

  const handleParticipationChange = (student_id: string, value: string) => {
    const participationTimes = value === "" ? 0 : parseInt(value, 10);

    if (participationTimes < 0 || participationTimes > 10) {
      showToast.error(t.participationTimesMustBeBetween0And10);
      return;
    }

    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.student_id === student_id
          ? { ...student, participation_times: participationTimes }
          : student
      )
    );

    handleAutoSave({
      studentId: student_id,
      participationTimes: participationTimes,
    });
  };

  // Filter and pagination logic
  const filteredStudents = students.filter((student) => {
    const searchString = searchTerm.toLowerCase();
    return (
      student.name.toLowerCase().includes(searchString) ||
      student.student_id.toString().toLowerCase().includes(searchString)
    );
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  // Add LoadingSpinner component
  const LoadingSpinner = () => (
    <svg
      className="animate-spin h-4 w-4 text-current inline ml-2"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  return (
    <ProtectedRoute
      requireCourse={true}
      allowedRoles={["teacher"]}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800"
    >
      <header className="bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <button
              onClick={() => router.push("/grading")}
              className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
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
              {t.backToGrading}
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t.participationGrading}
            </h1>
          </div>
        </div>
      </header>

      {showSkeleton ? (
        <GradingTableSkeleton />
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg relative">
            {/* Search and feedback section */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder={t.searchStudents}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Auto-save note */}
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-500 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{t.autoSaveNote}</span>
                </div>
              </div>
            </div>

            {/* Table section */}
            <div className="overflow-x-auto">
              {currentStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <svg
                    className="w-12 h-12 text-gray-400"
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
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    {t.noStudentsFound}
                  </p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t.studentId}
                      </th>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t.name}
                      </th>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t.participationTimes}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {currentStudents.map((student) => (
                      <tr
                        key={student.student_id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {student.student_id}
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {student.name}
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleParticipationChange(
                                  student.student_id,
                                  String(
                                    Math.max(0, student.participation_times - 1)
                                  )
                                )
                              }
                              disabled={
                                isSaving || student.participation_times <= 0
                              }
                              className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 
                                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                                       hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              max="10"
                              value={student.participation_times}
                              onChange={(e) =>
                                handleParticipationChange(
                                  student.student_id,
                                  e.target.value
                                )
                              }
                              onKeyDown={(e) => {
                                // Prevent decimal point
                                if (
                                  e.key === "." ||
                                  e.key === "e" ||
                                  e.key === "-"
                                ) {
                                  e.preventDefault();
                                }
                              }}
                              disabled={isSaving}
                              className="w-20 px-2 py-1 text-center rounded-md border border-gray-300 dark:border-gray-600 
                                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                                       focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                                       disabled:opacity-50 disabled:cursor-not-allowed
                                       [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                              onClick={() =>
                                handleParticipationChange(
                                  student.student_id,
                                  String(
                                    Math.min(
                                      10,
                                      student.participation_times + 1
                                    )
                                  )
                                )
                              }
                              disabled={
                                isSaving || student.participation_times >= 10
                              }
                              className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 
                                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                                       hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              +
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination section */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                {/* Left side - Page info */}
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t.pageOf
                    .replace("{current}", currentPage.toString())
                    .replace("{total}", totalPages.toString())}
                </div>

                {/* Center - Pagination controls */}
                <div className="flex items-center gap-2">
                  {/* First page button */}
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="First page"
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
                        d="M11 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                  </button>

                  {/* Previous button */}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 
                             hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {t.previous}
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(totalPages, 5))].map((_, idx) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = idx + 1;
                      } else if (currentPage <= 3) {
                        pageNum = idx + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + idx;
                      } else {
                        pageNum = currentPage - 2 + idx;
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-4 py-2 rounded-md transition-colors ${
                            currentPage === pageNum
                              ? "bg-blue-600 text-white"
                              : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next button */}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 
                             hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {t.next}
                  </button>

                  {/* Last page button */}
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Last page"
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
                        d="M13 5l7 7-7 7M5 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>

                {/* Right side - Page size selector */}
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="pageSize"
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    {t.itemsPerPage}
                  </label>
                  <select
                    id="pageSize"
                    value={itemsPerPage}
                    onChange={(e) => {
                      const newSize = parseInt(e.target.value);
                      setItemsPerPage(newSize);
                      setCurrentPage(1); // Reset to first page when changing page size
                    }}
                    className="px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 
                             text-gray-700 dark:text-gray-200 text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}
    </ProtectedRoute>
  );
};

export default ParticipationPage;
