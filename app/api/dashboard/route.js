import { NextResponse } from "next/server";
import pool from "../../../lib/db";

export async function GET(request) {
  try {
    // Call the session API internally
    const sessionResponse = await fetch(
      `${request.nextUrl.origin}/api/session`,
      {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      }
    );

    const sessionData = await sessionResponse.json();

    if (!sessionResponse.ok || !sessionData.authenticated) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = sessionData.user;

    // Get user name based on role
    let rows;
    if (user.role === "student") {
      [rows] = await pool.query(
        `SELECT name FROM grading.student WHERE student_id = ?`,
        [user.account]
      );
    } else {
      [rows] = await pool.query(
        `SELECT name FROM grading.teacher WHERE teacher_id = ?`,
        [user.account]
      );
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ name: rows[0].name });
  } catch (error) {
    console.error("Error fetching user name:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
