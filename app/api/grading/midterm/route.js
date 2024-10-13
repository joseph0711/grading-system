import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const course_id = searchParams.get("courseId");

    const query = `
      SELECT 
        u.user_id AS student_id, 
        u.name AS name, 
        sc.midterm_score AS score
      FROM 
        grading.user u
      LEFT JOIN 
        grading.score sc 
      ON 
        u.user_id = sc.student_id AND sc.course_id = ?
      WHERE
        u.role = 'student';
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
        { message: "No student scores provided" },
        { status: 400 }
      );
    }

    const scoreRegex = /^(100|[1-9]?[0-9])$/;
    for (const student of students) {
      if (!scoreRegex.test(student.score)) {
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
          `UPDATE grading.score SET midterm_score = ${student.score} WHERE student_id = '${student.student_id}' AND course_id = '${courseId}'`
      )
      .join("; ");
    const [result] = await pool.query(query);

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
