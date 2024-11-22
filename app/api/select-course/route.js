import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import jwt from "jsonwebtoken";
import { parse } from "cookie";
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    // Parse cookies and extract the token
    const cookies = parse(request.headers.get("cookie") || "");
    const token = cookies.sessionToken;

    if (!token) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify and decode the JWT
    const secretKey = process.env.JWT_SECRET_KEY;
    let decoded;
    try {
      decoded = jwt.verify(token, secretKey);
    } catch (error) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const account = decoded.account;
    const role = decoded.role;
    console.log(account, role);

    if (!account || !role) {
      return NextResponse.json(
        { message: "User ID or role not found in token" },
        { status: 400 }
      );
    }

    let courses = [];

    if (role === "student") {
      const [courseRows] = await pool.query(
        `
        SELECT DISTINCT c.course_id, c.course_name, c.course_description
        FROM grading.course c
        JOIN grading.student_enrolled_info sei ON sei.course_id = c.course_id
        WHERE sei.student_id = ?
        `,
        [account]
      );

      courses = courseRows;
    } else if (role === "teacher") {
      const [courseRows] = await pool.query(
        `
        SELECT DISTINCT c.course_id, c.course_name, c.course_description
        FROM grading.course c
        JOIN grading.teaching_info ti ON ti.course_id = c.course_id
        WHERE ti.teacher_id = ?
        `,
        [account]
      );

      courses = courseRows;
    } else {
      return NextResponse.json(
        { message: "User role not recognized" },
        { status: 400 }
      );
    }

    // Fetch the teacher's name for each course
    const courseList = await Promise.all(
      courses.map(async (course) => {
        const [teacherRows] = await pool.query(
          `
          SELECT t.name
          FROM grading.teaching_info ti
          JOIN grading.course c ON ti.course_id = c.course_id
          JOIN grading.teacher t ON t.teacher_id = ti.teacher_id
          WHERE c.course_id = ?
          `,
          [course.course_id]
        );
        const teacherName =
          teacherRows.length > 0 ? teacherRows[0].name : "Unknown";

        return {
          course_id: course.course_id,
          course_name: course.course_name,
          course_description: course.course_description,
          teacher_name: teacherName,
        };
      })
    );

    return NextResponse.json({ courses: courseList }, { status: 200 });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
