import { NextResponse } from "next/server";
import pool from "../../../lib/db";

// Helper function for semester score calculation
const calculateSemesterScore = (scores, weights) => {
  const attendanceScore = scores.attendance_score;
  const participationScore = scores.participation_score;
  const weightedMidterm =
    (scores.midterm_score || 0) * (weights.midterm_criteria / 100);
  const weightedFinal =
    (scores.final_score || 0) * (weights.final_criteria / 100);
  const weightedReport =
    (scores.report_score || 0) * (weights.report_criteria / 100);

  const totalScore =
    attendanceScore +
    participationScore +
    weightedMidterm +
    weightedFinal +
    weightedReport;

  return Math.round(Number(totalScore.toFixed(2)));
};

// Helper function to validate weights
const validateWeights = (weights) => {
  const totalWeight =
    weights.attendance_criteria +
    weights.participation_criteria +
    weights.midterm_criteria +
    weights.final_criteria +
    weights.report_criteria;

  return Math.abs(totalWeight - 100) < 0.001;
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json({ error: "Missing course ID" }, { status: 400 });
    }

    // Fetch weights from database
    const [rows] = await pool.query(
      `SELECT 
        attendance_criteria,
        participation_criteria,
        midterm_criteria,
        final_criteria,
        report_criteria
      FROM calculate.grading_criteria
      WHERE course_id = ?`,
      [courseId]
    );

    // If no weights are set, return default values
    if (rows.length === 0) {
      return NextResponse.json({
        attendance_criteria: 0,
        participation_criteria: 0,
        midterm_criteria: 0,
        final_criteria: 0,
        report_criteria: 0,
      });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: `Failed to fetch weight data: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { courseId } = await request.json();
    console.log("--- Debug: Processing Course ID:", courseId);

    // 1. Get weights
    const [weights] = await pool.query(
      `SELECT * FROM calculate.grading_criteria WHERE course_id = ?`,
      [courseId]
    );
    console.log("Retrieved weights:", weights[0]);

    if (weights.length === 0) {
      return NextResponse.json(
        { error: "Grading criteria not found" },
        { status: 404 }
      );
    }

    const weightData = weights[0];

    // Validate weights
    if (!validateWeights(weightData)) {
      return NextResponse.json(
        { error: "Invalid weights: total must be 100" },
        { status: 400 }
      );
    }

    // 2. Get all student scores
    const [scores] = await pool.query(
      `SELECT 
        s.student_id,
        s.absence_times,
        s.participation_times,
        s.midterm_score,
        s.final_score,
        s.report_score,
        GREATEST(0, ? - s.absence_times) as attendance_score,
        LEAST(?, s.participation_times) as participation_score
      FROM grading.score s
      WHERE s.course_id = ?`,
      [
        weightData.attendance_criteria,
        weightData.participation_criteria,
        courseId,
      ]
    );

    // 3. Calculate and update semester scores
    const updatePromises = scores.map(async (studentScore) => {
      console.log(`\nProcessing student: ${studentScore.student_id}`);
      const semesterScore = calculateSemesterScore(studentScore, weightData);
      console.log(`Calculated semester score: ${semesterScore}`);

      await pool.query(
        `UPDATE grading.score 
         SET semester_score = ? 
         WHERE student_id = ? AND course_id = ?`,
        [semesterScore, studentScore.student_id, courseId]
      );

      return {
        student_id: studentScore.student_id,
        semester_score: semesterScore,
      };
    });

    const results = await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: "Semester scores calculated and updated successfully",
      results,
    });
  } catch (error) {
    console.error("Calculate error:", error);
    return NextResponse.json(
      { error: "Failed to calculate semester scores" },
      { status: 500 }
    );
  }
}
