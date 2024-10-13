"use client";

import { useState } from "react";
import GradingAttendance from "./grading/attendance";
import GradingParticipation from "./grading/participation";
import GradingMidterm from "./grading/midterm";
import GradingFinal from "./grading/final";
import GroupReport from "./grading/report";

interface GradingSelectionProps {
  courseId: string;
}

const GradingSelection: React.FC<GradingSelectionProps> = ({ courseId }) => {
  const [showGradingAttendance, setShowGradingAttendance] = useState(false);
  const [showGradingParticipation, setShowGradingParticipation] =
    useState(false);
  const [showGradingFinal, setShowGradingFinal] = useState(false);
  const [showGradingMidterm, setShowGradingMidterm] = useState(false);
  const [showGroupReport, setShowGroupReport] = useState(false);

  const handleButtonClick = (category: string) => {
    if (category === "Attendance") {
      setShowGradingAttendance(true);
    } else if (category === "Participation") {
      setShowGradingParticipation(true);
    } else if (category === "Midterm") {
      setShowGradingMidterm(true);
    } else if (category === "Final") {
      setShowGradingFinal(true);
    } else if (category === "Group Report") {
      setShowGroupReport(true);
    }
  };

  return (
    <div className="flex flex-wrap gap-6 justify-center min-h-screen p-8 pb-20 sm:p-20 bg-gray-50 dark:bg-gray-900 transition-colors">
      {showGradingAttendance ? (
        <GradingAttendance
          courseId={courseId}
          onSuccess={() => console.log("Success")}
        />
      ) : showGradingParticipation ? (
        <GradingParticipation
          courseId={courseId}
          onSuccess={() => console.log("Success")}
        />
      ) : showGradingMidterm ? (
        <GradingMidterm
          courseId={courseId}
          onSuccess={() => console.log("Success")}
        />
      ) : showGradingFinal ? (
        <GradingFinal
          courseId={courseId}
          onSuccess={() => console.log("Success")}
        />
      ) : showGroupReport ? (
        <GroupReport />
      ) : (
        ["Attendance", "Participation", "Midterm", "Final", "Group Report"].map(
          (category) => (
            <div
              key={category}
              className="w-48 h-48 bg-blue-100 dark:bg-blue-800 border border-blue-400 dark:border-blue-600 flex items-center justify-center cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-700 transition duration-300 shadow-md rounded-lg"
              onClick={() => handleButtonClick(category)}
            >
              <span className="text-lg font-medium text-blue-700 dark:text-blue-300">
                {category}
              </span>
            </div>
          )
        )
      )}
    </div>
  );
};

export default GradingSelection;
