import { NextResponse } from "next/server";
import pool from "../../../lib/db";

// Fetch course data including description and teacher's name
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
      `
      SELECT 
        c.course_description, 
        c.course_name,
        u.name AS teacher_name
      FROM 
        grading.course c
      LEFT JOIN 
        grading.user u ON c.teacher_id = u.user_id
      WHERE 
        c.course_id = ?
      `,
      [courseId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    const courseData = rows[0];

    return NextResponse.json(courseData);
  } catch (error) {
    console.error("Error fetching course data:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// Update course description
export async function PUT(request) {
  try {
    const { id, description } = await request.json();

    if (!id || description === undefined) {
      return NextResponse.json(
        { message: "Course ID and description are required" },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      "UPDATE grading.course SET course_description = ? WHERE course_id = ?",
      [description, id]
    );

    if (result.affectedRows > 0) {
      return NextResponse.json({
        message: "Course description updated successfully",
      });
    } else {
      return NextResponse.json(
        { message: "Course not found or no changes made" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error updating course description:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
