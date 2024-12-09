"use client";

interface LoadingSkeletonProps {
  message?: string;
  subMessage?: string;
  children?: React.ReactNode;
}

const LoadingSkeleton = ({
  message,
  subMessage,
  children,
}: LoadingSkeletonProps) => {
  return (
    <>
      {/* Loading Message */}
      {(message || subMessage) && (
        <div className="text-center mb-8">
          {message && (
            <div className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
              {message}
            </div>
          )}
          {subMessage && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {subMessage}
            </div>
          )}
        </div>
      )}

      {/* Main Content with Animation Classes */}
      <div className="animate-fadeIn">{children}</div>
    </>
  );
};

export default LoadingSkeleton;
