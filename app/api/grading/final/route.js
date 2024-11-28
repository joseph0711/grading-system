import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    const query = `
      SELECT 
        sc.student_id,
        s.name,
        sc.final_score
      FROM grading.score sc
      JOIN grading.student s ON sc.student_id = s.student_id
      WHERE sc.course_id = ?;
    `;

    const [students] = await pool.query(query, [courseId]);

    return NextResponse.json(students, { status: 200 });
  } catch (error) {
    console.error("Error fetching students and final scores:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const { students } = await request.json();

    if (!students || students.length === 0) {
      return NextResponse.json(
        { message: "No final scores provided" },
        { status: 400 }
      );
    }

    const scoreRegex = /^(100|[1-9]?[0-9])$/;
    for (const student of students) {
      if (student.score !== null && !scoreRegex.test(student.score)) {
        return NextResponse.json(
          {
            message: `Invalid score for student ${student.student_id}. Score must be a number between 0 and 100.`,
          },
          { status: 400 }
        );
      }
    }

    const query = students
      .map(
        (student) =>
          `UPDATE grading.score SET final_score = ${
            student.score === null ? "NULL" : student.score
          } WHERE student_id = '${
            student.student_id
          }' AND course_id = '${courseId}'`
      )
      .join("; ");

    await pool.query(query);

    return NextResponse.json(
      { message: "Final scores updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating final scores:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
