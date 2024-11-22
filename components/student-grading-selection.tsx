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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 text-center mb-8">
          Student Grading Dashboard
        </h1>
        
        <div className="max-w-4xl mx-auto">
          {showPeerReport ? (
            <PeerScoresForm
              courseId={courseId}
              onSuccess={() => console.log("Success")}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {["Peer Grading of Group Report"].map((category) => (
                <div
                  key={category}
                  onClick={() => handleButtonClick(category)}
                  className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  <div className="p-6">
                    <div className="mb-4">
                      <svg
                        className="w-12 h-12 text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                      {category}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Grade and provide feedback for your peers' group reports
                    </p>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentGradingSelection;
