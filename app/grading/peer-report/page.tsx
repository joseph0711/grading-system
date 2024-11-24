"use client";
import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface PeerScore {
  groupId: number;
  scoreValue: number | "";
}

export default function PeerReportPage() {
  const router = useRouter();
  const [groupScores, setGroupScores] = useState<PeerScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [courseId, setCourseId] = useState<string>("");
  const itemsPerPage = 10;
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState<"success" | "error">(
    "success"
  );
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [scoresToSubmit, setScoresToSubmit] = useState<PeerScore[]>([]);

  // Add a validation function
  const isValidScore = (value: number | ""): boolean => {
    if (value === "") return false;
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

  const handleBackClick = () => {
    router.push("/grading/student");
  };

  const handleOpenSubmitDialog = () => {
    const scoresWithValues = groupScores.filter(
      (score) => score.scoreValue !== "" && score.scoreValue !== null
    );

    // Check if there are any scores to submit
    if (scoresWithValues.length === 0) {
      setFeedbackType("error");
      setFeedbackMessage("No scores entered to submit.");
      setTimeout(() => setFeedbackMessage(""), 3000);
      return;
    }

    // Validate all scores before opening dialog
    const invalidScores = scoresWithValues.filter(
      (score) => !isValidScore(score.scoreValue)
    );

    if (invalidScores.length > 0) {
      setFeedbackType("error");
      setFeedbackMessage("Please correct invalid scores before submitting.");
      setTimeout(() => setFeedbackMessage(""), 3000);
      return;
    }

    setScoresToSubmit(scoresWithValues);
    setIsSubmitDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      // Final validation before submission
      const invalidScores = scoresToSubmit.filter(
        (score) => !isValidScore(score.scoreValue)
      );

      if (invalidScores.length > 0) {
        throw new Error("Invalid scores detected. Please check your inputs.");
      }

      const formattedScores = scoresToSubmit.map(score => ({
        scoredGroupId: score.groupId,
        scoreValue: score.scoreValue
      }));

      const response = await fetch(`/api/grading/peer-report?courseId=${courseId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ peerScores: formattedScores })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit scores');
      }

      const data = await response.json();
      setFeedbackType("success");
      setFeedbackMessage("Scores submitted successfully!");
      setIsSubmitDialogOpen(false);
      await fetchPeerScores();
    } catch (error) {
      console.error('Submit error:', error);
      setFeedbackType("error");
      setFeedbackMessage((error as Error).message || "An error occurred while submitting scores.");
    } finally {
      setIsSubmitDialogOpen(false);
      setTimeout(() => setFeedbackMessage(""), 3000);
    }
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
              Loading peer evaluation data...
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
            onClick={() => router.push("/grading/student")}
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
            <span>Back to Student Grading</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Peer Evaluation Report
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {/* Search and Feedback Section */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            {feedbackMessage && (
              <div
                className={`px-4 py-2 rounded-md ${
                  feedbackType === "success"
                    ? "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-200"
                    : "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-200"
                }`}
              >
                {feedbackMessage}
              </div>
            )}
          </div>

          {/* Groups Table */}
          <div className="overflow-x-auto">
            {filteredGroups.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  No peer scores available
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Group ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Score
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredGroups
                        .slice(startIndex, endIndex)
                        .map((group) => (
                          <tr
                            key={group.groupId}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              Group {group.groupId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={
                                  group.scoreValue === ""
                                    ? ""
                                    : group.scoreValue
                                }
                                onChange={(e) => {
                                  const inputValue = e.target.value;
                                  const newValue = inputValue ? parseInt(inputValue) : "";
                                  
                                  // Validate the input
                                  if (inputValue && !isValidScore(newValue)) {
                                    setFeedbackType("error");
                                    setFeedbackMessage("Please enter a valid score between 0 and 100");
                                    setTimeout(() => setFeedbackMessage(""), 3000);
                                    return;
                                  }

                                  const updatedGroups = groupScores.map((g) =>
                                    g.groupId === group.groupId
                                      ? { ...g, scoreValue: newValue }
                                      : g
                                  );
                                  setGroupScores(updatedGroups as PeerScore[]);
                                }}
                                onBlur={(e) => {
                                  // Additional validation when leaving the field
                                  const value = e.target.value;
                                  if (value && !isValidScore(parseInt(value))) {
                                    e.target.value = ""; // Clear invalid input
                                    const updatedGroups = groupScores.map((g) =>
                                      g.groupId === group.groupId
                                        ? { ...g, scoreValue: "" }
                                        : g
                                    );
                                    setGroupScores(updatedGroups as PeerScore[]);
                                    setFeedbackType("error");
                                    setFeedbackMessage("Invalid score cleared. Please enter a number between 0 and 100");
                                    setTimeout(() => setFeedbackMessage(""), 3000);
                                  }
                                }}
                                className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                                  focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                              />
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination and Submit Section */}
                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
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
                  <button
                    onClick={handleOpenSubmitDialog}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Submit Scores
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Submit Confirmation Dialog */}
      <Transition appear show={isSubmitDialogOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsSubmitDialogOpen(false)}
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
            <div className="fixed inset-0 bg-black bg-opacity-30" />
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
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                      <ExclamationTriangleIcon
                        className="h-6 w-6 text-yellow-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Confirm Submission
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Are you sure you want to submit these peer evaluation
                          scores? This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={handleSubmit}
                    >
                      Submit
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                      onClick={() => setIsSubmitDialogOpen(false)}
                    >
                      Cancel
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
}

