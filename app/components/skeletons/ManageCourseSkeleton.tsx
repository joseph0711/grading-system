import LoadingSkeleton from "../LoadingSkeleton";

const ManageCourseSkeleton = () => {
  return (
    <LoadingSkeleton>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Course Info Card Skeleton */}
          <div
            className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden mb-8 animate-fadeIn"
            style={{ animationDelay: "0ms" }}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-3">
                  <div className="h-7 w-48 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-shimmer"></div>
                  <div className="h-5 w-64 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-shimmer"></div>
                </div>
                <div className="h-10 w-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse"></div>
              </div>
              <div className="h-20 w-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-shimmer"></div>
            </div>
          </div>

          {/* Students Management Card Skeleton */}
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden animate-fadeIn"
            style={{ animationDelay: "200ms" }}
          >
            {/* Search and Actions Bar */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:w-64">
                  <div className="h-10 w-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-shimmer"></div>
                  <div className="absolute left-3 top-2.5 h-5 w-5 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded animate-shimmer"></div>
                </div>
                <div className="h-10 w-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Table Skeleton */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    {[...Array(6)].map((_, i) => (
                      <th key={i} className="px-6 py-3">
                        <div className="relative overflow-hidden">
                          <div className="h-4 w-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-shimmer"></div>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-wave"></div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {[...Array(5)].map((_, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="animate-fadeIn transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      style={{
                        animationDelay: `${400 + rowIndex * 100}ms`,
                      }}
                    >
                      {[...Array(6)].map((_, colIndex) => (
                        <td key={colIndex} className="px-6 py-4">
                          <div
                            className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-shimmer"
                            style={{
                              animationDelay: `${colIndex * 50}ms`,
                              width: colIndex === 5 ? "5rem" : "100%",
                            }}
                          ></div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Skeleton */}
              <div
                className="p-6 border-t border-gray-200 dark:border-gray-700 animate-fadeIn"
                style={{ animationDelay: "900ms" }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="h-5 w-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-shimmer"></div>

                  <div className="flex items-center gap-2">
                    {[...Array(7)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-10 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-shimmer ${
                          i === 0 || i === 6 ? "w-10" : "w-12"
                        }`}
                      ></div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="h-5 w-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-shimmer"></div>
                    <div className="h-8 w-16 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-shimmer"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </LoadingSkeleton>
  );
};

export default ManageCourseSkeleton;
