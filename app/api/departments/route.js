import { NextResponse } from "next/server";
import pool from "../../../lib/db";

export async function GET() {
  try {
    // Fetch all departments ordered by name
    const [departments] = await pool.query(
      `SELECT department_id, department_name 
       FROM grading.department 
       ORDER BY department_name`
    );

    return NextResponse.json({ departments });
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { message: "Failed to fetch departments" },
      { status: 500 }
    );
  }
}
