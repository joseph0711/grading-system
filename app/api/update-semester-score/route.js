import { NextResponse } from "next/server";
import pool from "../../../lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const { course_id, student_id, semester_score } = body;

    if (!course_id || !student_id || semester_score === undefined) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // First check if a record exists
    const [existingRecord] = await pool.query(
      `SELECT * FROM grading.score 
       WHERE course_id = ? AND student_id = ?`,
      [course_id, student_id]
    );

    let result;
    if (existingRecord.length > 0) {
      // Update existing record
      [result] = await pool.query(
        `UPDATE grading.score 
         SET semester_score = ? 
         WHERE course_id = ? AND student_id = ?`,
        [semester_score, course_id, student_id]
      );
    } else {
      // Insert new record with default values for other scores
      [result] = await pool.query(
        `INSERT INTO grading.score 
         (course_id, student_id, semester_score, absence_times, participation_times, 
          midterm_score, final_score, report_score) 
         VALUES (?, ?, ?, 0, 0, 0, 0, 0)`,
        [course_id, student_id, semester_score]
      );
    }

    if (result.affectedRows === 0) {
      throw new Error("No rows were updated/inserted");
    }

    return NextResponse.json({
      success: true,
      message: "Semester score updated successfully",
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      {
        error:
          "Update semester score failed: " +
          (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 }
    );
  }
}
