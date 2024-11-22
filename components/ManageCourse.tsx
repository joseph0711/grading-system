"use client";

import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import {
  ExclamationTriangleIcon,
  TrashIcon,
  PencilIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

interface ManageCourseProps {
  courseId: string;
}

const ManageCourse: React.FC<ManageCourseProps> = ({ courseId }) => {
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
  const [theme, setTheme] = useState("light");
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
  const itemsPerPage = 10;

  // Fetch course data and teacher's name
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await fetch(
          `/api/CourseDescription?courseId=${courseId}`
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
  }, []);

  // Fetch students from the API
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`/api/ManageCourse?courseId=${courseId}`);
        const data = await response.json();
        
        if (!response.ok) {
          console.error("Failed to fetch students:", data.message);
          return;
        }
        
        if (Array.isArray(data)) {
          setStudents(data);
        } else {
          console.error("Fetched data is not an array:", data);
          setStudents([]); // Set empty array in case of invalid data
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
        setStudents([]); // Set empty array in case of error
      }
    };

    fetchStudents();
  }, [courseId]);

  // Theme detection based on user's device preference
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

  // Handle saving edited course description
  const handleSaveCourseDescription = async () => {
    try {
      const courseId = "3137"; // Replace with actual course ID
      const response = await fetch("/api/CourseDescription", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: courseId,
          description: editedDescription,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCourseDescription(editedDescription);
        setIsEditDescriptionModalOpen(false);
        setFeedbackMessage("Course description updated successfully!");
        setTimeout(() => setFeedbackMessage(""), 3000);
      } else {
        console.error("Failed to update course description:", data.message);
        setFeedbackMessage("Failed to update course description.");
        setTimeout(() => setFeedbackMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error updating course description:", error);
      setFeedbackMessage(
        "An error occurred while updating the course description."
      );
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

  // Handle saving edited student info and sending it to the backend
  const handleSaveStudent = async () => {
    const studentData = JSON.stringify(editedStudent);
    console.warn("Sending JSON data:", studentData);
    try {
      const response = await fetch("/api/ManageCourse", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: studentData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Update successful:", result);

        // Update the student list locally to reflect the changes
        if (editedStudent) {
          setStudents((prevStudents) =>
            prevStudents.map((student) =>
              student.id === editedStudent.id ? editedStudent : student
            )
          );
        }
        setIsEditModalOpen(false); // Close the dialog on successful update

        // Set feedback message
        setFeedbackType("success");
        setFeedbackMessage("Student information updated successfully!");
        setTimeout(() => setFeedbackMessage(""), 3000);
      } else {
        console.error("Failed to update student info");

        // Set error feedback message
        setFeedbackType("error");
        setFeedbackMessage("Failed to update student information.");
        setTimeout(() => setFeedbackMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error during update:", error);

      // Set error feedback message
      setFeedbackType("error");
      setFeedbackMessage(
        "An error occurred while updating student information."
      );
      setTimeout(() => setFeedbackMessage(""), 3000);
    }
  };

  // Handle checkbox toggle for selecting rows
  const handleRowSelect = (studentId: number) => {
    if (selectedRows.includes(studentId)) {
      setSelectedRows(selectedRows.filter((id) => id !== studentId));
    } else {
      setSelectedRows([...selectedRows, studentId]);
    }
  };

  // Handle deleting a single student
  const handleDeleteStudent = async () => {
    if (!currentStudent) return;

    try {
      const response = await fetch("/api/ManageCourse", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: [currentStudent.id] }),
      });

      if (response.ok) {
        console.log("Student deleted:", currentStudent);
        setStudents((prevStudents) =>
          prevStudents.filter((student) => student.id !== currentStudent.id)
        );
        setIsDeleteModalOpen(false);

        // Set feedback message
        setFeedbackType("success");
        setFeedbackMessage(
          `Student "${currentStudent.name}" deleted successfully!`
        );
        setTimeout(() => setFeedbackMessage(""), 3000);
      } else {
        console.error("Failed to delete student");

        // Set error feedback message
        setFeedbackType("error");
        setFeedbackMessage("Failed to delete student.");
        setTimeout(() => setFeedbackMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error during deletion:", error);

      // Set error feedback message
      setFeedbackType("error");
      setFeedbackMessage("An error occurred while deleting the student.");
      setTimeout(() => setFeedbackMessage(""), 3000);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      const response = await fetch("/api/ManageCourse", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedRows }),
      });

      if (response.ok) {
        console.log("Students deleted:", selectedRows);
        setStudents((prevStudents) =>
          prevStudents.filter((student) => !selectedRows.includes(student.id))
        );
        setSelectedRows([]);
        setIsBulkDeleteDialogOpen(false);

        // Set feedback message
        setFeedbackType("success");
        setFeedbackMessage("Selected students deleted successfully!");
        setTimeout(() => setFeedbackMessage(""), 3000);
      } else {
        console.error("Failed to delete students");

        // Set error feedback message
        setFeedbackType("error");
        setFeedbackMessage("Failed to delete selected students.");
        setTimeout(() => setFeedbackMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error during bulk deletion:", error);

      // Set error feedback message
      setFeedbackType("error");
      setFeedbackMessage("An error occurred while deleting selected students.");
      setTimeout(() => setFeedbackMessage(""), 3000);
    }
  };

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Feedback Message */}
      {feedbackMessage && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <span className="block sm:inline">{feedbackMessage}</span>
          </div>
        </div>
      )}

      <div className="container mx-auto p-4">
        {/* Teacher Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Teacher</h2>
          <p className="mb-4">{teacherName}</p>
        </div>

        {/* Course Description Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Course Description</h2>
          <p className="mb-4">
            {courseDescription.split("\n").map((line, index) => (
              <Fragment key={index}>
                {line}
                <br />
              </Fragment>
            ))}
          </p>
          <button
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
            onClick={() => {
              setEditedDescription(courseDescription);
              setIsEditDescriptionModalOpen(true);
            }}
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Edit Course Description
          </button>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-4">
          <div className="w-full sm:w-1/2 mb-2 sm:mb-0">
            <input
              type="text"
              placeholder="Search by name, department, or class..."
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            {selectedRows.length > 0 && (
              <button
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
                onClick={openBulkDeleteDialog}
              >
                <TrashIcon className="h-5 w-5 mr-2" />
                Delete Selected ({selectedRows.length})
              </button>
            )}
          </div>
        </div>

        {/* Student Table */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      e.target.checked
                        ? setSelectedRows(
                            filteredStudents.map((student) => student.id)
                          )
                        : setSelectedRows([])
                    }
                    checked={
                      selectedRows.length === filteredStudents.length &&
                      filteredStudents.length > 0
                    }
                  />
                </th>
                {/* Use map to reduce redundancy */}
                {["ID", "Name", "Department", "Class"].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider cursor-pointer"
                    onClick={() =>
                      handleSort(header.toLowerCase() as keyof Student)
                    }
                  >
                    {header}
                    {sortConfig.key === header.toLowerCase() && (
                      <span>
                        {sortConfig.direction === "ascending" ? " ▲" : " ▼"}
                      </span>
                    )}
                  </th>
                ))}
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                currentStudents.map((student, idx) => (
                  <tr
                    key={student.id}
                    className={`${
                      idx % 2 === 0
                        ? "bg-white dark:bg-gray-800"
                        : "bg-gray-50 dark:bg-gray-700"
                    } hover:bg-gray-100 dark:hover:bg-gray-600`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(student.id)}
                        onChange={() => handleRowSelect(student.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {student.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {student.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {student.class}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Menu
                        as="div"
                        className="relative inline-block text-left"
                      >
                        <Menu.Button className="inline-flex justify-center w-full text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900">
                          <ChevronDownIcon
                            className="h-5 w-5"
                            aria-hidden="true"
                          />
                        </Menu.Button>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="origin-top-right absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white dark:bg-gray-800 bg-opacity-100 ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                              <Menu.Item
                                as="button"
                                onClick={() => openEditModal(student)}
                                className={({ active }) =>
                                  `${
                                    active
                                      ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                                      : "text-gray-700 dark:text-gray-200"
                                  } group flex items-center px-4 py-2 text-sm w-full`
                                }
                              >
                                <PencilIcon
                                  className="h-5 w-5 mr-2"
                                  aria-hidden="true"
                                />
                                Edit
                              </Menu.Item>
                              <Menu.Item
                                as="button"
                                onClick={() => openDeleteModal(student)}
                                className={({ active }) =>
                                  `${
                                    active
                                      ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                                      : "text-gray-700 dark:text-gray-200"
                                  } group flex items-center px-4 py-2 text-sm w-full`
                                }
                              >
                                <TrashIcon
                                  className="h-5 w-5 mr-2"
                                  aria-hidden="true"
                                />
                                Delete
                              </Menu.Item>
                            </div>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
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

        {/* Page Number Buttons */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2 mt-4">
            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === pageNumber
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {pageNumber}
                </button>
              )
            )}
          </div>
        )}

        {/* Edit Student Dialog */}
        <Transition appear show={isEditModalOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-10"
            onClose={() => setIsEditModalOpen(false)}
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
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                    >
                      Edit Student Information
                    </Dialog.Title>
                    <div className="mt-4">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Name
                        </label>
                        <input
                          type="text"
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                          value={editedStudent?.name || ""}
                          onChange={(e) =>
                            setEditedStudent(
                              editedStudent
                                ? { ...editedStudent, name: e.target.value }
                                : null
                            )
                          }
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Department
                        </label>
                        <input
                          type="text"
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                          value={editedStudent?.department || ""}
                          onChange={(e) =>
                            setEditedStudent(
                              editedStudent
                                ? {
                                    ...editedStudent,
                                    department: e.target.value,
                                  }
                                : null
                            )
                          }
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Class
                        </label>
                        <input
                          type="text"
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                          value={editedStudent?.class || ""}
                          onChange={(e) =>
                            setEditedStudent(
                              editedStudent
                                ? { ...editedStudent, class: e.target.value }
                                : null
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-2">
                      <button
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                        onClick={() => setIsEditModalOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        onClick={handleSaveStudent}
                      >
                        Save
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* Edit Description Modal */}
        <Transition appear show={isEditDescriptionModalOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-10"
            onClose={() => setIsEditDescriptionModalOpen(false)}
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
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                    >
                      Edit Course Description
                    </Dialog.Title>
                    <div className="mt-4">
                      <textarea
                        className="w-full h-32 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                      />
                    </div>

                    <div className="mt-6 flex justify-end space-x-2">
                      <button
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                        onClick={() => setIsEditDescriptionModalOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        onClick={handleSaveCourseDescription}
                      >
                        Save
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* Delete Confirmation Dialog */}
        <Transition appear show={isDeleteModalOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-10"
            onClose={() => setIsDeleteModalOpen(false)}
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
                      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <ExclamationTriangleIcon
                          aria-hidden="true"
                          className="h-6 w-6 text-red-600"
                        />
                      </div>
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <Dialog.Title
                          as="h3"
                          className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                        >
                          Delete Student
                        </Dialog.Title>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500 dark:text-gray-300">
                            Are you sure you want to delete{" "}
                            <span className="font-semibold">
                              {currentStudent?.name}
                            </span>
                            ? This action cannot be undone.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-2">
                      <button
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                        onClick={() => setIsDeleteModalOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        onClick={handleDeleteStudent}
                      >
                        Delete
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* Bulk Delete Confirmation Dialog */}
        <Transition appear show={isBulkDeleteDialogOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-10"
            onClose={() => setIsBulkDeleteDialogOpen(false)}
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
                      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <ExclamationTriangleIcon
                          aria-hidden="true"
                          className="h-6 w-6 text-red-600"
                        />
                      </div>
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <Dialog.Title
                          as="h3"
                          className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                        >
                          Delete Selected Students
                        </Dialog.Title>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500 dark:text-gray-300">
                            Are you sure you want to delete the selected
                            students? This action cannot be undone.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-2">
                      <button
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                        onClick={() => setIsBulkDeleteDialogOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        onClick={handleBulkDelete}
                      >
                        Delete
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

export default ManageCourse;
