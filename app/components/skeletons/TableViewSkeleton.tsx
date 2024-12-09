import LoadingSkeleton from "../LoadingSkeleton";

const TableViewSkeleton = () => {
  return (
    <LoadingSkeleton message="Loading Data">
      <div className="animate-pulse">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          {/* Table Skeleton Content */}
        </table>
      </div>
    </LoadingSkeleton>
  );
};

export default TableViewSkeleton; 