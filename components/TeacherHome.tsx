"use client";

import { useState } from "react";
import ManageCourse from "./ManageCourse";
import GradingSelection from "./grading-selection";

type TeacherHomeProps = {
  onLogout: () => Promise<void>;
  courseId: string;
};

const TeacherHome: React.FC<TeacherHomeProps> = ({ onLogout, courseId }) => {
  const [showManageCourse, setShowManageCourse] = useState(false);
  const [showGradingSelection, setShowGradingSelection] = useState(false);

  const handleGradingClick = () => {
    setShowGradingSelection(true);
  };

  const handleManageCourseClick = () => {
    setShowManageCourse(true);
  };

  const handleViewScoreClick = () => {
    console.log("View Score clicked");
  };

  const handleSettings = () => {
    console.log("Settings clicked");
  };

  const handleBackToHome = () => {
    setShowManageCourse(false);
    setShowGradingSelection(false);
  };

  return (
    <div className="grid grid-rows-[50px_1fr_50px] min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-300">
          Home Page
        </div>
        <button
          onClick={onLogout}
          className="py-2 px-6 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-800 transition duration-300 shadow-md"
        >
          Logout
        </button>
      </div>

      {/* Conditionally render ManageCourse, GradingSelection, or TeacherHome content */}
      {showManageCourse ? (
        <div>
          <button
            onClick={handleBackToHome}
            className="py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-800 transition duration-300 shadow-md"
          >
            Back to Home
          </button>
          <ManageCourse />
        </div>
      ) : showGradingSelection ? (
        <div>
          <button
            onClick={handleBackToHome}
            className="py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-800 transition duration-300 shadow-md"
          >
            Back to Home
          </button>
          <GradingSelection courseId={courseId} />
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-300 mb-8">
            Teacher Mode
          </h2>
          <div className="flex flex-wrap gap-6 justify-center">
            <div
              className="w-40 h-40 bg-blue-100 dark:bg-blue-800 border border-blue-400 dark:border-blue-600 flex items-center justify-center cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-700 transition duration-300 shadow-md rounded-lg"
              onClick={handleGradingClick}
            >
              <span className="text-lg font-medium text-blue-700 dark:text-blue-300">
                Grading
              </span>
            </div>
            <div
              className="w-40 h-40 bg-green-100 dark:bg-green-800 border border-green-400 dark:border-green-600 flex items-center justify-center cursor-pointer hover:bg-green-200 dark:hover:bg-green-700 transition duration-300 shadow-md rounded-lg"
              onClick={handleManageCourseClick}
            >
              <span className="text-lg font-medium text-green-700 dark:text-green-300">
                Manage Course
              </span>
            </div>
            <div
              className="w-40 h-40 bg-yellow-100 dark:bg-yellow-800 border border-yellow-400 dark:border-yellow-600 flex items-center justify-center cursor-pointer hover:bg-yellow-200 dark:hover:bg-yellow-700 transition duration-300 shadow-md rounded-lg"
              onClick={handleViewScoreClick}
            >
              <span className="text-lg font-medium text-yellow-700 dark:text-yellow-300">
                View Score
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Footer Section */}
      <div className="flex justify-end">
        <button
          onClick={handleSettings}
          className="py-2 px-6 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-900 transition duration-300 shadow-md"
        >
          Settings
        </button>
      </div>
    </div>
  );
};

export default TeacherHome;
