import LoadingSkeleton from "../LoadingSkeleton";

const DashboardSkeleton = () => {
  return (
    <LoadingSkeleton>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center space-y-8">
          {/* Welcome Message Skeleton */}
          <div
            className="h-10 w-64 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg animate-shimmer bg-[length:200%_100%]"
            style={{ animationDelay: "200ms" }}
          ></div>

          {/* Dashboard Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
            {/* Generate 4 card skeletons (enough for both student and teacher dashboards) */}
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="animate-fadeIn"
                style={{ animationDelay: `${(index + 2) * 200}ms` }}
              >
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl shadow-lg">
                  {/* Icon Skeleton */}
                  <div className="w-12 h-12 mb-4 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded-full animate-shimmer bg-[length:200%_100%]"></div>

                  {/* Title Skeleton */}
                  <div className="h-6 w-32 mb-2 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded animate-shimmer bg-[length:200%_100%]"></div>

                  {/* Description Skeleton */}
                  <div className="h-4 w-full bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded animate-shimmer bg-[length:200%_100%]"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </LoadingSkeleton>
  );
};

export default DashboardSkeleton;
