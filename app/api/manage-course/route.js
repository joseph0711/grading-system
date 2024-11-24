import { NextResponse } from "next/server";
import pool from "../../../lib/db";

// Fetch all student information and departments
export async function GET(request) {
  try {
    const courseId = request.nextUrl.searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { message: "No course ID provided" },
        { status: 400 }
      );
    }

    // Fetch students
    const [studentRows] = await pool.query(
      `SELECT s.student_id AS id, s.name, d.department_name AS department, s.class
      FROM grading.student_enrolled_info sei
      JOIN grading.student s ON sei.student_id = s.student_id 
      JOIN grading.department d ON s.department_id = d.department_id
      WHERE sei.course_id = ?
      ORDER BY s.student_id`,
      [courseId]
    );

    // Fetch departments
    const [departmentRows] = await pool.query(
      `SELECT department_id, department_name 
       FROM grading.department 
       ORDER BY department_name`
    );

    return NextResponse.json({
      students: studentRows,
      departments: departmentRows,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// Update student information
export async function PUT(request) {
  try {
    const { id, department, class: className, name } = await request.json();

    // First get the department_id from department name
    const [departmentRows] = await pool.query(
      "SELECT department_id FROM grading.department WHERE department_name = ?",
      [department]
    );

    if (departmentRows.length === 0) {
      return NextResponse.json(
        { message: "Department not found" },
        { status: 404 }
      );
    }

    const departmentId = departmentRows[0].department_id;

    // Update the student information
    const query = `
      UPDATE grading.student 
      SET department_id = ?, 
          class = ?, 
          name = ? 
      WHERE student_id = ?
    `;

    const [result] = await pool.query(query, [
      departmentId,
      className,
      name,
      id,
    ]);

    if (result.affectedRows > 0) {
      return NextResponse.json({
        message: "Student info updated successfully",
      });
    } else {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error updating student data:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// Delete student information
export async function DELETE(request) {
  try {
    const { ids } = await request.json();

    if (!ids || ids.length === 0) {
      return NextResponse.json(
        { message: "No student IDs provided" },
        { status: 400 }
      );
    }

    // Start a transaction
    await pool.query("START TRANSACTION");

    try {
      // Delete from score first (if exists)
      await pool.query(`DELETE FROM grading.score WHERE student_id IN (?)`, [
        ids,
      ]);

      await pool.query(
        `DELETE FROM grading.report_peer_scores WHERE student_id IN (?)`,
        [ids]
      );

      // Delete from group table
      await pool.query(`DELETE FROM grading.group WHERE student_id IN (?)`, [
        ids,
      ]);

      // Delete from student_enrolled_info
      await pool.query(
        `DELETE FROM grading.student_enrolled_info WHERE student_id IN (?)`,
        [ids]
      );

      // Finally delete from student table
      const [result] = await pool.query(
        `DELETE FROM grading.student WHERE student_id IN (?)`,
        [ids]
      );

      // If we got here, commit the transaction
      await pool.query("COMMIT");

      if (result.affectedRows > 0) {
        return NextResponse.json({
          message: `${result.affectedRows} students deleted successfully`,
        });
      } else {
        return NextResponse.json(
          { message: "No students deleted" },
          { status: 404 }
        );
      }
    } catch (error) {
      // If any error occurs, rollback the transaction
      await pool.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error deleting student(s):", error);
    return NextResponse.json(
      {
        message:
          "Failed to delete student(s). They might be part of existing groups or have associated scores.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// Add this new PATCH method for updating course description
export async function PATCH(request) {
  try {
    const { courseId, description } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { message: "No course ID provided" },
        { status: 400 }
      );
    }

    // Update the course description
    const query = `
      UPDATE grading.course 
      SET course_description = ?
      WHERE course_id = ?
    `;

    const [result] = await pool.query(query, [description, courseId]);

    if (result.affectedRows > 0) {
      return NextResponse.json({
        message: "Course description updated successfully",
      });
    } else {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error updating course description:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
