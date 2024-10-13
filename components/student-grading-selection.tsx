"use client";

import { useState } from "react";
import PeerScoresForm from "./grading/peer-report";

interface StudentGradingSelectionProps {
  courseId: string;
}

const StudentGradingSelection: React.FC<StudentGradingSelectionProps> = ({
  courseId,
}) => {
  const [showPeerReport, setShowPeerReport] = useState(false);

  const handleButtonClick = (category: string) => {
    if (category === "Peer Grading of Group Report") {
      setShowPeerReport(true);
    }
  };

  return (
    <div className="flex flex-wrap gap-6 justify-center min-h-screen p-8 pb-20 sm:p-20 bg-gray-50 dark:bg-gray-900 transition-colors">
      {showPeerReport ? (
        <PeerScoresForm
          courseId={courseId}
          onSuccess={() => console.log("Success")}
        />
      ) : (
        ["Peer Grading of Group Report"].map((category) => (
          <div
            key={category}
            className="w-48 h-48 bg-blue-100 dark:bg-blue-800 border border-blue-400 dark:border-blue-600 flex items-center justify-center cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-700 transition duration-300 shadow-md rounded-lg"
            onClick={() => handleButtonClick(category)}
          >
            <span className="text-lg font-medium text-blue-700 dark:text-blue-300">
              {category}
            </span>
          </div>
        ))
      )}
    </div>
  );
};

export default StudentGradingSelection;
