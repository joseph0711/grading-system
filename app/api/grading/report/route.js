import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const course_id = searchParams.get("courseId");
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
    const course_id = searchParams.get("courseId");
    const teacher_id = searchParams.get("teacherId");
    const { groups } = await request.json();

    if (!teacher_id || !course_id) {
      return NextResponse.json(
        { message: "Teacher ID and Course ID are required" },
        { status: 400 }
      );
    }

    // Validate scores
    for (const group of groups) {
      if (
        group.teacherScore !== null &&
        (isNaN(group.teacherScore) ||
          group.teacherScore < 0 ||
          group.teacherScore > 100)
      ) {
        return NextResponse.json(
          {
            message: `Invalid score for group ${group.groupId}. Score must be a number between 0 and 100.`,
          },
          { status: 400 }
        );
      }
    }

    // Handle single score update (auto-save) or multiple scores (submit)
    const insertValues = groups
      .filter((group) => group.teacherScore !== null)
      .map((group) => [
        teacher_id,
        course_id,
        group.groupId,
        group.teacherScore,
      ]);

    if (insertValues.length > 0) {
      // Delete existing scores for these groups
      const groupIds = groups.map((g) => g.groupId);
      const deleteQuery = `
        DELETE FROM grading.report_teacher_scores
        WHERE teacher_id = ?
        AND course_id = ?
        AND group_id IN (?)`;

      await pool.query(deleteQuery, [teacher_id, course_id, groupIds]);

      // Insert new scores
      const insertQuery = `
        INSERT INTO grading.report_teacher_scores 
        (teacher_id, course_id, group_id, score)
        VALUES ?`;

      await pool.query(insertQuery, [insertValues]);
    }

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
