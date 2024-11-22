"use client";

import React, { useState, useEffect, Fragment, JSX } from "react";
import { Dialog, Transition } from "@headlessui/react";

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

const ReportScorePage = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [theme, setTheme] = useState("light");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState("success");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<Group[]>([]);

  // Fetch groups from the API
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch(`/api/grading/report/?course_id=3137`);
        const data = await response.json();
        
        // Add null check and ensure groups is always an array
        setGroups(data.groups || []);
      } catch (error) {
        console.error("Error fetching group data:", error);
        setGroups([]); // Set empty array on error
      }
    };
    fetchGroups();
  }, []);

  // Handle opening the modal with specific group details
  const handleOpenModal = (currentGroupId: string) => {
    if (!groups) return;
    
    // Find the current group instead of filtering it out
    const currentGroup = groups.find((g) => g.groupId === currentGroupId);
    if (currentGroup) {
      setModalData([currentGroup]); // Set only the current group data
      setIsModalOpen(true);
    }
  };

  // Filtering groups based on search term with null check
  const filteredGroups = groups?.filter((group) => {
    if (!group) return false;
    
    const searchString = searchTerm.toLowerCase();
    return (
      group.groupName.toLowerCase().includes(searchString) ||
      group.students.some((student) =>
        student.studentName.toLowerCase().includes(searchString)
      )
    );
  }) || [];

  // Pagination logic with null check
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentGroups = filteredGroups.slice(indexOfFirstItem, indexOfLastItem);

  // Calculate total pages
  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);

  // Handle teacher score change with null check
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

  // Submit handler with null check
  const handleSubmit = async () => {
    try {
      if (!groups) return;

      const groupsToSubmit = groups.filter(
        (group) => typeof group.teacherScore === "number"
      );

      if (groupsToSubmit.length === 0) {
        setFeedbackType("error");
        setFeedbackMessage("No scores entered to submit.");
        setTimeout(() => setFeedbackMessage(""), 3000);
        return;
      }

      const response = await fetch("/api/grading/report/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groups: groupsToSubmit }),
      });

      if (response.ok) {
        setFeedbackType("success");
        setFeedbackMessage("Teacher scores submitted successfully!");
      } else {
        setFeedbackType("error");
        setFeedbackMessage("Failed to submit teacher scores.");
      }
    } catch (error) {
      console.error("Error during submission:", error);
      setFeedbackType("error");
      setFeedbackMessage("An error occurred while submitting scores.");
    } finally {
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
          Group Report Score Page
        </h1>

        {/* Search Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by group name or student name..."
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              theme === "dark"
                ? "bg-gray-700 text-white"
                : "bg-white text-black"
            }`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Groups */}
        {currentGroups && currentGroups.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentGroups.map((group) => (
                <div
                  key={group.groupId}
                  className={`p-4 border rounded-lg ${
                    theme === "dark"
                      ? "bg-gray-800 text-white"
                      : "bg-white text-black"
                  }`}
                >
                  <h2 className="text-xl font-semibold mb-2">
                    {group.groupName}
                  </h2>
                  <ul className="mb-2">
                    {group.students.map((student) => (
                      <li key={student.studentId}>
                        {student.studentId} - {student.studentName}
                      </li>
                    ))}
                  </ul>
                  <p>
                    <strong>Total Average Score:</strong>{" "}
                    {group.totalAverageScore !== null
                      ? group.totalAverageScore.toFixed(2)
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Teacher Score:</strong>{" "}
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={
                        group.teacherScore !== null &&
                        group.teacherScore !== undefined
                          ? group.teacherScore
                          : ""
                      }
                      onChange={(e) =>
                        handleTeacherScoreChange(group.groupId, e.target.value)
                      }
                      className={`w-20 px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                        theme === "dark"
                          ? "bg-gray-700 text-white"
                          : "bg-white text-black"
                      }`}
                    />
                  </p>
                  <button
                    onClick={() => handleOpenModal(group.groupId)}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Students Score Detail
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {filteredGroups.length > itemsPerPage && (
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
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
                onClick={handleSubmit}
              >
                Submit Teacher Scores
              </button>
            </div>
          </>
        ) : (
          <p>No groups found.</p>
        )}
      </div>

      {/* Students Score Detail Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsModalOpen(false)}
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
                <Dialog.Panel
                  className={`w-full max-w-3xl transform overflow-hidden rounded-2xl ${
                    theme === "dark"
                      ? "bg-gray-800 text-white"
                      : "bg-white text-black"
                  } p-6 text-left align-middle shadow-xl transition-all`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <Dialog.Title as="h3" className="text-xl font-semibold">
                      Students Score Detail
                    </Dialog.Title>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
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
                          <div key={groupScore.scoringGroupId} className="mt-4 ml-4 p-4 border rounded-lg">
                            <h5 className="font-semibold">{groupScore.groupName}</h5>
                            <ul className="list-disc pl-5">
                              {groupScore.scores.map((score) => (
                                <li key={score.studentId} className="mt-2">
                                  {score.studentId} - {score.studentName}: {" "}
                                  <span className="font-semibold">{score.score}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      {/* Scores Summary */}
                      <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
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
                      className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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
    </div>
  );
};

export default ReportScorePage;
