"use client";

interface StudentHomeProps {
  onLogout: () => Promise<void>;
  updatePageTitle: (title: string, showBack: boolean) => void;
};

const StudentHomeProps: React.FC<StudentHomeProps> = ({ onLogout }) => {
  const handleGradingClick = () => {
    console.log("Grading clicked");
  };

  const handleManageCourseClick = () => {
    console.log("Manage Course clicked");
  };

  const handleViewScoreClick = () => {
    console.log("View Score clicked");
  };

  const handleSettings = () => {
    console.log("Settings clicked");
  };

  return (
    <div className="grid grid-rows-[50px_1fr_50px] min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-300">Student Home Page</div>
        <button
          onClick={onLogout}
          className="py-2 px-6 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-800 transition duration-300 shadow-md"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-300 mb-8">Student Mode</h2>
        <div className="flex flex-wrap gap-6 justify-center">
          <div
            className="w-40 h-40 bg-blue-100 dark:bg-blue-800 border border-blue-400 dark:border-blue-600 flex items-center justify-center cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-700 transition duration-300 shadow-md rounded-lg"
            onClick={handleGradingClick}
          >
            <span className="text-lg font-medium text-blue-700 dark:text-blue-300">Grading</span>
          </div>
          <div
            className="w-40 h-40 bg-green-100 dark:bg-green-800 border border-green-400 dark:border-green-600 flex items-center justify-center cursor-pointer hover:bg-green-200 dark:hover:bg-green-700 transition duration-300 shadow-md rounded-lg"
            onClick={handleManageCourseClick}
          >
            <span className="text-lg font-medium text-green-700 dark:text-green-300">Manage Course</span>
          </div>
          <div
            className="w-40 h-40 bg-yellow-100 dark:bg-yellow-800 border border-yellow-400 dark:border-yellow-600 flex items-center justify-center cursor-pointer hover:bg-yellow-200 dark:hover:bg-yellow-700 transition duration-300 shadow-md rounded-lg"
            onClick={handleViewScoreClick}
          >
            <span className="text-lg font-medium text-yellow-700 dark:text-yellow-300">View Score</span>
          </div>
        </div>
      </div>

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

export default StudentHomeProps;
