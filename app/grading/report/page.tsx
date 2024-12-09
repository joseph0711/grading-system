"use client";

import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { useAutoSave } from "@/app/hooks/useAutoSave";
import { useSettings } from "@/app/contexts/SettingsContext";
import { useToast } from "@/app/hooks/useToast";
import ReportTableSkeleton from "@/app/components/skeletons/ReportTableSkeleton";
import { usePageTitle } from "@/app/hooks/usePageTitle";
import ProtectedRoute from "@/app/components/ProtectedRoute";

interface Student {
  studentId: string;
  studentName: string;
}

interface StudentScore {
  studentId: string;
  studentName: string;
  score: number;
}

interface GroupScore {
  scoringGroupId: string;
  groupName: string;
  scores: StudentScore[];
}

interface Group {
  groupId: string;
  groupName: string;
  teacherScore: number | null;
  groupAverageScore: number | null;
  totalAverageScore: number | null;
  students: Student[];
  scoresByGroup: GroupScore[];
}

const ReportPage = () => {
  usePageTitle("reportGrading");
  const router = useRouter();
  const [courseId, setCourseId] = useState<string>("");
  const [teacherId, setTeacherId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useSettings();
  const toast = useToast();

  // Session handling
  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await fetch("/api/session");
        const data = await response.json();

        if (response.ok && data.authenticated) {
          if (data.user && data.user.course_id) {
            setCourseId(data.user.course_id);
            setTeacherId(data.user.account);
          } else {
            router.push("/select-course");
          }
        } else {
          router.push("/select-course");
        }
      } catch (error) {
        router.push("/select-course");
      }
    };

    fetchSessionData();
  }, [router]);

  const [groups, setGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<Group[]>([]);

  // Add a function to fetch and update groups data
  const fetchAndUpdateGroups = async () => {
    try {
      const response = await fetch(`/api/grading/report?courseId=${courseId}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        setGroups(data.groups || []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      setGroups([]);
    }
  };

  // Update toast messages with translations
  const { handleAutoSave, isSaving } = useAutoSave({
    onSave: async (value: any) => {
      return toast.promise(
        fetch(
          `/api/grading/report?courseId=${courseId}&teacherId=${teacherId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              groups: [
                {
                  groupId: value.groupId,
                  teacherScore: value.score,
                },
              ],
            }),
          }
        ).then(async (response) => {
          if (!response.ok) {
            throw new Error(t.saveFailed);
          }
          await fetchAndUpdateGroups();
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

  // Fetch groups
  useEffect(() => {
    if (courseId) {
      const fetchGroups = async () => {
        try {
          const response = await fetch(
            `/api/grading/report?courseId=${courseId}`,
            {
              method: "GET",
              credentials: "include",
            }
          );
          const data = await response.json();
          setGroups(data.groups || []);
        } catch (error) {
          console.error("Error fetching group data:", error);
          setGroups([]);
        } finally {
          setTimeout(() => {
            setIsLoading(false);
          }, 1000);
        }
      };
      fetchGroups();
    }
  }, [courseId]);

  // Handle opening the modal
  const handleOpenModal = (currentGroupId: string) => {
    if (!groups) return;
    const currentGroup = groups.find((g) => g.groupId === currentGroupId);
    if (currentGroup) {
      setModalData([currentGroup]);
      setIsModalOpen(true);
    }
  };

  // Filter and pagination logic
  const filteredGroups =
    groups?.filter((group) => {
      if (!group) return false;
      const searchString = searchTerm.toLowerCase();
      return (
        group.groupName.toLowerCase().includes(searchString) ||
        group.students.some((student) =>
          student.studentName.toLowerCase().includes(searchString)
        )
      );
    }) || [];

  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentGroups = filteredGroups.slice(indexOfFirstItem, indexOfLastItem);

  // Update handleTeacherScoreChange to handle immediate UI updates
  const handleTeacherScoreChange = (groupId: string, value: string) => {
    const score = value === "" ? null : Number(value);

    if (score !== null && (isNaN(score) || score < 0 || score > 100)) {
      toast.error(t.scoreMustBeBetween0And100);
      return;
    }

    // Update local state immediately
    setGroups((prevGroups) =>
      prevGroups.map((group) =>
        group.groupId === groupId
          ? {
              ...group,
              teacherScore: score,
              // Recalculate total average score
              totalAverageScore:
                score !== null && group.groupAverageScore !== null
                  ? (score + group.groupAverageScore) / 2
                  : null,
            }
          : group
      )
    );

    // Trigger auto-save and data refresh
    if (score === null || (score >= 0 && score <= 100)) {
      handleAutoSave({
        groupId: groupId,
        score: score,
      });
    }
  };

  return (
    <ProtectedRoute
      requireCourse={true}
      allowedRoles={["teacher"]}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800"
    >
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
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
              {t.reportGradingTitle}
            </h1>
          </div>
        </div>
      </header>

      {isLoading ? (
        <ReportTableSkeleton />
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            {/* Search and Auto-save info section */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder={t.searchGroupsPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Auto-save note */}
              <div className="mb-6 text-sm text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400"
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

              {/* Groups Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t.groupId}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t.groupMembers}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t.groupAvgScore}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t.teacherScore}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t.totalAvgScore}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t.actions}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {currentGroups.map((group) => (
                      <tr
                        key={group.groupId}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {group.groupName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {group.students
                            .map((student) => `${student.studentName}`)
                            .join(", ")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {group.groupAverageScore !== null
                            ? group.groupAverageScore.toFixed(2)
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={group.teacherScore ?? ""}
                            onChange={(e) =>
                              handleTeacherScoreChange(
                                group.groupId,
                                e.target.value
                              )
                            }
                            disabled={isSaving}
                            className="w-20 px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 
                                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                                     focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                                     disabled:opacity-50 disabled:cursor-not-allowed
                                     [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {group.totalAverageScore !== null
                            ? group.totalAverageScore.toFixed(2)
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleOpenModal(group.groupId)}
                            disabled={isSaving}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {t.viewDetails}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t.pageOf
                      .replace("{current}", currentPage.toString())
                      .replace("{total}", totalPages.toString())}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* First Page Button */}
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

                    {/* Previous Button */}
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

                    {/* Page Numbers */}
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

                    {/* Next Button */}
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

                    {/* Last Page Button */}
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

                  {/* Items per page selector */}
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
                        setCurrentPage(1);
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
          </div>
        </main>
      )}

      {/* Modal Dialog */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsModalOpen(false)}
        >
          {/* Background overlay transition */}
          <Transition
            as={Fragment}
            show={isModalOpen}
            enter="ease-out duration-300"
            enterFrom="opacity-0 backdrop-blur-none"
            enterTo="opacity-100 backdrop-blur-md"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 backdrop-blur-md"
            leaveTo="opacity-0 backdrop-blur-none"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-md transition-all duration-300" />
          </Transition>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  className={`w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-6 text-left align-middle shadow-xl transition-all`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <Dialog.Title as="h3" className="text-xl font-semibold">
                      {t.studentsScoreDetail}
                    </Dialog.Title>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Students Score Detail Modal content */}
                  {modalData.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-2">
                        {t.groupMembers}
                      </h4>
                      <div className="mt-2">
                        <ul className="list-disc pl-5 mb-4">
                          {modalData[0].students.map((student) => (
                            <li key={student.studentId}>
                              {student.studentId} - {student.studentName}
                            </li>
                          ))}
                        </ul>

                        <strong>{t.scoresReceivedFromOtherGroups}:</strong>
                        {modalData[0].scoresByGroup.map((groupScore) => (
                          <div
                            key={groupScore.scoringGroupId}
                            className="mt-4 ml-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                          >
                            <h5 className="font-semibold">
                              {groupScore.groupName}
                            </h5>
                            <ul className="list-disc pl-5">
                              {groupScore.scores.map((score) => (
                                <li key={score.studentId} className="mt-2">
                                  {score.studentId} - {score.studentName}:{" "}
                                  <span className="font-semibold">
                                    {score.score}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      {/* Scores Summary */}
                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                        <p className="text-lg">
                          <strong>
                            {t.groupAvgScore}:{" "}
                            {modalData[0].groupAverageScore !== null
                              ? modalData[0].groupAverageScore.toFixed(2)
                              : "N/A"}
                          </strong>
                        </p>
                        <p className="text-lg">
                          <strong>
                            {t.totalAvgScore}:{" "}
                            {modalData[0].totalAverageScore !== null
                              ? modalData[0].totalAverageScore.toFixed(2)
                              : "N/A"}
                          </strong>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Close Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                    >
                      {t.cancel}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </ProtectedRoute>
  );
};

export default ReportPage;
