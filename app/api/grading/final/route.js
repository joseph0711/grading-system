import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

export async function POST(request) {
  try {
    const { students } = await request.json();

    if (!students || students.length === 0) {
      return NextResponse.json(
        { message: "No student scores provided" },
        { status: 400 }
      );
    }

    const query = `
      INSERT INTO grading.score (student_id, course_id, final_score)
      VALUES ${students.map(() => "(?, ?, ?)").join(", ")}
      ON DUPLICATE KEY UPDATE
        final_score = VALUES(final_score);
    `;

    const values = students.flatMap((student) => [
      student.student_id,
      student.course_id.toString(), // Ensure course_id is a string if needed
      student.score !== null && student.score !== undefined
        ? Number(student.score)
        : null,
    ]);

    console.log("Executing query:", query);
    console.log("With values:", values);

    const [result] = await pool.query(query, values);

    if (result.affectedRows > 0) {
      return NextResponse.json(
        { message: "Scores updated successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "No scores were updated" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error updating student scores:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // Extract course_id from the request URL or set a default value
    const { searchParams } = new URL(request.url);
    const course_id = searchParams.get('course_id') || '3137'; // Ensure this matches your actual course_id

    const query = `
      SELECT 
        u.user_id AS student_id, 
        u.name AS name, 
        sc.final_score AS score
      FROM 
        user u
      LEFT JOIN 
        score sc 
      ON 
        u.user_id = sc.student_id AND sc.course_id = ?
      WHERE
        u.role = 'student';
    `;

    const [students] = await pool.query(query, [course_id]);

    console.log("Fetched students:", students);

    return NextResponse.json(students, { status: 200 });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
