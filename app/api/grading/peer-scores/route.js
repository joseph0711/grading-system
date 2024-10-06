import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

export async function POST(request) {
  try {
    const { peerScores } = await request.json();

    if (!peerScores || peerScores.length === 0) {
      return NextResponse.json(
        { message: "No peer scores provided" },
        { status: 400 }
      );
    }

    const query = `
      INSERT INTO grading.peer_scores (course_id, scorer_group_id, scored_group_id, student_id, score_value)
      VALUES ${peerScores.map(() => "(?, ?, ?, ?, ?)").join(", ")}
    `;

    const values = peerScores.flatMap((score) => [
      score.courseId,
      score.scorerGroupId,
      score.scoredGroupId,
      score.studentId,
      score.scoreValue,
    ]);

    console.log("Executing query:", query);
    console.log("With values:", values);

    const [result] = await pool.query(query, values);

    if (result.affectedRows > 0) {
      return NextResponse.json(
        { message: "Peer scores submitted successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "No peer scores were submitted" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error submitting peer scores:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
