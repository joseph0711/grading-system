import { NextResponse } from "next/server";
import pool from "../../../lib/db";

// Fetch all student information
export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT user_id AS id, department, `class`, name FROM grading.user WHERE role = ?",
      ["student"]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching student data:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// Update student information
export async function PUT(request) {
  try {
    const { id, department, class: className, name } = await request.json();

    console.log("Request data:", { id, department, className, name });

    const [existingStudentRows] = await pool.query(
      "SELECT department, `class`, name FROM grading.user WHERE user_id = ? AND role = ?",
      [id, "student"]
    );

    if (existingStudentRows.length === 0) {
      console.error("Student not found for ID:", id);
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    const existingStudent = existingStudentRows[0];

    // Use existing values for any fields not provided in the request
    const updatedDepartment =
      department !== undefined ? department : existingStudent.department;
    const updatedClassName =
      className !== undefined ? className : existingStudent.class;
    const updatedName = name !== undefined ? name : existingStudent.name;

    console.log("Updating student with values:", {
      updatedDepartment,
      updatedClassName,
      updatedName,
    });

    // Update query
    const query = `
      UPDATE user 
      SET department = ?, \`class\` = ?, name = ? 
      WHERE user_id = ? AND role = 'student'
    `;

    // Execute the update query
    const [result] = await pool.query(query, [
      updatedDepartment,
      updatedClassName,
      updatedName,
      id,
    ]);
    console.log("Update result:", result);

    // Check if the student info was successfully updated
    if (result.affectedRows > 0) {
      return NextResponse.json({
        message: "Student info updated successfully",
      });
    } else {
      return NextResponse.json({ message: "No changes made" }, { status: 404 });
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
    const { ids } = await request.json(); // Expecting an array of student IDs

    if (!ids || ids.length === 0) {
      return NextResponse.json(
        { message: "No student IDs provided" },
        { status: 400 }
      );
    }

    // Delete query for bulk deletion
    const query = `
      DELETE FROM grading.user 
      WHERE user_id IN (?) AND role = 'student'
    `;

    const [result] = await pool.query(query, [ids]);

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
    console.error("Error deleting student(s):", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
