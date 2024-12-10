"use client";

import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  TrashIcon,
  PencilIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useSettings } from "../contexts/SettingsContext";
import ProtectedRoute from "../components/ProtectedRoute";
import ManageCourseSkeleton from "../components/skeletons/ManageCourseSkeleton";
import { usePageTitle } from "../hooks/usePageTitle";

const ManageCoursePage = () => {
  usePageTitle("manageCourse");
  const router = useRouter();
  const { t } = useSettings();
  const [courseId, setCourseId] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);

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

  // Modify the existing fetchStudents to use courseId
  useEffect(() => {
    if (courseId) {
      const fetchData = async () => {
        const startTime = Date.now();
        setIsLoading(true);
        setShowSkeleton(true);

        try {
          const response = await fetch(
            `/api/manage-course?courseId=${courseId}`
          );
          const data = await response.json();

          if (!response.ok) {
            console.error("Failed to fetch data:", data.message);
            return;
          }

          setStudents(data.students);
          setDepartments(data.departments);
        } catch (error) {
          console.error("Error fetching data:", error);
          setStudents([]);
          setDepartments([]);
        } finally {
          // Ensure minimum 1 second of loading
          const elapsedTime = Date.now() - startTime;
          const remainingTime = Math.max(1000 - elapsedTime, 0);

          setTimeout(() => {
            setIsLoading(false);
            setShowSkeleton(false);
          }, remainingTime);
        }
      };

      fetchData();
    }
  }, [courseId]);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  interface Student {
    id: number;
    name: string;
    department: string;
    class: string;
  }

  // Course description state
  const [courseDescription, setCourseDescription] = useState("");

  // teacher name state
  const [teacherName, setTeacherName] = useState("");

  // Edit course description modal state
  const [isEditDescriptionModalOpen, setIsEditDescriptionModalOpen] =
    useState(false);
  const [editedDescription, setEditedDescription] = useState(courseDescription);

  // Student data state
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [editedStudent, setEditedStudent] = useState<Student | null>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]); // For storing selected rows

  const [sortConfig, setSortConfig] = useState<{
    key: keyof (typeof students)[0] | null;
    direction: "ascending" | "descending" | null;
  }>({ key: null, direction: null });

  // Feedback message state
  const [loading, setLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState("success");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch course data and teacher's name
  useEffect(() => {
    if (courseId) {
      const fetchCourseData = async () => {
        try {
          const response = await fetch(
            `/api/course-description?courseId=${courseId}`
          );
          const data = await response.json();

          if (response.ok) {
            console.log("Fetched course data:", data);
            setCourseDescription(
              data.course_description ?? "No description available."
            );
            setTeacherName(data.teacher_name ?? "No teacher assigned yet.");
          } else {
            console.error("Failed to fetch course data:", data.message);
          }
        } catch (error) {
          console.error("Error fetching course data:", error);
        }
      };
      fetchCourseData();
    }
  }, [courseId]);

  // Handle sorting
  const handleSort = (key: keyof (typeof students)[0]) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction: direction as "ascending" | "descending" });
  };

  const sortedStudents = [...students].sort((a, b) => {
    if (sortConfig.key) {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
    }
    return 0;
  });

  const filteredStudents = sortedStudents.filter((student) => {
    const searchString = searchTerm.toLowerCase();
    return (
      student.name.toLowerCase().includes(searchString) ||
      student.department.toLowerCase().includes(searchString) ||
      student.class.toLowerCase().includes(searchString) ||
      student.id.toString().toLowerCase().includes(searchString)
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

  // Handle saving edited student info
  const handleSaveStudent = async () => {
    if (!editedStudent) return;
    setLoading(true);

    try {
      const response = await fetch("/api/manage-course", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editedStudent.id,
          name: editedStudent.name,
          department: editedStudent.department,
          class: editedStudent.class,
        }),
      });

      if (response.ok) {
        setStudents((prevStudents) =>
          prevStudents.map((student) =>
            student.id === editedStudent.id ? editedStudent : student
          )
        );
        setIsEditModalOpen(false);
        setFeedbackType("success");
        setFeedbackMessage("Student information updated successfully!");
      } else {
        const error = await response.json();
        setFeedbackType("error");
        setFeedbackMessage(
          error.message || "Failed to update student information."
        );
      }
    } catch (error) {
      console.error("Error during update:", error);
      setFeedbackType("error");
      setFeedbackMessage(
        "An error occurred while updating student information."
      );
    } finally {
      setLoading(false);
      setTimeout(() => setFeedbackMessage(""), 3000); // Clear message after 3 seconds
    }
  };

  // Handle deleting a single student
  const handleDeleteStudent = async () => {
    if (!currentStudent) return;
    setLoading(true);

    try {
      const response = await fetch("/api/manage-course", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: [currentStudent.id] }),
      });

      const data = await response.json();

      if (response.ok) {
        setStudents((prevStudents) =>
          prevStudents.filter((student) => student.id !== currentStudent.id)
        );
        setFeedbackType("success");
        setFeedbackMessage(
          `Student "${currentStudent.name}" deleted successfully!`
        );
      } else {
        setFeedbackType("error");
        setFeedbackMessage(data.message || "Failed to delete student.");
      }
    } catch (error) {
      console.error("Error during deletion:", error);
      setFeedbackType("error");
      setFeedbackMessage("An error occurred while deleting the student.");
    } finally {
      setIsDeleteModalOpen(false); // Always close the modal
      setLoading(false);
      setTimeout(() => setFeedbackMessage(""), 5000); // Show message for 5 seconds
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/manage-course", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedRows }),
      });

      const data = await response.json();

      if (response.ok) {
        setStudents((prevStudents) =>
          prevStudents.filter((student) => !selectedRows.includes(student.id))
        );
        setSelectedRows([]);
        setFeedbackType("success");
        setFeedbackMessage("Selected students deleted successfully!");
      } else {
        setFeedbackType("error");
        setFeedbackMessage(
          data.message || "Failed to delete selected students."
        );
      }
    } catch (error) {
      console.error("Error during bulk deletion:", error);
      setFeedbackType("error");
      setFeedbackMessage("An error occurred while deleting selected students.");
    } finally {
      setIsBulkDeleteDialogOpen(false); // Always close the modal
      setLoading(false);
      setTimeout(() => setFeedbackMessage(""), 5000); // Show message for 5 seconds
    }
  };

  // Handle saving course description
  const handleSaveCourseDescription = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/manage-course", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: courseId,
          description: editedDescription,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCourseDescription(editedDescription);
        setIsEditDescriptionModalOpen(false);
        setFeedbackType("success");
        setFeedbackMessage("Course description updated successfully!");
      } else {
        setFeedbackType("error");
        setFeedbackMessage(
          data.message || "Failed to update course description."
        );
      }
    } catch (error) {
      console.error("Error updating course description:", error);
      setFeedbackType("error");
      setFeedbackMessage(
        "An error occurred while updating the course description."
      );
    } finally {
      setLoading(false);
      setTimeout(() => setFeedbackMessage(""), 3000);
    }
  };

  // Handle opening the edit modal
  const openEditModal = (student: Student) => {
    setCurrentStudent(student);
    setEditedStudent({ ...student }); // Copy the student object to avoid mutating the original
    setIsEditModalOpen(true);
  };

  // Handle opening the delete confirmation modal
  const openDeleteModal = (student: Student) => {
    setCurrentStudent(student);
    setIsDeleteModalOpen(true);
  };

  // Handle opening the bulk delete confirmation dialog
  const openBulkDeleteDialog = () => {
    setIsBulkDeleteDialogOpen(true);
  };

  // Handle checkbox toggle for selecting rows
  const handleRowSelect = (studentId: number) => {
    if (selectedRows.includes(studentId)) {
      setSelectedRows(selectedRows.filter((id) => id !== studentId));
    } else {
      setSelectedRows([...selectedRows, studentId]);
    }
  };

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Create a function to handle the back navigation
  const handleBackNavigation = () => {
    router.push("/dashboard/teacher");
  };

  // Add new state for departments
  const [departments, setDepartments] = useState<
    { department_id: number; department_name: string }[]
  >([]);

  // Add this function to your ManageCoursePage component
  const handleExportCSV = () => {
    // Add BOM for Excel to recognize UTF-8
    const BOM = "\uFEFF";

    // Create CSV content
    const headers = [t.studentId, t.name, t.department, t.class];
    const csvContent =
      BOM +
      [
        headers.join(","), // Headers row
        ...students.map((student) =>
          [
            student.id,
            `"${student.name}"`, // Wrap with quotes to handle names with commas
            `"${student.department}"`,
            `"${student.class}"`,
          ].join(",")
        ),
      ].join("\n");

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const date = new Date().toISOString().split("T")[0];
    link.download = `students_list_${date}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <ProtectedRoute
      requireCourse={true}
      allowedRoles={["teacher"]}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800"
    >
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
            {t.manageCourse}
          </h1>
        </div>
      </header>
      {showSkeleton ? (
        <ManageCourseSkeleton />
      ) : (
        <>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Feedback Message */}
            {feedbackMessage && (
              <div
                className={`mb-6 p-4 rounded-md ${
                  feedbackType === "success"
                    ? "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300"
                    : "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300"
                }`}
              >
                {feedbackMessage}
              </div>
            )}

            {/* Course Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {t.courseDetails}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {t.teacher}: {teacherName || t.noTeacherAssigned}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditedDescription(courseDescription);
                    setIsEditDescriptionModalOpen(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {t.editCourseInfo}
                </button>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                {courseDescription}
              </p>
            </div>

            {/* Students Management Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
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
                  <div className="flex gap-2">
                    <button
                      onClick={handleExportCSV}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
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
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      {t.exportCSV}
                    </button>
                    {selectedRows.length > 0 && (
                      <button
                        onClick={openBulkDeleteDialog}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      >
                        {t.delete} ({selectedRows.length})
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setSelectedRows(
                              isChecked ? currentStudents.map((s) => s.id) : []
                            );
                          }}
                          checked={
                            selectedRows.length === currentStudents.length &&
                            currentStudents.length > 0
                          }
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t.studentId}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t.name}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t.department}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t.class}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t.actions}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {currentStudents.map((student) => (
                      <tr
                        key={student.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(student.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRows([...selectedRows, student.id]);
                              } else {
                                setSelectedRows(
                                  selectedRows.filter((id) => id !== student.id)
                                );
                              }
                            }}
                            className="rounded border-gray-300 dark:border-gray-600 text-blue-600"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {student.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {student.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {student.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {student.class}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditModal(student)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(student)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
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

                  {/* Right side - Items per page selector */}
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
          </main>
          {/* Edit Description Modal */}
          <Transition appear show={isEditDescriptionModalOpen} as={Fragment}>
            <Dialog
              as="div"
              className="relative z-10"
              onClose={() => {
                setEditedDescription(courseDescription);
                setIsEditDescriptionModalOpen(false);
              }}
            >
              <Transition
                as={Fragment}
                show={isEditDescriptionModalOpen}
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
                    enterFrom="opacity-0 scale-95 translate-y-4"
                    enterTo="opacity-100 scale-100 translate-y-0"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100 translate-y-0"
                    leaveTo="opacity-0 scale-95 -translate-y-4"
                  >
                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                      >
                        {t.courseDescription}
                      </Dialog.Title>
                      <div className="mt-4">
                        <textarea
                          className="w-full h-32 p-2 border rounded-md border-gray-300 dark:border-gray-600 
                            bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                            focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={editedDescription}
                          onChange={(e) => setEditedDescription(e.target.value)}
                          placeholder={t.noCourseDescription}
                        />
                      </div>
                      <div className="mt-4 flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditedDescription(courseDescription);
                            setIsEditDescriptionModalOpen(false);
                          }}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                          {t.cancel}
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveCourseDescription}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          {t.save}
                        </button>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition>
          {/* Edit Student Modal */}
          <Transition appear show={isEditModalOpen} as={Fragment}>
            <Dialog
              as="div"
              className="relative z-10"
              onClose={() => setIsEditModalOpen(false)}
            >
              <Transition
                as={Fragment}
                show={isEditModalOpen}
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
                    enterFrom="opacity-0 scale-95 translate-y-4"
                    enterTo="opacity-100 scale-100 translate-y-0"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100 translate-y-0"
                    leaveTo="opacity-0 scale-95 -translate-y-4"
                  >
                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                      >
                        {t.editStudent}
                      </Dialog.Title>
                      {editedStudent && (
                        <div className="mt-4 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              {t.studentId}
                            </label>
                            <input
                              type="text"
                              value={editedStudent.id}
                              onChange={(e) =>
                                setEditedStudent({
                                  ...editedStudent,
                                  id: parseInt(e.target.value),
                                })
                              }
                              className="mt-1 w-full p-2 border rounded-md border-gray-300 dark:border-gray-600 
                                bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                                focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              {t.name}
                            </label>
                            <input
                              type="text"
                              value={editedStudent.name}
                              onChange={(e) =>
                                setEditedStudent({
                                  ...editedStudent,
                                  name: e.target.value,
                                })
                              }
                              className="mt-1 w-full p-2 border rounded-md border-gray-300 dark:border-gray-600 
                                bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                                focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              {t.department}
                            </label>
                            <select
                              value={editedStudent.department}
                              onChange={(e) =>
                                setEditedStudent({
                                  ...editedStudent,
                                  department: e.target.value,
                                })
                              }
                              className="mt-1 w-full p-2 border rounded-md border-gray-300 dark:border-gray-600 
                                bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                                focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {departments.map((dept) => (
                                <option
                                  key={dept.department_id}
                                  value={dept.department_name}
                                >
                                  {dept.department_name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              {t.class}
                            </label>
                            <input
                              type="text"
                              value={editedStudent.class}
                              onChange={(e) =>
                                setEditedStudent({
                                  ...editedStudent,
                                  class: e.target.value,
                                })
                              }
                              className="mt-1 w-full p-2 border rounded-md border-gray-300 dark:border-gray-600 
                                bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                                focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      )}
                      <div className="mt-4 flex justify-end space-x-2">
                        <button
                          onClick={() => setIsEditModalOpen(false)}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                          {t.cancel}
                        </button>
                        <button
                          onClick={handleSaveStudent}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          {t.save}
                        </button>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition>
          {/* Delete Confirmation Modal */}
          <Transition appear show={isDeleteModalOpen} as={Fragment}>
            <Dialog
              as="div"
              className="relative z-10"
              onClose={() => setIsDeleteModalOpen(false)}
            >
              <Transition
                as={Fragment}
                show={isDeleteModalOpen}
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
                    enterFrom="opacity-0 scale-95 translate-y-4"
                    enterTo="opacity-100 scale-100 translate-y-0"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100 translate-y-0"
                    leaveTo="opacity-0 scale-95 -translate-y-4"
                  >
                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                      >
                        {t.confirmDelete}
                      </Dialog.Title>
                      <div className="mt-4">
                        <p className="text-gray-700 dark:text-gray-300">
                          {t.confirmDeleteDesc}
                        </p>
                      </div>
                      <div className="mt-4 flex justify-end space-x-2">
                        <button
                          onClick={() => setIsDeleteModalOpen(false)}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                          {t.cancel}
                        </button>
                        <button
                          onClick={handleDeleteStudent}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          {t.delete}
                        </button>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition>
          {/* Bulk Delete Confirmation Modal */}
          <Transition appear show={isBulkDeleteDialogOpen} as={Fragment}>
            <Dialog
              as="div"
              className="relative z-10"
              onClose={() => setIsBulkDeleteDialogOpen(false)}
            >
              <Transition
                as={Fragment}
                show={isBulkDeleteDialogOpen}
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
                    enterFrom="opacity-0 scale-95 translate-y-4"
                    enterTo="opacity-100 scale-100 translate-y-0"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100 translate-y-0"
                    leaveTo="opacity-0 scale-95 -translate-y-4"
                  >
                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                      >
                        {t.confirmBulkDelete}
                      </Dialog.Title>
                      <div className="mt-4">
                        <p className="text-gray-700 dark:text-gray-300">
                          {t.confirmBulkDeleteDesc}
                        </p>
                      </div>
                      <div className="mt-4 flex justify-end space-x-2">
                        <button
                          onClick={() => setIsBulkDeleteDialogOpen(false)}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                          {t.cancel}
                        </button>
                        <button
                          onClick={handleBulkDelete}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          {t.deleteAllSelected}
                        </button>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </Dialog>
          </Transition>
        </>
      )}
    </ProtectedRoute>
  );
};

export default ManageCoursePage;
