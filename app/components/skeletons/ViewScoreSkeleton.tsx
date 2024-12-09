import LoadingSkeleton from "../LoadingSkeleton";

const ViewScoreSkeleton = () => {
  return (
    <LoadingSkeleton>
      {/* Class Summary Section Skeleton */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden mb-8 animate-fadeIn">
        <div className="p-6">
          <div className="h-6 w-48 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded mb-4 bg-[length:200%_100%] animate-shimmer"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg animate-fadeIn"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="relative overflow-hidden">
                  <div className="h-4 w-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded mb-2 bg-[length:200%_100%] animate-shimmer"></div>
                  <div className="h-6 w-16 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded bg-[length:200%_100%] animate-shimmer"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg animate-fadeIn"
            style={{ animationDelay: `${(i + 5) * 100}ms` }}
          >
            <div className="relative overflow-hidden">
              <div className="h-6 w-48 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded mb-4 bg-[length:200%_100%] animate-shimmer"></div>
              <div className="h-[300px] bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded bg-[length:200%_100%] animate-shimmer"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Section Skeleton */}
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg animate-fadeIn"
        style={{ animationDelay: "700ms" }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="h-6 w-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded bg-[length:200%_100%] animate-shimmer"></div>
            <div className="flex items-center gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 w-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded bg-[length:200%_100%] animate-shimmer"
                  style={{ width: i === 0 ? "16rem" : "6rem" }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {[...Array(10)].map((_, i) => (
                  <th key={i} className="px-6 py-3">
                    <div className="h-4 w-20 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded bg-[length:200%_100%] animate-shimmer"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {[...Array(5)].map((_, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${(rowIndex + 8) * 100}ms` }}
                >
                  {[...Array(10)].map((_, colIndex) => (
                    <td key={colIndex} className="px-6 py-4">
                      <div className="h-4 w-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded bg-[length:200%_100%] animate-shimmer"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div className="h-4 w-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded bg-[length:200%_100%] animate-shimmer"></div>
              <div className="flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-10 w-10 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded bg-[length:200%_100%] animate-shimmer"
                  ></div>
                ))}
              </div>
              <div className="h-8 w-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded bg-[length:200%_100%] animate-shimmer"></div>
            </div>
          </div>
        </div>
      </div>
    </LoadingSkeleton>
  );
};

export default ViewScoreSkeleton;
