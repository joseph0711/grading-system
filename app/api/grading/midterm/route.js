import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const course_id = searchParams.get("courseId");

    const query = `
      SELECT 
        sc.student_id,
        s.name,
        sc.midterm_score
      FROM grading.score sc
      JOIN grading.student s ON sc.student_id = s.student_id
      WHERE sc.course_id = ?;
    `;

    const [students] = await pool.query(query, [course_id]);

    return NextResponse.json(students, { status: 200 });
  } catch (error) {
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
        { message: "No midterm scores provided" },
        { status: 400 }
      );
    }

    const scoreRegex = /^([1-9]?[0-9])$/;
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
          `UPDATE grading.score SET midterm_score = ${
            student.score === null ? "NULL" : student.score
          } WHERE student_id = '${
            student.student_id
          }' AND course_id = '${courseId}'`
      )
      .join("; ");

    await pool.query(query);

    return NextResponse.json(
      { message: "Midterm scores updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating midterm scores:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
