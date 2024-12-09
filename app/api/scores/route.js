import { NextResponse } from "next/server";
import pool from "../../../lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json({ error: "Missing course ID" }, { status: 400 });
    }

    const [rows] = await pool.query(
      `SELECT 
        s.student_id,
        s.absence_times,
        s.participation_times,
        s.midterm_score,
        s.final_score,
        s.report_score,
        s.semester_score
      FROM grading.score s
      WHERE s.course_id = ?`,
      [courseId]
    );

    return NextResponse.json(rows || []);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        error: "Failed to get scores",
        details: error.message,
        sqlMessage: error.sqlMessage,
      },
      { status: 500 }
    );
  }
}
