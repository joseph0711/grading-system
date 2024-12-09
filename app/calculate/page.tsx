"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useSettings } from "../contexts/SettingsContext";
import { usePageTitle } from "../hooks/usePageTitle";
import CalculateSkeleton from "../components/skeletons/CalculateSkeleton";
import ProtectedRoute from "../components/ProtectedRoute";

// Types
interface Student {
  id: string;
  name: string;
  department: string;
  class: string;
  final_score?: number;
  semester_score?: number;
  status?: "PASS" | "FAIL";
}

interface ScoreWeights {
  attendance: string;
  participation: string;
  midterm: string;
  final: string;
  report: string;
}

// Define a type for the score objects
interface Score {
  student_id: string;
  semester_score: number;
}

// API Functions
const api = {
  async fetchSession() {
    const response = await fetch("/api/session");
    return response.json();
  },

  async fetchWeights(courseId: string) {
    const response = await fetch(`/api/calculate?courseId=${courseId}`);
    return response.json();
  },

  async saveWeights(weightValues: any) {
    const response = await fetch("/api/grading-criteria", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(weightValues),
    });
    return response.json();
  },

  async fetchScores(courseId: string) {
    const response = await fetch(`/api/scores?courseId=${courseId}`);
    return response.json();
  },

  async fetchStudents(courseId: string) {
    const response = await fetch(`/api/manage-course?courseId=${courseId}`);
    return response.json();
  },

  async updateSemesterScore(data: {
    course_id: string;
    student_id: string;
    semester_score: number;
  }) {
    const response = await fetch("/api/update-semester-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

// Custom Hooks
const useWeights = (initialWeights: any) => {
  const [weights, setWeights] = useState(initialWeights);
  const [isEditing, setIsEditing] = useState(false);

  const handleWeightChange = (field: keyof ScoreWeights, value: string) => {
    if (value === "" || (Number(value) >= 0 && Number(value) <= 100)) {
      setWeights((prev: ScoreWeights) => ({ ...prev, [field]: value }));
    }
  };

  const validateWeights = () => {
    const totalWeight = Object.values(weights).reduce(
      (sum: number, weight) => sum + Number(weight),
      0
    );
    return totalWeight === 100;
  };

  return {
    weights,
    setWeights,
    isEditing,
    setIsEditing,
    handleWeightChange,
    validateWeights,
  };
};

// Main Component
export default function CalculatePage() {
  usePageTitle("calculate");
  const { t } = useSettings();
  const router = useRouter();
  const [courseId, setCourseId] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showCalculateModal, setShowCalculateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Student | "status" | null;
    direction: "ascending" | "descending" | null;
  }>({ key: null, direction: null });
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [isWeightSectionCollapsed, setIsWeightSectionCollapsed] =
    useState(false);
  const [isCollapsing, setIsCollapsing] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const initialWeights = {
    attendance: "0",
    participation: "0",
    midterm: "0",
    final: "0",
    report: "0",
  };

  const {
    weights,
    setWeights,
    isEditing,
    setIsEditing,
    handleWeightChange,
    validateWeights,
  } = useWeights(initialWeights);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      try {
        const sessionData = await api.fetchSession();
        if (sessionData.authenticated && sessionData.user?.course_id) {
          const courseId = sessionData.user.course_id;
          setCourseId(courseId);
          const weightsData = await api.fetchWeights(courseId);
          setWeights({
            attendance: weightsData.attendance_criteria || "0",
            participation: weightsData.participation_criteria || "0",
            midterm: weightsData.midterm_criteria || "0",
            final: weightsData.final_criteria || "0",
            report: weightsData.report_criteria || "0",
          });
        } else {
          router.push("/select-course");
        }
      } catch (error) {
        console.error("Initialization error:", error);
        toast.error("Failed to initialize data");
      } finally {
        setIsPageLoading(false);
      }
    };

    initializeData();
  }, [router]);

  // Handlers
  const handleCalculateClick = () => {
    if (!validateWeights()) {
      toast.error("The total weight of all scores must be 100");
      return;
    }
    setShowCalculateModal(true);
  };

  const handleSaveWeights = async () => {
    try {
      if (!validateWeights()) {
        throw new Error("The total weight must be 100");
      }

      const weightValues = {
        course_id: courseId,
        attendance_criteria: parseInt(weights.attendance),
        participation_criteria: parseInt(weights.participation),
        midterm_criteria: parseInt(weights.midterm),
        final_criteria: parseInt(weights.final),
        report_criteria: parseInt(weights.report),
      };

      await api.saveWeights(weightValues);
      toast.success(t.weightsSavedSuccessfully);
      setIsEditing(false);
      return true;
    } catch (error) {
      console.error("Save weights error:", error);
      toast.error(
        `Error saving weights: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      return false;
    }
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    setLoadingResults(true);
    try {
      // Step 1: Calculate scores
      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId }),
      });

      const calculationData = await response.json();

      if (!response.ok) {
        throw new Error(
          `Failed to calculate scores: ${
            calculationData.error || "Unknown error"
          }`
        );
      }

      // Step 2: Fetch updated student data
      const studentsResponse = await fetch(
        `/api/manage-course?courseId=${courseId}`
      );
      const studentsData = await studentsResponse.json();

      // Step 3: Fetch scores
      const scoresResponse = await fetch(`/api/scores?courseId=${courseId}`);
      const scoresData = await scoresResponse.json();

      // Handle the data structure
      let students = [];
      if (studentsData && studentsData.students) {
        students = Array.isArray(studentsData.students)
          ? studentsData.students
          : [studentsData.students];
      }

      let scores = [];
      if (scoresData) {
        scores = Array.isArray(scoresData) ? scoresData : [scoresData];
      }

      // Merge student data with their scores
      const studentsWithScores = students.map((student: Student) => {
        const studentScore = scores.find(
          (score: Score) => score.student_id === student.id
        );

        return {
          ...student,
          semester_score: studentScore?.semester_score ?? null,
        };
      });

      if (studentsWithScores.length === 0) {
        throw new Error("No student data available");
      }

      setStudents(studentsWithScores);
      setShowModal(false);
      setShowResults(true);
      toast.success(t.semesterScoresCalculatedAndSaved, {
        duration: 3000,
        position: "top-center",
        icon: "🎉",
      });
      setIsWeightSectionCollapsed(true);
    } catch (error) {
      console.error("Calculate scores error:", error);
      toast.error(
        `Operation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        {
          duration: 5000,
          position: "top-center",
        }
      );
    } finally {
      setIsLoading(false);
      setLoadingResults(false);
    }
  };

  const calculateTotalWeight = (weights: ScoreWeights): number => {
    return Object.values(weights).reduce(
      (sum: number, val) => sum + Number(val || 0),
      0
    );
  };

  // Move resetWeights outside handleDiscardChanges
  const resetWeights = async () => {
    try {
      const weightsData = await api.fetchWeights(courseId);
      setWeights({
        attendance: weightsData.attendance_criteria || "0",
        participation: weightsData.participation_criteria || "0",
        midterm: weightsData.midterm_criteria || "0",
        final: weightsData.final_criteria || "0",
        report: weightsData.report_criteria || "0",
      });
      setIsEditing(false);
      setShowDiscardModal(false);
    } catch (error) {
      console.error("Error resetting weights:", error);
      toast.error("Failed to reset weights");
    }
  };

  // Update handleDiscardChanges to just show modal
  const handleDiscardChanges = () => {
    setShowDiscardModal(true);
  };

  // Add ESC key listener
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isEditing) {
        handleDiscardChanges();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isEditing]);

  // Update the fetchStudentDetails function
  const fetchStudentDetails = async (studentId: string) => {
    try {
      // First get the raw scores
      const response = await fetch(`/api/scores?courseId=${courseId}`);
      const data = await response.json();

      // Find the specific student's scores
      const studentScore = data.find(
        (score: any) => score.student_id === studentId
      );

      if (!studentScore) {
        throw new Error("Student scores not found");
      }

      // Calculate attendance and participation scores based on the criteria
      const attendanceScore = Math.max(
        0,
        Number(weights.attendance) - (studentScore.absence_times || 0)
      );
      const participationScore = Math.min(
        Number(weights.participation),
        studentScore.participation_times || 0
      );

      return {
        attendance_score: attendanceScore,
        participation_score: participationScore,
        midterm_score: studentScore.midterm_score || 0,
        final_score: studentScore.final_score || 0,
        report_score: studentScore.report_score || 0,
      };
    } catch (error) {
      console.error("Error fetching student details:", error);
      toast.error("Failed to fetch student details");
      return null;
    }
  };

  // Add function to handle showing details
  const handleShowDetails = async (student: Student) => {
    setSelectedStudent(student);
    const details = await fetchStudentDetails(student.id);
    setStudentDetails(details);
    setShowDetailsModal(true);
  };

  // Add sorting function
  const handleSort = (key: keyof Student) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction: direction as "ascending" | "descending" });
  };

  // Add sorting logic
  const sortedStudents = [...students].sort((a, b) => {
    if (sortConfig.key === "status") {
      const aStatus = (a.semester_score ?? 0) >= 60;
      const bStatus = (b.semester_score ?? 0) >= 60;
      return sortConfig.direction === "ascending"
        ? Number(aStatus) - Number(bStatus)
        : Number(bStatus) - Number(aStatus);
    }

    if (sortConfig.key) {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
    }
    return 0;
  });

  // Add search filter
  const filteredStudents = sortedStudents.filter((student) => {
    const searchString = searchTerm.toLowerCase();
    return (
      student.id.toLowerCase().includes(searchString) ||
      student.name.toLowerCase().includes(searchString) ||
      student.department.toLowerCase().includes(searchString) ||
      student.class.toLowerCase().includes(searchString)
    );
  });

  // Move pagination logic here, after filteredStudents is defined
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  // Add summary calculation function
  const calculateSummary = (students: Student[]) => {
    const totalStudents = students.length;
    const passCount = students.filter(
      (s) => (s.semester_score ?? 0) >= 60
    ).length;
    const failCount = totalStudents - passCount;
    const average =
      students.reduce(
        (sum, student) => sum + (student.semester_score ?? 0),
        0
      ) / totalStudents;

    return {
      totalStudents,
      passCount,
      failCount,
      average: isNaN(average) ? 0 : average,
      passRate: totalStudents > 0 ? (passCount / totalStudents) * 100 : 0,
    };
  };

  // Add useEffect for click outside handling of sort menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showSortMenu &&
        !(event.target as Element).closest(".sort-dropdown")
      ) {
        setShowSortMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSortMenu]);

  // Modify the collapse handler
  const handleCollapseToggle = () => {
    if (!showResults) return;
    setIsCollapsing(true);
    setTimeout(() => {
      setIsWeightSectionCollapsed(!isWeightSectionCollapsed);
      setIsCollapsing(false);
    }, 50);
  };

  return (
    <ProtectedRoute
      requireCourse={true}
      allowedRoles={["teacher"]}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800"
    >
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>{t.backToDashboard}</span>
          </button>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t.calculate}
          </h1>
        </div>
      </header>

      {/* 分數權重調整表格 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          <div
            className="p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
            onClick={() => showResults && handleCollapseToggle()}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {t.scoreWeightsConfiguration}
              </h2>
              <div className="flex items-center gap-4">
                {/* Edit/Save Buttons */}
                {!showResults || !isWeightSectionCollapsed ? (
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDiscardChanges();
                          }}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          {t.cancel}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveWeights();
                          }}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {t.save}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditing(true);
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                        {t.edit}
                      </button>
                    )}
                  </div>
                ) : null}

                {/* Collapse Icon */}
                <div
                  onClick={() => showResults && handleCollapseToggle()}
                  className={`${
                    showResults
                      ? "cursor-pointer"
                      : "cursor-not-allowed opacity-50"
                  }`}
                >
                  <svg
                    className={`w-6 h-6 transform transition-transform duration-200 ease-in-out text-gray-600 dark:text-gray-300 ${
                      isWeightSectionCollapsed ? "" : "rotate-180"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Collapsible content */}
          <Transition
            show={!isWeightSectionCollapsed}
            enter="transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)"
            enterFrom="opacity-0 max-h-0 scale-y-95 origin-top"
            enterTo="opacity-100 max-h-[2000px] scale-y-100 origin-top"
            leave="transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)"
            leaveFrom="opacity-100 max-h-[2000px] scale-y-100 origin-top"
            leaveTo="opacity-0 max-h-0 scale-y-95 origin-top"
          >
            <div className="overflow-hidden transform-gpu">
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { key: "attendance", label: t.attendance, icon: "👥" },
                    {
                      key: "participation",
                      label: t.participation,
                      icon: "✋",
                    },
                    { key: "midterm", label: t.midterm, icon: "📝" },
                    { key: "final", label: t.final, icon: "📚" },
                    { key: "report", label: t.report, icon: "📊" },
                  ].map(({ key, label, icon }) => (
                    <div
                      key={key}
                      className="relative bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
                    >
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <span>{icon}</span>
                        <span>
                          {label}
                          {t.weight}
                        </span>
                      </label>
                      <div className="relative mt-1">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          min="0"
                          max="100"
                          value={weights[key as keyof ScoreWeights]}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, "");
                            handleWeightChange(
                              key as keyof ScoreWeights,
                              value
                            );
                          }}
                          onBlur={(e) => {
                            const value = e.target.value;
                            if (value === "") {
                              handleWeightChange(
                                key as keyof ScoreWeights,
                                "0"
                              );
                            }
                          }}
                          disabled={!isEditing}
                          className={`block w-full px-4 py-2.5 rounded-lg 
                            ${
                              !isEditing
                                ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed text-gray-700 dark:text-gray-300"
                                : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            } 
                            border border-gray-300 dark:border-gray-600 
                            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                            text-right pr-12 text-base transition-colors`}
                          placeholder="0"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                          <span className="text-gray-500 dark:text-gray-400">
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {t.totalWeight}
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span
                          className={`text-2xl font-bold ${
                            calculateTotalWeight(weights) === 100
                              ? "text-green-600 dark:text-green-400"
                              : calculateTotalWeight(weights) > 100
                              ? "text-red-600 dark:text-red-400"
                              : "text-yellow-600 dark:text-yellow-400"
                          }`}
                        >
                          {calculateTotalWeight(weights)}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          / 100%
                        </span>
                      </div>
                      {calculateTotalWeight(weights) !== 100 && (
                        <div
                          className={`text-sm mt-1 ${
                            calculateTotalWeight(weights) > 100
                              ? "text-red-500 dark:text-red-400"
                              : "text-yellow-500 dark:text-yellow-400"
                          }`}
                        >
                          {calculateTotalWeight(weights) > 100
                            ? t.totalWeightExceeds100
                            : t.totalWeightMustBe100}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleCalculateClick}
                    disabled={
                      isEditing || calculateTotalWeight(weights) !== 100
                    }
                    className={`px-6 py-3 bg-blue-600 text-white rounded-lg 
                      transition-all transform hover:scale-105 
                      flex items-center gap-2 ${
                        isEditing || calculateTotalWeight(weights) !== 100
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-blue-700"
                      }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    {t.calculateSemesterScores}
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      {/* Results Table */}
      {showResults && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          {/* Class Summary Card */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden mx-auto mb-8">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {t.classSummary}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    {t.totalStudents}
                  </div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {calculateSummary(students).totalStudents}
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-sm text-green-600 dark:text-green-400">
                    {t.passed}
                  </div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {calculateSummary(students).passCount}
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <div className="text-sm text-red-600 dark:text-red-400">
                    {t.failed}
                  </div>
                  <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {calculateSummary(students).failCount}
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="text-sm text-purple-600 dark:text-purple-400">
                    {t.classAverage}
                  </div>
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {Math.round(calculateSummary(students).average)}
                  </div>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                  <div className="text-sm text-indigo-600 dark:text-indigo-400">
                    {t.passRate}
                  </div>
                  <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                    {calculateSummary(students).passRate.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Existing Results Table */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {t.semesterScoresResults}
                </h2>
                <div className="flex items-center gap-4">
                  {/* Search Input */}
                  <div className="relative w-64">
                    <input
                      type="text"
                      placeholder={t.searchStudents}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                      focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                    <svg
                      className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>

                  {/* Sort Button */}
                  <div className="relative sort-dropdown">
                    <button
                      onClick={() => setShowSortMenu(!showSortMenu)}
                      className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 
                      rounded-lg flex items-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-800/30 text-blue-700 dark:text-blue-300"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                        />
                      </svg>
                      {t.sortBy}
                    </button>

                    {/* Sort Menu */}
                    {showSortMenu && (
                      <div
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl 
                      border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 z-50"
                      >
                        {[
                          {
                            label: t.studentId,
                            key: "id",
                            ascending: t.aToZ,
                            descending: t.zToA,
                          },
                          {
                            label: t.semesterScore,
                            key: "semester_score",
                            ascending: t.lowToHigh,
                            descending: t.highToLow,
                          },
                          {
                            label: t.status,
                            key: "status",
                            ascending: t.failFirst,
                            descending: t.passFirst,
                          },
                        ].map((item) => (
                          <div
                            key={item.key}
                            className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          >
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                              {item.label}
                            </div>
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => {
                                  setSortConfig({
                                    key: item.key as keyof Student | "status",
                                    direction: "ascending",
                                  });
                                  setShowSortMenu(false);
                                }}
                                className={`flex items-center justify-between px-3 py-1.5 text-sm rounded-md
                                ${
                                  sortConfig.key === item.key &&
                                  sortConfig.direction === "ascending"
                                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                              >
                                <span>{item.ascending}</span>
                                {sortConfig.key === item.key &&
                                  sortConfig.direction === "ascending" && (
                                    <svg className="w-4 h-4" /* ... */ />
                                  )}
                              </button>
                              <button
                                onClick={() => {
                                  setSortConfig({
                                    key: item.key as keyof Student | "status",
                                    direction: "descending",
                                  });
                                  setShowSortMenu(false);
                                }}
                                className={`flex items-center justify-between px-3 py-1.5 text-sm rounded-md
                                ${
                                  sortConfig.key === item.key &&
                                  sortConfig.direction === "descending"
                                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                              >
                                <span>{item.descending}</span>
                                {sortConfig.key === item.key &&
                                  sortConfig.direction === "descending" && (
                                    <svg className="w-4 h-4" /* ... */ />
                                  )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {loadingResults ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-300">
                  Loading results...
                </p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-gray-600 dark:text-gray-300">
                No student data available
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t.studentId}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t.name}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t.department}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t.class}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t.score}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t.status}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {t.details}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {currentStudents.map((student) => (
                        <tr
                          key={
                            student.id ||
                            indexOfFirstItem + currentStudents.indexOf(student)
                          }
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {student.id || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {student.name || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {student.department || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {student.class || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <span
                              className={`
                            ${
                              student.semester_score != null &&
                              student.semester_score >= 60
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }
                          `}
                            >
                              {student.semester_score != null
                                ? Math.round(student.semester_score)
                                : "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium
                            ${
                              student.semester_score != null &&
                              student.semester_score >= 60
                                ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                            }
                          `}
                            >
                              {student.semester_score != null &&
                              student.semester_score >= 60
                                ? "PASS"
                                : "FAIL"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleShowDetails(student)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              {t.details}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    {/* Left side - Page info */}
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t.pageOf
                        .replace("{current}", currentPage.toString())
                        .replace("{total}", totalPages.toString())}
                    </div>

                    {/* Center - Pagination controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="First page"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 19l-7-7m0 0l7-7m-7 7h18"
                          />
                        </svg>
                      </button>

                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 
                             hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {t.previous}
                      </button>

                      <div className="flex items-center gap-1">
                        {[...Array(Math.min(totalPages, 5))].map((_, idx) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = idx + 1;
                          } else if (currentPage <= 3) {
                            pageNum = idx + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + idx;
                          } else {
                            pageNum = currentPage - 2 + idx;
                          }

                          return (
                            <button
                              key={idx}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-4 py-2 rounded-md transition-colors ${
                                currentPage === pageNum
                                  ? "bg-blue-600 text-white"
                                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 
                               hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {t.next}
                      </button>

                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Last page"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 5l7 7-7 7M5 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Right side - Items per page selector */}
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="pageSize"
                        className="text-sm text-gray-600 dark:text-gray-400"
                      >
                        {t.itemsPerPage}
                      </label>
                      <select
                        id="pageSize"
                        value={itemsPerPage}
                        onChange={(e) => {
                          const newSize = parseInt(e.target.value);
                          setItemsPerPage(newSize);
                          setCurrentPage(1);
                        }}
                        className="px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 
                               text-gray-700 dark:text-gray-200 text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Discard Changes Modal */}
      <Transition appear show={showDiscardModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setShowDiscardModal(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 backdrop-blur-none"
            enterTo="opacity-100 backdrop-blur-md"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 backdrop-blur-md"
            leaveTo="opacity-0 backdrop-blur-none"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-md transition-all duration-300" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95 translate-y-4"
                enterTo="opacity-100 scale-100 translate-y-0"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100 translate-y-0"
                leaveTo="opacity-0 scale-95 -translate-y-4"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    {t.discardChanges}
                  </Dialog.Title>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {t.discardChangesMessage}
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => setShowDiscardModal(false)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      {t.keepEditing}
                    </button>
                    <button
                      onClick={resetWeights}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      {t.discardChanges}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Calculate Confirmation Modal */}
      <Transition appear show={showCalculateModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setShowCalculateModal(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 backdrop-blur-none"
            enterTo="opacity-100 backdrop-blur-md"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 backdrop-blur-md"
            leaveTo="opacity-0 backdrop-blur-none"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-md transition-all duration-300" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95 translate-y-4"
                enterTo="opacity-100 scale-100 translate-y-0"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100 translate-y-0"
                leaveTo="opacity-0 scale-95 -translate-y-4"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    {t.calculateSemesterScores}
                  </Dialog.Title>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {t.calculateSemesterScoresMessage}
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => setShowCalculateModal(false)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      {t.cancel}
                    </button>
                    <button
                      onClick={() => {
                        setShowCalculateModal(false);
                        handleConfirm();
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      {t.calculate}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Details Modal */}
      <Transition appear show={showDetailsModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setShowDetailsModal(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 backdrop-blur-none"
            enterTo="opacity-100 backdrop-blur-md"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 backdrop-blur-md"
            leaveTo="opacity-0 backdrop-blur-none"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-md transition-all duration-300" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95 translate-y-4"
                enterTo="opacity-100 scale-100 translate-y-0"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100 translate-y-0"
                leaveTo="opacity-0 scale-95 -translate-y-4"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4"
                  >
                    {t.scoreCalculationDetails} - {selectedStudent?.name}
                  </Dialog.Title>
                  {studentDetails && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          {
                            key: "attendance",
                            label: t.attendance,
                            icon: "👥",
                            scoreKey: "attendance_score",
                          },
                          {
                            key: "participation",
                            label: t.participation,
                            icon: "✋",
                            scoreKey: "participation_score",
                          },
                          {
                            key: "midterm",
                            label: t.midterm,
                            icon: "📝",
                            scoreKey: "midterm_score",
                          },
                          {
                            key: "final",
                            label: t.final,
                            icon: "📚",
                            scoreKey: "final_score",
                          },
                          {
                            key: "report",
                            label: t.report,
                            icon: "📊",
                            scoreKey: "report_score",
                          },
                        ].map(({ key, label, icon, scoreKey }) => (
                          <div
                            key={key}
                            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span>{icon}</span>
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                  {label}
                                </span>
                              </div>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {t.weight}: {weights[key as keyof ScoreWeights]}
                                %
                              </span>
                            </div>
                            <div className="flex justify-between items-baseline">
                              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {studentDetails[scoreKey]}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {t.weighted}:{" "}
                                {key === "attendance" || key === "participation"
                                  ? studentDetails[scoreKey] // For attendance and participation, show the same score
                                  : (
                                      (studentDetails[scoreKey] *
                                        Number(
                                          weights[key as keyof ScoreWeights]
                                        )) /
                                      100
                                    ).toFixed(1)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-medium text-blue-700 dark:text-blue-300">
                            {t.semesterScore}
                          </span>
                          <span className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                            {selectedStudent?.semester_score != null
                              ? Math.round(selectedStudent?.semester_score)
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={() => setShowDetailsModal(false)}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                          {t.close}
                        </button>
                      </div>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </ProtectedRoute>
  );
}
