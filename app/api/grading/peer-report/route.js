import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import { parse } from "cookie";
import jwt from "jsonwebtoken";

export async function GET(request) {
  try {
    const cookies = parse(request.headers.get("cookie") || "");
    const token = cookies.sessionToken;
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

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

    const studentId = decoded.account;

    if (!studentId) {
      return NextResponse.json(
        { message: "Student ID not found in token" },
        { status: 400 }
      );
    }

    // Query for the report view
    const reportQuery = `
      WITH UserGroup AS (
        SELECT group_id
        FROM grading.group
        WHERE student_id = ? AND course_id = ?
      )
      SELECT DISTINCT 
        g.group_id as scored_group_id,
        ps.score_value
      FROM grading.group g
      CROSS JOIN UserGroup ug
      LEFT JOIN grading.report_peer_scores ps ON 
          ps.scored_group_id = g.group_id AND 
          ps.student_id = ? AND
          ps.course_id = ?
      WHERE g.course_id = ?
        AND g.group_id != ug.group_id
      ORDER BY g.group_id`;

    // Process the results
    const [rows] = await pool.query(reportQuery, [
      studentId,
      courseId,
      studentId,
      courseId,
      courseId,
    ]);

    // Transform the data for the frontend
    const groupScores = rows.map((row) => ({
      groupId: row.scored_group_id,
      scoreValue: row.score_value || "",
    }));

    return NextResponse.json({ groupScores }, { status: 200 });
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const cookies = parse(request.headers.get("cookie") || "");
    const token = cookies.sessionToken;
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    if (!token) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify token
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

    const studentId = decoded.account;
    const body = await request.json();
    const { peerScores } = body;

    // Enhanced validation
    if (!peerScores || !Array.isArray(peerScores)) {
      return NextResponse.json(
        { message: "No valid peer scores provided" },
        { status: 400 }
      );
    }

    // Validate each score object
    const validScores = peerScores.filter(
      (score) =>
        score.scoredGroupId &&
        (typeof score.scoreValue === "number" || score.scoreValue === null)
    );

    if (validScores.length === 0) {
      return NextResponse.json(
        { message: "No valid scores to save" },
        { status: 400 }
      );
    }

    // Prepare values for insertion, filtering out any empty scores
    const values = validScores.map((score) => [
      studentId,
      courseId,
      score.scoredGroupId,
      score.scoreValue,
    ]);

    if (values.length === 0) {
      return NextResponse.json(
        { message: "No scores to update" },
        { status: 200 }
      );
    }

    const insertQuery = `
      INSERT INTO grading.report_peer_scores 
        (student_id, course_id, scored_group_id, score_value)
      VALUES
        ?
      ON DUPLICATE KEY UPDATE
        score_value = VALUES(score_value)
    `;

    await pool.query(insertQuery, [values]);

    return NextResponse.json(
      { message: "Peer scores submitted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error submitting peer scores:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
