import LoadingSkeleton from "../LoadingSkeleton";

const CourseInfoSkeleton = () => {
  const shimmerClass =
    "bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded bg-[length:200%_100%] animate-shimmer";

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Course Info Card Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 animate-fadeIn">
        <div className="mb-6">
          <div className={`h-7 w-48 mb-4 ${shimmerClass}`}></div>
          <div className="space-y-4">
            {/* Course Name Section */}
            <div>
              <div className={`h-6 w-32 mb-2 ${shimmerClass}`}></div>
              <div className={`h-5 w-64 ${shimmerClass}`}></div>
            </div>
            {/* Teacher Section */}
            <div>
              <div className={`h-6 w-24 mb-2 ${shimmerClass}`}></div>
              <div className={`h-5 w-48 ${shimmerClass}`}></div>
            </div>
            {/* Description Section */}
            <div>
              <div className={`h-6 w-40 mb-2 ${shimmerClass}`}></div>
              <div className={`h-20 w-full ${shimmerClass}`}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Grading Criteria Card Skeleton */}
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-fadeIn"
        style={{ animationDelay: "150ms" }}
      >
        <div className={`h-7 w-48 mb-4 ${shimmerClass}`}></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Grading Criteria Items */}
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg animate-fadeIn"
              style={{ animationDelay: `${(index + 2) * 150}ms` }}
            >
              <div className={`h-6 w-40 mb-2 ${shimmerClass}`}></div>
              <div className={`h-8 w-16 ${shimmerClass}`}></div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default CourseInfoSkeleton;
