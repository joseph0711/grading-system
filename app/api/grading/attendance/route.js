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
        sc.absence_times,
        GREATEST(0, 100 - (sc.absence_times * 5)) as attendance_score
      FROM 
        grading.score sc
      JOIN 
        grading.student s 
      ON 
        sc.student_id = s.student_id
      WHERE 
        sc.course_id = ?;
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
        { message: "No student absences provided" },
        { status: 400 }
      );
    }

    const absenceRegex = /^[0-9]+$/;
    for (const student of students) {
      if (!absenceRegex.test(student.absences)) {
        return NextResponse.json(
          {
            message: `Invalid absence count for student ${student.student_id}. Absences must be a non-negative integer.`,
          },
          { status: 400 }
        );
      }
    }

    const query = students
      .map(
        (student) =>
          `UPDATE grading.score SET absence_times = ${student.absences} WHERE student_id = '${student.student_id}' AND course_id = '${courseId}'`
      )
      .join("; ");
    const [result] = await pool.query(query);

    return NextResponse.json(
      { message: "Absence times updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating absence times:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
