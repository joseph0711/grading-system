import LoadingSkeleton from "../LoadingSkeleton";

const CalculateSkeleton = () => {
  return (
    <div className="flex-1">
      {/* Score Weights Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden animate-fadeIn">
          {/* Header with Title and Actions */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div className="h-8 w-48 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg animate-pulse delay-300"></div>
              {/* Edit/Save Buttons Placeholder */}
              <div className="flex gap-2">
                <div className="h-10 w-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg animate-pulse delay-400"></div>
                <div className="h-10 w-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg animate-pulse delay-500"></div>
              </div>
            </div>
          </div>

          {/* Weight Inputs Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${(index + 3) * 200}ms` }}
                >
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-6 w-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full animate-pulse"></div>
                      <div className="h-5 w-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse delay-100"></div>
                    </div>
                    <div className="relative">
                      <div className="h-10 w-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg animate-shimmer"></div>
                      <div className="absolute right-3 top-2 h-6 w-6 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded animate-pulse delay-200"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Weight Section */}
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="h-5 w-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded mb-2 animate-pulse delay-[1200ms]"></div>
                  <div className="h-8 w-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse delay-[1400ms]"></div>
                </div>
              </div>
              {/* Calculate Button */}
              <div className="h-12 w-48 bg-gradient-to-r from-blue-200 to-blue-300 dark:from-blue-700 dark:to-blue-600 rounded-lg animate-pulse delay-[1600ms]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculateSkeleton;
