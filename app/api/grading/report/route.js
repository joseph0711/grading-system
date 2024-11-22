import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const course_id = searchParams.get("course_id");

    if (!course_id) {
      return NextResponse.json(
        { message: "Course ID is required" },
        { status: 400 }
      );
    }

    const query = `
      WITH GroupAverages AS (
        SELECT 
          rps.scored_group_id,
          rps.course_id,
          AVG(rps.score_value) as group_average_score
        FROM report_peer_scores rps
        WHERE rps.course_id = ${pool.escape(course_id)}
        GROUP BY rps.scored_group_id, rps.course_id
      )
      SELECT 
        g.group_id,
        CONCAT('Group ', g.group_id) as group_name,
        rts.score as teacher_score,
        ga.group_average_score as group_average_score,
        CASE 
          WHEN rts.score IS NOT NULL AND ga.group_average_score IS NOT NULL 
          THEN (rts.score + ga.group_average_score) / 2 
          ELSE NULL 
        END as total_average_score,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'studentId', s.student_id,
            'studentName', s.name
          )
        ) as students,
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'scoringGroupId', DISTINCT_GROUPS.group_id,
              'groupName', DISTINCT_GROUPS.group_name,
              'scores', DISTINCT_GROUPS.scores
            )
          )
          FROM (
            SELECT DISTINCT
              scoring_group.group_id,
              CONCAT('Group ', scoring_group.group_id) as group_name,
              (
                SELECT JSON_ARRAYAGG(
                  JSON_OBJECT(
                    'studentId', rps.student_id,
                    'studentName', scorer.name,
                    'score', rps.score_value
                  )
                )
                FROM report_peer_scores rps
                JOIN student scorer ON rps.student_id = scorer.student_id
                JOIN \`group\` scorer_group ON scorer.student_id = scorer_group.student_id
                  AND scorer_group.course_id = g.course_id
                WHERE rps.scored_group_id = g.group_id
                  AND rps.course_id = g.course_id
                  AND scorer_group.group_id = scoring_group.group_id
              ) as scores
            FROM \`group\` scoring_group
            WHERE scoring_group.course_id = g.course_id
              AND scoring_group.group_id != g.group_id
          ) AS DISTINCT_GROUPS
        ) as scores_by_group
      FROM \`group\` g
      JOIN student s ON g.student_id = s.student_id
      JOIN student_enrolled_info sei ON s.student_id = sei.student_id 
        AND sei.course_id = g.course_id
      LEFT JOIN report_teacher_scores rts ON g.group_id = rts.group_id 
        AND g.course_id = rts.course_id
      LEFT JOIN GroupAverages ga ON g.group_id = ga.scored_group_id
      WHERE g.course_id = ${pool.escape(course_id)}
      GROUP BY g.group_id, rts.score, ga.group_average_score`;

    console.log(query);
    const [rows] = await pool.query(query);

    const formattedGroups = rows.map((row) => ({
      groupId: row.group_id.toString(),
      groupName: row.group_name,
      teacherScore: row.teacher_score,
      groupAverageScore: parseFloat(row.group_average_score) || null,
      totalAverageScore: row.total_average_score,
      students: row.students || [],
      scoresByGroup: row.scores_by_group || [],
    }));

    console.log(formattedGroups);

    return NextResponse.json({ groups: formattedGroups }, { status: 200 });
  } catch (error) {
    console.error("Error in API:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const course_id = searchParams.get("course_id");

    const { groups } = await request.json();
    const teacher_id = "T001";

    const query = `
      INSERT INTO grading.report_teacher_scores 
        (teacher_id, course_id, group_id, score) 
      VALUES 
        ${groups.map(() => "(?, ?, ?, ?)").join(", ")}
      ON DUPLICATE KEY UPDATE
        score = VALUES(score)`;

    const values = groups.flatMap((group) => [
      teacher_id,
      course_id,
      group.groupId,
      group.teacherScore,
    ]);

    await pool.query(query, values);

    return NextResponse.json(
      { message: "Teacher scores updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating teacher scores:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
