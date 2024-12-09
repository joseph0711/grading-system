import LoadingSkeleton from "../LoadingSkeleton";

const GradingTableSkeleton = () => {
  const shimmerClass =
    "bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded bg-[length:200%_100%] animate-shimmer";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        {/* Search and Info Section Skeleton */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className={`w-full sm:w-64 h-10 ${shimmerClass}`}></div>
          </div>

          <div className="mt-4 h-20 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg animate-pulse"></div>
        </div>

        {/* Table Skeleton */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900">
                {[...Array(3)].map((_, index) => (
                  <th key={index} className="px-8 py-4 text-left">
                    <div className={`h-4 w-24 ${shimmerClass}`}></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {[...Array(5)].map((_, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${rowIndex * 150}ms` }}
                >
                  {[...Array(3)].map((_, colIndex) => (
                    <td key={colIndex} className="px-8 py-4">
                      <div className={`h-6 w-32 ${shimmerClass}`}></div>
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
              {[...Array(7)].map((_, index) => (
                <div key={index} className={`h-10 w-10 ${shimmerClass}`}></div>
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
  );
};

export default GradingTableSkeleton;
