"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { useSettings } from "../contexts/SettingsContext";
import ViewScoreSkeleton from "../components/skeletons/ViewScoreSkeleton";
import { usePageTitle } from "@/app/hooks/usePageTitle";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Student {
  id: string;
  name: string;
  department: string;
  class: string;
  absence_times?: number;
  participation_times?: number;
  midterm_score?: number;
  final_score?: number;
  report_score?: number;
  semester_score?: number;
}

const ViewModes = {
  TABLE: "table",
  CHART: "chart",
} as const;

export default function ViewScorePage() {
  const router = useRouter();
  const { t } = useSettings();
  const [courseId, setCourseId] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBarChart, setShowBarChart] = useState(false);
  const [showPieChart, setShowPieChart] = useState(false);
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: any[];
  }>({
    labels: [
      "0-9",
      "10-19",
      "20-29",
      "30-39",
      "40-49",
      "50-59",
      "60-69",
      "70-79",
      "80-89",
      "90-100",
    ],
    datasets: [
      {
        label: t.studentCount,
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        backgroundColor: [
          "rgba(239, 68, 68, 0.6)", // red for failing scores
          "rgba(239, 68, 68, 0.6)",
          "rgba(239, 68, 68, 0.6)",
          "rgba(239, 68, 68, 0.6)",
          "rgba(239, 68, 68, 0.6)",
          "rgba(239, 68, 68, 0.6)",
          "rgba(72, 187, 120, 0.6)", // green for passing scores
          "rgba(72, 187, 120, 0.6)",
          "rgba(72, 187, 120, 0.6)",
          "rgba(72, 187, 120, 0.6)",
        ],
        borderColor: [
          "rgb(239, 68, 68)",
          "rgb(239, 68, 68)",
          "rgb(239, 68, 68)",
          "rgb(239, 68, 68)",
          "rgb(239, 68, 68)",
          "rgb(239, 68, 68)",
          "rgb(72, 187, 120)",
          "rgb(72, 187, 120)",
          "rgb(72, 187, 120)",
          "rgb(72, 187, 120)",
        ],
        borderWidth: 1,
        borderRadius: 5,
      },
    ],
  });
  usePageTitle("viewScore");
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<keyof typeof ViewModes>("TABLE");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [pieChartData, setPieChartData] = useState({
    labels: [t.passed, t.failed],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: [
          "rgba(72, 187, 120, 0.8)", // Passing - Green
          "rgba(239, 68, 68, 0.8)", // Failing - Red
        ],
        borderColor: ["rgb(72, 187, 120)", "rgb(239, 68, 68)"],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Student | null;
    direction: "ascending" | "descending" | null;
  }>({ key: null, direction: null });
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          font: { size: 14 },
          padding: 20,
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: t.passFailRatio,
        font: { size: 16, weight: "bold" as const },
        padding: { bottom: 20 },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
    },
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: { size: 12 },
        },
        title: {
          display: true,
          text: t.studentCount,
          font: { size: 14, weight: "bold" as const },
          padding: { bottom: 10 },
        },
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
      x: {
        title: {
          display: true,
          text: t.scoreRange,
          font: { size: 14, weight: "bold" as const },
          padding: { top: 10 },
        },
        ticks: {
          font: { size: 12 },
        },
      },
    },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: t.scoreDistribution,
        font: { size: 16, weight: "bold" as const },
        padding: { bottom: 20 },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `學生人數: ${context.raw}`,
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeInOutQuart" as const,
    },
    hover: {
      mode: "nearest" as const,
      intersect: true,
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      const startTime = Date.now();

      try {
        const sessionResponse = await fetch("/api/session");
        const sessionData = await sessionResponse.json();

        if (!sessionResponse.ok || !sessionData.authenticated) {
          router.push("/select-course");
          return;
        }

        if (sessionData.user && sessionData.user.course_id) {
          const courseId = sessionData.user.course_id;
          setCourseId(courseId);

          // Get student data
          const studentsResponse = await fetch(
            `/api/manage-course?courseId=${courseId}`
          );
          if (!studentsResponse.ok) {
            throw new Error(`HTTP error! status: ${studentsResponse.status}`);
          }
          const studentsData = await studentsResponse.json();

          // Extract students array from response
          const studentsArray = studentsData.students || [];

          if (!Array.isArray(studentsArray)) {
            console.error(
              "Expected students data to be an array, got:",
              typeof studentsArray
            );
            throw new Error("Invalid students data format");
          }

          // Fetch scores data
          const scoresResponse = await fetch(
            `/api/scores?courseId=${courseId}`
          );
          if (!scoresResponse.ok) {
            throw new Error(`HTTP error! status: ${scoresResponse.status}`);
          }
          const scoresData = await scoresResponse.json();

          if (!Array.isArray(scoresData)) {
            console.error(
              "Expected scores data to be an array, got:",
              typeof scoresData
            );
            throw new Error("Invalid scores data format");
          }

          // Merge student information and scores data
          const formattedData = studentsArray.map((student: Student) => {
            const scoreData = scoresData.find(
              (score: any) => score.student_id === student.id
            );

            return {
              ...student,
              absence_times: scoreData?.absence_times ?? null,
              participation_times: scoreData?.participation_times ?? null,
              midterm_score: scoreData?.midterm_score ?? null,
              final_score: scoreData?.final_score ?? null,
              report_score: scoreData?.report_score ?? null,
              semester_score: scoreData?.semester_score ?? null,
            };
          });

          // Ensure minimum loading time of 1 second for smooth UX
          const elapsedTime = Date.now() - startTime;
          const minimumLoadTime = 1000; // 1 second
          if (elapsedTime < minimumLoadTime) {
            await new Promise((resolve) =>
              setTimeout(resolve, minimumLoadTime - elapsedTime)
            );
          }

          setStudents(formattedData);
        } else {
          router.push("/select-course");
        }
      } catch (error) {
        console.error("Error:", error);
        setError("Error fetching data, please try again later");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Add the function to calculate the score distribution
  const calculateScoreDistribution = (students: Student[]) => {
    const distribution = new Array(10).fill(0);
    let passCount = 0;
    let failCount = 0;

    students.forEach((student) => {
      if (student.semester_score !== undefined) {
        const score = student.semester_score;
        const index = Math.min(Math.floor(score / 10), 9);
        distribution[index]++;

        if (score >= 60) {
          passCount++;
        } else {
          failCount++;
        }
      }
    });

    setChartData((prev) => ({
      ...prev,
      datasets: [
        {
          ...prev.datasets[0],
          data: distribution,
        },
      ],
    }));

    setPieChartData((prev) => ({
      ...prev,
      datasets: [
        {
          ...prev.datasets[0],
          data: [passCount, failCount],
        },
      ],
    }));
  };

  // Add the function to handle generating the chart
  const handleGenerateBarChart = () => {
    const distribution = new Array(10).fill(0);
    students.forEach((student) => {
      if (student.semester_score !== undefined) {
        const score = student.semester_score;
        const index = Math.min(Math.floor(score / 10), 9);
        distribution[index]++;
      }
    });

    setChartData((prev) => ({
      ...prev,
      datasets: [
        {
          ...prev.datasets[0],
          data: distribution,
        },
      ],
    }));
    setShowBarChart(true);
  };

  const handleGeneratePieChart = () => {
    let passCount = 0;
    let failCount = 0;

    students.forEach((student) => {
      if (student.semester_score !== undefined) {
        if (student.semester_score >= 60) {
          passCount++;
        } else {
          failCount++;
        }
      }
    });

    setPieChartData((prev) => ({
      ...prev,
      datasets: [
        {
          ...prev.datasets[0],
          data: [passCount, failCount],
        },
      ],
    }));
    setShowPieChart(true);
  };

  // Add this function at the top level of the component
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

  const handleExport = (type: "csv" | "pdf") => {
    const data = students.map((s) => ({
      id: s.id,
      name: s.name,
      department: s.department,
      class: s.class,
      semester_score: s.semester_score?.toFixed(1) ?? "-",
    }));

    if (type === "csv") {
      const csv = [
        ["ID", "Name", "Department", "Class", "Score"],
        ...data.map(Object.values),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "scores.csv";
      a.click();
    }
    // TODO: Implement PDF export
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
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    // Handle null/undefined values
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    if (aValue === bValue) return 0;

    const direction = sortConfig.direction === "ascending" ? 1 : -1;
    return aValue < bValue ? -direction : direction;
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

  // Add click outside handler for sort menu
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  // Add example data state for previews
  const exampleChartData = {
    ...chartData,
    datasets: [
      {
        ...chartData.datasets[0],
        data: [5, 8, 12, 15, 20, 18, 14, 10, 7, 4], // Example distribution
      },
    ],
  };

  const examplePieData = {
    ...pieChartData,
    datasets: [
      {
        ...pieChartData.datasets[0],
        data: [70, 30], // Example pass/fail ratio
      },
    ],
  };

  usePageTitle("viewScore");

  // Add this function inside ViewScorePage component
  const handleExportCSV = () => {
    // Add BOM for Excel to recognize UTF-8
    const BOM = "\uFEFF";

    // Create CSV content with all score details
    const headers = [
      t.studentId,
      t.name,
      t.department,
      t.class,
      t.absenceTimes,
      t.participationTimes,
      t.midterm,
      t.final,
      t.report,
      t.semesterScore,
    ];

    const csvContent =
      BOM +
      [
        headers.join(","),
        ...students.map((student) =>
          [
            student.id,
            `"${student.name}"`,
            `"${student.department}"`,
            `"${student.class}"`,
            student.absence_times ?? 0,
            student.participation_times ?? 0,
            student.midterm_score ?? "-",
            student.final_score ?? "-",
            student.report_score ?? "-",
            student.semester_score ? student.semester_score.toFixed(1) : "-",
          ].join(",")
        ),
      ].join("\n");

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const date = new Date().toISOString().split("T")[0];
    link.download = `scores_${date}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Add these functions inside ViewScorePage component
  const downloadChart = (chartRef: any, fileName: string) => {
    if (!chartRef.current) return;

    const link = document.createElement("a");
    link.download = `${fileName}_${new Date().toISOString().split("T")[0]}.png`;
    link.href = chartRef.current.toBase64Image();
    link.click();
  };

  // Add refs for both charts
  const barChartRef = useRef<any>(null);
  const pieChartRef = useRef<any>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
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
            {t.viewScore}
          </h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <ViewScoreSkeleton />
        ) : error ? (
          <div className="text-center text-red-600 dark:text-red-400 p-4">
            {error}
          </div>
        ) : !students.length ? (
          <div className="text-center text-gray-600 dark:text-gray-400 p-4">
            {t.noDataAvailable}
          </div>
        ) : (
          <>
            {/* Class Summary Section */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden mb-8">
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
                      {calculateSummary(students).average.toFixed(1)}
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

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Score Distribution Chart */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg relative">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {t.scoreDistribution}
                  </h2>
                  {showBarChart && (
                    <button
                      onClick={() =>
                        downloadChart(barChartRef, "score_distribution")
                      }
                      className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                      title={t.downloadChart}
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
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="h-[300px] flex items-center justify-center">
                  {showBarChart ? (
                    <Bar
                      ref={barChartRef}
                      data={chartData}
                      options={chartOptions}
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      <div className="absolute inset-0 flex items-center justify-center opacity-30 filter blur-sm">
                        <Bar data={exampleChartData} options={chartOptions} />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                        <button
                          onClick={handleGenerateBarChart}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                            transition-all transform hover:scale-105 shadow-md
                            flex items-center gap-2 z-10"
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
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                          {t.generateChart}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pass/Fail Ratio Chart */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg relative">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {t.passFailRatio}
                  </h2>
                  {showPieChart && (
                    <button
                      onClick={() =>
                        downloadChart(pieChartRef, "pass_fail_ratio")
                      }
                      className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                      title={t.downloadChart}
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
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="h-[300px] flex items-center justify-center">
                  {showPieChart ? (
                    <Pie
                      ref={pieChartRef}
                      data={pieChartData}
                      options={pieChartOptions}
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      <div className="absolute inset-0 flex items-center justify-center opacity-30 filter blur-sm">
                        <Pie data={examplePieData} options={pieChartOptions} />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                        <button
                          onClick={handleGeneratePieChart}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                            transition-all transform hover:scale-105 shadow-md
                            flex items-center gap-2 z-10"
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
                              d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                            />
                          </svg>
                          {t.generateChart}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {t.studentScores}
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

                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleExportCSV}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
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
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        {t.exportCSV}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      {[
                        {
                          key: "id",
                          label: t.studentId,
                          sortable: true,
                        },
                        {
                          key: "name",
                          label: t.name,
                          sortable: false,
                        },
                        {
                          key: "department",
                          label: t.department,
                          sortable: false,
                        },
                        {
                          key: "class",
                          label: t.class,
                          sortable: false,
                        },
                        {
                          key: "absence_times",
                          label: t.absenceTimes,
                          sortable: true,
                        },
                        {
                          key: "participation_times",
                          label: t.participationTimes,
                          sortable: true,
                        },
                        {
                          key: "midterm_score",
                          label: t.midterm,
                          sortable: true,
                        },
                        {
                          key: "final_score",
                          label: t.final,
                          sortable: true,
                        },
                        {
                          key: "report_score",
                          label: t.report,
                          sortable: true,
                        },
                        {
                          key: "semester_score",
                          label: t.semesterScore,
                          sortable: true,
                        },
                      ].map((column) => (
                        <th
                          key={column.key}
                          className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${
                            column.sortable
                              ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                              : ""
                          }`}
                          onClick={() =>
                            column.sortable &&
                            handleSort(column.key as keyof Student)
                          }
                        >
                          <div className="flex items-center gap-2">
                            {column.label}
                            {column.sortable && (
                              <div className="flex items-center ml-1">
                                <svg
                                  className={`w-4 h-4 transform transition-transform ${
                                    sortConfig.key === column.key
                                      ? sortConfig.direction === "ascending"
                                        ? "text-blue-600 dark:text-blue-400 rotate-0"
                                        : "text-blue-600 dark:text-blue-400 rotate-180"
                                      : "text-gray-400 rotate-0"
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M8 14l4-4 4 4" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {currentStudents.map((student) => (
                      <tr
                        key={student.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {student.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {student.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {student.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {student.class}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {student.absence_times ?? 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {student.participation_times ?? 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {student.midterm_score ?? "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {student.final_score ?? "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {student.report_score ?? "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {student.semester_score != null
                            ? Math.round(student.semester_score)
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

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
              </div>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="p-4 text-center text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
