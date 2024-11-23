import { NextResponse } from "next/server";
import pool from "../../../lib/db";

export async function GET(request) {
  try {
    const courseId = request.nextUrl.searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { message: "No course ID provided" },
        { status: 400 }
      );
    }

    const [rows] = await pool.query(
      `SELECT * FROM calculate.grading_criteria WHERE course_id = ?`,
      [courseId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Grading criteria not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error fetching grading criteria:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
