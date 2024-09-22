"use client";

type HomePageProps = {
  onLogout: () => Promise<void>;
};

const HomePage: React.FC<HomePageProps> = ({ onLogout }) => {
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
    <div className="grid grid-rows-[50px_1fr_50px] min-h-screen p-8 pb-20 gap-16 sm:p-20">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="text-2xl font-bold">Home Page</div>
        <button
          onClick={onLogout}
          className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center">
        <h2 className="text-xl font-bold mb-6">Teacher Mode</h2>
        <div className="flex gap-10">
          <div
            className="w-40 h-40 border-2 border-black flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={handleGradingClick}
          >
            Grading
          </div>
          <div
            className="w-40 h-40 border-2 border-black flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={handleManageCourseClick}
          >
            Manage Course
          </div>
          <div
            className="w-40 h-40 border-2 border-black flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={handleViewScoreClick}
          >
            View Score
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <button
        onClick={handleSettings}
        className="py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors self-end"
      >
        Settings
      </button>
    </div>
  );
};

export default HomePage;