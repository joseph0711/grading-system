"use client";
import React, { useState, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useAutoSave } from "@/app/hooks/useAutoSave";
import { Toaster, toast } from "react-hot-toast";
import { useSettings } from "@/app/contexts/SettingsContext";

interface PeerScore {
  groupId: number;
  scoreValue: number | null | "";
}

// Add LoadingSpinner component at the top
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

export default function PeerReportPage() {
  const router = useRouter();
  const [groupScores, setGroupScores] = useState<PeerScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [courseId, setCourseId] = useState<string>("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState<"success" | "error">(
    "success"
  );
  const { t } = useSettings();

  // Add autoSave hook
  const { handleAutoSave, isSaving } = useAutoSave({
    onSave: async (groups: PeerScore[]) => {
      // Map all scores, including null values
      const validScores = groups.map((group) => ({
        scoredGroupId: group.groupId,
        scoreValue: group.scoreValue === "" ? null : group.scoreValue,
      }));

      return toast.promise(
        fetch(`/api/grading/peer-report?courseId=${courseId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ peerScores: validScores }),
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

  // Add a validation function
  const isValidScore = (value: number | null | ""): boolean => {
    if (value === "" || value === null) return true;
    return Number.isInteger(value) && value >= 0 && value <= 100;
  };

  // Fetch courseId from session
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

  // Fetch peer scores when courseId is available
  useEffect(() => {
    if (courseId) {
      fetchPeerScores();
    }
  }, [courseId]);

  const fetchPeerScores = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/grading/peer-report?courseId=${courseId}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      if (response.ok) {
        setGroupScores(data.groupScores || []);
      } else {
        console.error("Error fetching peer scores:", data.message);
      }
    } catch (error) {
      console.error("Error fetching peer scores:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and pagination logic
  const filteredGroups = groupScores.filter((group) => {
    if (!group || typeof group.groupId === "undefined") return false;
    const searchString = searchTerm.toLowerCase();
    return group.groupId.toString().toLowerCase().includes(searchString);
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredGroups.length / itemsPerPage)
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredGroups.length);

  // Modify the score input onChange handler
  const handleScoreChange = (groupId: number, newValue: number | null | "") => {
    // Convert empty string to null
    const valueToSave = newValue === "" ? null : newValue;

    // Validate the input
    if (valueToSave !== null && !isValidScore(valueToSave)) {
      toast.error(t.scoreMustBeBetween0And100);
      return;
    }

    const updatedGroups = groupScores.map((g) =>
      g.groupId === groupId ? { ...g, scoreValue: valueToSave } : g
    );
    setGroupScores(updatedGroups as PeerScore[]);

    // Always trigger auto-save since null is valid
    handleAutoSave(updatedGroups);
  };

  if (loading) {
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
              {t.loadingPeerEvalData}
            </div>
            <div className="text-gray-400 dark:text-gray-500 text-sm">
              {t.pleaseWaitWhileFetchingPeerEvalData}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          className: "dark:bg-gray-800 dark:text-white",
          style: {
            padding: "16px",
            borderRadius: "8px",
          },
          success: {
            iconTheme: {
              primary: "#10B981",
              secondary: "white",
            },
            style: {
              background: "#059669",
              color: "white",
            },
          },
          error: {
            iconTheme: {
              primary: "#EF4444",
              secondary: "white",
            },
            style: {
              background: "#DC2626",
              color: "white",
            },
          },
          loading: {
            iconTheme: {
              primary: "#3B82F6",
              secondary: "white",
            },
            style: {
              background: "#2563EB",
              color: "white",
            },
          },
        }}
      />

      <header className="sticky top-0 z-10 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <button
              onClick={() => router.push("/grading/student")}
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
              {t.peerEvaluationReport}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search groups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              </div>
            </div>

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

          <div className="overflow-x-auto">
            {filteredGroups.length === 0 ? (
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
                  {t.noPeerScoresAvailable}
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900">
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/2">
                      {t.groupId}
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/2">
                      {t.score}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredGroups.slice(startIndex, endIndex).map((group) => (
                    <tr
                      key={group.groupId}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-8 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Group {group.groupId}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={
                              group.scoreValue === null ||
                              group.scoreValue === ""
                                ? ""
                                : group.scoreValue
                            }
                            onChange={(e) => {
                              const inputValue = e.target.value;
                              const newValue =
                                inputValue === "" ? null : parseInt(inputValue);
                              handleScoreChange(group.groupId, newValue);
                            }}
                            onBlur={(e) => {
                              const value = e.target.value;
                              if (value && !isValidScore(parseInt(value))) {
                                e.target.value = "";
                                handleScoreChange(group.groupId, null);
                                toast.error(t.scoreMustBeBetween0And100);
                              }
                            }}
                            disabled={isSaving}
                            className="w-20 px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 
                                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                                     focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                                     disabled:opacity-50 disabled:cursor-not-allowed
                                     [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

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
    </div>
  );
}
