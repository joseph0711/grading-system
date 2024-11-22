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

    // Fetch the user's group
    const query = `
      WITH UserGroup AS (
        SELECT group_id
        FROM grading.group
        WHERE student_id = ? AND course_id = ?
      )
      SELECT DISTINCT 
        g.group_id as scored_group_id,
        ps.score_value,
        ug.group_id as user_group_id
      FROM grading.group g
      CROSS JOIN UserGroup ug
      LEFT JOIN grading.report_peer_scores ps ON 
          ps.scored_group_id = g.group_id AND 
          ps.student_id = ? AND
          ps.course_id = ?
      WHERE g.course_id = ?
        AND g.group_id != ug.group_id
      ORDER BY g.group_id
    `;
    console.log("courseId:", courseId);
    const [rows] = await pool.query(query, [studentId, courseId, studentId, courseId, courseId]);

    const peerScores = rows.map((row) => ({
      scoredGroupId: row.scored_group_id,
      scoreValue: row.score_value || "",
    }));

    const userGroupId = rows.length > 0 ? rows[0].user_group_id : null;

    return NextResponse.json({ peerScores, userGroupId }, { status: 200 });
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
    // Parse cookies and verify token
    const cookies = parse(request.headers.get("cookie") || "");
    const token = cookies.sessionToken;

    if (!token) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

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
    const { peerScores } = await request.json();
    console.log("Peer scores:", peerScores);

    if (!peerScores || peerScores.length === 0) {
      return NextResponse.json(
        { message: "No peer scores provided" },
        { status: 400 }
      );
    }

    const scoreRegex = /^(100|[1-9]?[0-9])$/;

    for (const score of peerScores) {
      if (!scoreRegex.test(score.scoreValue)) {
        return NextResponse.json(
          {
            message: `Invalid score value: ${score.scoreValue}. Must be between 0 and 100.`,
          },
          { status: 400 }
        );
      }
    }

    const query = peerScores
      .map(
        (score) =>
          `UPDATE grading.peer_scores SET score_value = ${score.scoreValue} WHERE course_id = '${score.courseId}' AND scorer_group_id = '${score.scorerGroupId}' AND scored_group_id = '${score.scoredGroupId}' AND student_id = '${studentId}'`
      )
      .join("; ");

    console.log("Executing query:", query);

    const [result] = await pool.query(query);
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
