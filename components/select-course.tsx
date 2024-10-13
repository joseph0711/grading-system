"use client";
import React, { useState, useEffect } from "react";

interface Course {
  course_id: string;
  course_name: string;
  course_description: string;
  teacher_name: string;
}

interface SelectCourseProps {
  onCourseSelect: (courseId: string) => void;
  onLogout: () => void;
}

const SelectCourse: React.FC<SelectCourseProps> = ({
  onCourseSelect,
  onLogout,
}) => {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchUserCourses = async () => {
      try {
        const response = await fetch("/api/select-course");
        const data = await response.json();

        if (response.ok) {
          setCourses(data.courses);
        } else {
          alert(`Error fetching courses: ${data.message}`);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        alert("An error occurred while fetching courses.");
      }
    };

    fetchUserCourses();
  }, []);

  const handleEnterCourse = (courseId: string) => {
    onCourseSelect(courseId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-8 pb-20">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Select a Course</h1>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
        <div className="flex flex-wrap -mx-2">
          {courses.map((course) => (
            <div
              key={course.course_id}
              className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-2 mb-4"
            >
              <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white flex flex-col h-full">
                <h2 className="text-xl font-semibold mb-2">
                  {course.course_name}
                </h2>
                <p className="mb-2">Course ID: {course.course_id}</p>
                <p className="mb-2">
                  Description: {course.course_description}
                </p>
                <p className="mb-2">Teacher: {course.teacher_name}</p>
                <div className="mt-auto">
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    onClick={() => handleEnterCourse(course.course_id)}
                  >
                    Enter
                  </button>
                </div>
              </div>
            </div>
          ))}
          {courses.length === 0 && (
            <p className="text-center w-full">No courses found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectCourse;