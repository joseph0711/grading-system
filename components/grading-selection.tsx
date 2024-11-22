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
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  const gradingOptions = [
    {
      id: "Attendance",
      title: "Attendance",
      description: "Manage and grade student attendance records",
      icon: "👥",
      color: "from-blue-500 to-blue-600",
      component: <GradingAttendance courseId={courseId} onSuccess={() => console.log("Success")} />
    },
    {
      id: "Participation",
      title: "Participation",
      description: "Track and grade student participation",
      icon: "🗣️",
      color: "from-green-500 to-green-600",
      component: <GradingParticipation courseId={courseId} onSuccess={() => console.log("Success")} />
    },
    {
      id: "Midterm",
      title: "Midterm",
      description: "Grade midterm examinations",
      icon: "📝",
      color: "from-yellow-500 to-yellow-600",
      component: <GradingMidterm courseId={courseId} onSuccess={() => console.log("Success")} />
    },
    {
      id: "Final",
      title: "Final",
      description: "Grade final examinations",
      icon: "📊",
      color: "from-purple-500 to-purple-600",
      component: <GradingFinal courseId={courseId} onSuccess={() => console.log("Success")} />
    },
    {
      id: "Group Report",
      title: "Group Report",
      description: "Evaluate group project reports",
      icon: "📑",
      color: "from-red-500 to-red-600",
      component: <GroupReport />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedComponent ? (
          <div className="space-y-6">
            <button
              onClick={() => setSelectedComponent(null)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Grading Options</span>
            </button>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              {gradingOptions.find(opt => opt.id === selectedComponent)?.component}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Grading Dashboard
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Select a category to start grading
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gradingOptions.map((option) => (
                <div
                  key={option.id}
                  onClick={() => setSelectedComponent(option.id)}
                  className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  <div className="p-6">
                    <div className="text-4xl mb-4">{option.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {option.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {option.description}
                    </p>
                  </div>
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${option.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GradingSelection;
