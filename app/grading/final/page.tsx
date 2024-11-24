"use client";

import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

const FinalPage = () => {
  const router = useRouter();
  const [courseId, setCourseId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Session handling from attendance page
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

  // States from components/grading/final.tsx
  interface Student {
    student_id: string;
    name: string;
    score: number | null;
  }

  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState("success");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [studentsToSubmit, setStudentsToSubmit] = useState<Student[]>([]);

  // Fetch students logic
  useEffect(() => {
    if (courseId) {
      const fetchStudents = async () => {
        try {
          const response = await fetch(
            `/api/grading/final?courseId=${courseId}`,
            {
              method: "GET",
              credentials: "include",
            }
          );
          const data = await response.json();

          const studentsWithScores = data.map((student: any) => ({
            student_id: student.student_id,
            name: student.name,
            score:
              student.final_score !== null && student.final_score !== undefined
                ? Number(student.final_score)
                : null,
          }));

          setStudents(studentsWithScores);
        } catch (error) {
          console.error("Error fetching student data:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchStudents();
    }
  }, [courseId]);

  // Handler functions from components/grading/final.tsx
  const handleScoreChange = (student_id: string, value: string) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.student_id === student_id
          ? { ...student, score: value !== "" ? Number(value) : null }
          : student
      )
    );
  };

  const handleOpenSubmitDialog = () => {
    const studentsWithScores = students.filter(
      (student) => student.score !== null && student.score !== undefined
    );

    if (studentsWithScores.length === 0) {
      setFeedbackType("error");
      setFeedbackMessage("No scores entered to submit.");
      setTimeout(() => setFeedbackMessage(""), 3000);
      return;
    }

    setStudentsToSubmit(studentsWithScores);
    setIsSubmitDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const studentsToSubmit = students
        .filter((student) => typeof student.score === "number")
        .map((student) => ({
          ...student,
          courseId: courseId,
        }));

      if (studentsToSubmit.length === 0) {
        setFeedbackType("error");
        setFeedbackMessage("No valid student data to submit.");
        setTimeout(() => setFeedbackMessage(""), 3000);
        return;
      }

      const response = await fetch(`/api/grading/final?courseId=${courseId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ students: studentsToSubmit }),
      });

      const responseData = await response.json();

      if (response.ok) {
        setFeedbackType("success");
        setFeedbackMessage("Scores submitted successfully!");
      } else {
        setFeedbackType("error");
        setFeedbackMessage(responseData.message || "Failed to submit scores.");
      }
    } catch (error) {
      setFeedbackType("error");
      setFeedbackMessage("An error occurred while submitting scores.");
    } finally {
      setIsSubmitDialogOpen(false);
      setTimeout(() => setFeedbackMessage(""), 3000);
    }
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
              Loading final exam data...
            </div>
            <div className="text-gray-400 dark:text-gray-500 text-sm">
              Please wait while we fetch the student information
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
            Final Exam Grading
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
                placeholder="Search students..."
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

          {/* Students Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredStudents.slice(startIndex, endIndex).map((student) => (
                  <tr
                    key={student.student_id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {student.student_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={student.score ?? ""}
                        onChange={(e) =>
                          handleScoreChange(student.student_id, e.target.value)
                        }
                        className="w-20 px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
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
            <button
              onClick={handleOpenSubmitDialog}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Submit Scores
            </button>
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
                          Are you sure you want to submit these scores? This
                          action cannot be undone.
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
};

export default FinalPage;
