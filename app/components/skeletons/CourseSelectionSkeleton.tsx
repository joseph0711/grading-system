import LoadingSkeleton from "../LoadingSkeleton";

const CourseSelectionSkeleton = () => {
  return (
    <LoadingSkeleton>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 animate-fadeIn"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Card Header with gradient background */}
            <div className="h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 p-4 relative overflow-hidden">
              {/* Animated wave effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-wave"></div>

              {/* Course name and ID placeholders */}
              <div className="relative z-10 space-y-2">
                <div className="h-7 w-4/5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg bg-[length:200%_100%] animate-shimmer"></div>
                <div className="h-4 w-1/3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded bg-[length:200%_100%] animate-shimmer"></div>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4 space-y-4">
              {/* Description Section */}
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 mt-0.5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded bg-[length:200%_100%] animate-shimmer"></div>
                    <div className="h-4 w-4/5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded bg-[length:200%_100%] animate-shimmer"></div>
                    <div className="h-4 w-2/3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded bg-[length:200%_100%] animate-shimmer"></div>
                  </div>
                </div>

                {/* Teacher Name Section */}
                <div className="flex items-center space-x-2 mt-4">
                  <div className="w-5 h-5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full animate-pulse"></div>
                  <div className="h-4 w-2/3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded bg-[length:200%_100%] animate-shimmer"></div>
                </div>
              </div>

              {/* Enter Button */}
              <div className="mt-4 h-10 w-full bg-gradient-to-r from-blue-500/30 to-indigo-500/30 dark:from-blue-400/20 dark:to-indigo-400/20 rounded-lg bg-[length:200%_100%] animate-shimmer group-hover:scale-[1.02] transition-transform"></div>
            </div>
          </div>
        ))}
      </div>
    </LoadingSkeleton>
  );
};

export default CourseSelectionSkeleton;
