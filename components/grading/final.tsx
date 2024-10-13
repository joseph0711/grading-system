"use client";

import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface FinalFromProps {
  courseId: string;
  onSuccess: () => void;
}

const Final: React.FC<FinalFromProps> = ({ courseId, onSuccess }) => {
  interface Student {
    student_id: string;
    name: string;
    score: number | null;
  }

  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [theme, setTheme] = useState("light");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState("success");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [studentsToSubmit, setStudentsToSubmit] = useState<Student[]>([]);

  // Fetch students from the API
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
              student.score !== null && student.score !== undefined
                ? Number(student.score)
                : null,
            courseId: courseId,
          }));

          setStudents(studentsWithScores);
        } catch (error) {
          console.error("Error fetching student data:", error);
        }
      };
      fetchStudents();
    }
  }, [courseId]);

  // Handle score change
  const handleScoreChange = (student_id: string, value: string) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.student_id === student_id
          ? { ...student, score: value !== "" ? Number(value) : null }
          : student
      )
    );
  };

  // Handle score submission confirmation dialog
  const handleOpenSubmitDialog = () => {
    const studentsWithScores = students.filter(
      (student) => student.score !== null && student.score !== undefined
    ); // Filter out students without a score

    if (studentsWithScores.length === 0) {
      setFeedbackType("error");
      setFeedbackMessage("No scores entered to submit.");
      setTimeout(() => setFeedbackMessage(""), 3000);
      return;
    }

    // Set the students to submit and open the dialog
    setStudentsToSubmit(studentsWithScores);
    setIsSubmitDialogOpen(true);
  };

  // Handle submission after confirmation modal.
  const handleSubmit = async () => {
    try {
      // Filter out students with empty scores
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
        onSuccess();
      } else {
        setFeedbackType("error");
        setFeedbackMessage(responseData.message || "Failed to submit scores.");
      }
    } catch (error) {
      setFeedbackType("error");
      setFeedbackMessage("An error occurred while submitting scores.");
      setTimeout(() => setFeedbackMessage(""), 3000);
    } finally {
      setIsSubmitDialogOpen(false);
      setTimeout(() => setFeedbackMessage(""), 3000);
    }
  };

  // Theme detection
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setTheme(mediaQuery.matches ? "dark" : "light");

    const handleThemeChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleThemeChange);
    };
  }, []);

  // Filter students based on search term
  const filteredStudents = students.filter((student) => {
    const searchString = searchTerm.toLowerCase();
    return (
      student.name.toLowerCase().includes(searchString) ||
      student.student_id.toString().toLowerCase().includes(searchString)
    );
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Calculate total pages
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Feedback Message */}
      {feedbackMessage && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`${
              feedbackType === "success"
                ? theme === "dark"
                  ? "bg-green-800 text-green-200 border-green-600"
                  : "bg-green-100 text-green-700 border-green-400"
                : theme === "dark"
                ? "bg-red-800 text-red-200 border-red-600"
                : "bg-red-100 text-red-700 border-red-400"
            } px-4 py-3 rounded`}
          >
            <span className="block sm:inline">{feedbackMessage}</span>
          </div>
        </div>
      )}

      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Final Score Page
        </h1>
        {/* Search */}
        <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-4">
          <div className="w-full sm:w-1/2 mb-2 sm:mb-0">
            <input
              type="text"
              placeholder="Search by name or ID..."
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                theme === "dark"
                  ? "bg-gray-700 text-white"
                  : "bg-white text-black"
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Student Table */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                {/* Headers */}
                {["Student ID", "Name", "Score"].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                currentStudents.map((student, idx) => (
                  <tr
                    key={student.student_id}
                    className={`${
                      idx % 2 === 0
                        ? "bg-white dark:bg-gray-800"
                        : "bg-gray-50 dark:bg-gray-700"
                    } hover:bg-gray-100 dark:hover:bg-gray-600`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {student.student_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={
                          student.score !== null && student.score !== undefined
                            ? student.score.toString()
                            : ""
                        }
                        onChange={(e) =>
                          handleScoreChange(student.student_id, e.target.value)
                        }
                        className={`w-20 px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                          theme === "dark"
                            ? "bg-gray-700 text-white"
                            : "bg-white text-black"
                        }`}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredStudents.length > itemsPerPage && (
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md ${
                currentPage === 1
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Previous
            </button>

            <div>
              Page {currentPage} of {totalPages}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Next
            </button>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end mt-6">
          <button
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            onClick={handleOpenSubmitDialog}
          >
            Submit Scores
          </button>
        </div>

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
                          aria-hidden="true"
                          className="h-6 w-6 text-yellow-600"
                        />
                      </div>
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <Dialog.Title
                          as="h3"
                          className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100"
                        >
                          Confirm Submission
                        </Dialog.Title>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500 dark:text-gray-300">
                            Are you sure you want to submit the scores? This
                            action cannot be undone.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-2">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                        onClick={() => setIsSubmitDialogOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                        onClick={handleSubmit}
                      >
                        Submit
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </div>
  );
};

export default Final;
