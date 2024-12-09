import LoadingSkeleton from "../LoadingSkeleton";

const ReportTableSkeleton = () => {
  const shimmerClass =
    "bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded bg-[length:200%_100%] animate-shimmer";

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        {/* Search and Info Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
            <div className={`w-full sm:w-64 h-10 ${shimmerClass}`}></div>
          </div>

          {/* Auto-save note skeleton */}
          <div className="mb-6 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-md animate-pulse"></div>

          {/* Table Skeleton */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  {[...Array(6)].map((_, index) => (
                    <th key={index} className="px-6 py-3">
                      <div className={`h-4 w-full ${shimmerClass}`}></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {[...Array(6)].map((_, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="animate-fadeIn"
                    style={{ animationDelay: `${rowIndex * 150}ms` }}
                  >
                    {[...Array(6)].map((_, colIndex) => (
                      <td key={colIndex} className="px-6 py-4">
                        <div
                          className={`h-6 ${shimmerClass}`}
                          style={{
                            width: colIndex === 5 ? "5rem" : "100%",
                          }}
                        ></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Skeleton */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className={`h-5 w-32 ${shimmerClass}`}></div>

              <div className="flex items-center gap-2">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-10 ${shimmerClass} ${
                      i === 0 || i === 6 ? "w-10" : "w-12"
                    }`}
                  ></div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className={`h-5 w-24 ${shimmerClass}`}></div>
                <div className={`h-8 w-16 ${shimmerClass}`}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ReportTableSkeleton;
