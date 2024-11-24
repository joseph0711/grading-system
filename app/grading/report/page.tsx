"use client";

import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [courseId, setCourseId] = useState<string>("");
  const [teacherId, setTeacherId] = useState<string>("");
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
            setTeacherId(data.user.account);
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

  const [groups, setGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState("success");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<Group[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

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
          setIsLoading(false);
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

  // Handle submit
  const handleSubmit = async () => {
    try {
      const response = await fetch(
        `/api/grading/report?courseId=${courseId}&teacherId=${teacherId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ groups }),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setFeedbackMessage("Scores submitted successfully");
        setFeedbackType("success");
      } else {
        setFeedbackMessage(data.message || "Failed to submit scores");
        setFeedbackType("error");
      }
    } catch (error) {
      console.error("Error submitting scores:", error);
      setFeedbackMessage("An error occurred while submitting scores");
      setFeedbackType("error");
    }
    setIsConfirmModalOpen(false);
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

  // Handle teacher score change
  const handleTeacherScoreChange = (groupId: string, value: string) => {
    if (!groups) return;
    setGroups((prevGroups) =>
      prevGroups.map((group) =>
        group.groupId === groupId
          ? { ...group, teacherScore: value !== "" ? Number(value) : null }
          : group
      )
    );
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
              Loading report data...
            </div>
            <div className="text-gray-400 dark:text-gray-500 text-sm">
              Please wait while we fetch the group information
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
          <button
            onClick={() => router.push("/grading")}
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
            <span>Back to Grading</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Report Scores
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Table section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by group name or student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <span className="absolute right-3 top-2.5 text-gray-400">
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
            </div>
          </div>

          {/* Feedback Message */}
          {feedbackMessage && (
            <div
              className={`mb-4 p-4 rounded-md ${
                feedbackType === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {feedbackMessage}
            </div>
          )}

          {/* Groups Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Group Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Students
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Group Average Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Teacher Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Average Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
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
                        className="w-20 px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setIsConfirmModalOpen(true)}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Submit Scores
            </button>
          </div>
        </div>
      </main>

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
                      Students Score Detail
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
                        Scores received by {modalData[0].groupName}
                      </h4>
                      <div className="mt-2">
                        <strong>Group Members:</strong>
                        <ul className="list-disc pl-5 mb-4">
                          {modalData[0].students.map((student) => (
                            <li key={student.studentId}>
                              {student.studentId} - {student.studentName}
                            </li>
                          ))}
                        </ul>

                        <strong>Scores Received from Other Groups:</strong>
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
                            Group Average Score:{" "}
                            {modalData[0].groupAverageScore !== null
                              ? modalData[0].groupAverageScore.toFixed(2)
                              : "N/A"}
                          </strong>
                        </p>
                        <p className="text-lg">
                          <strong>
                            Total Average Score:{" "}
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
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Confirmation Modal */}
      <Transition appear show={isConfirmModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsConfirmModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-md" />
          </Transition.Child>

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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
                  >
                    Confirm Submission
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Are you sure you want to submit these scores? This action
                      cannot be undone.
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200"
                      onClick={() => setIsConfirmModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                      onClick={handleSubmit}
                    >
                      Confirm
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default ReportPage;
