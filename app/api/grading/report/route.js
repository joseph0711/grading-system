// /api/grading/report/index.js

import { NextResponse } from "next/server";
import pool from "../../../../lib/db"; // Ensure this path is correct based on your project structure

// GET Handler
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const course_id = searchParams.get("course_id") || "3137";

    const query = `
      SELECT 
        sg.group_id,
        sg.group_name,
        u.user_id AS student_id,
        u.name AS student_name,
        s.report_score AS student_score,
        gts.score_value AS teacher_score
      FROM 
        grading.student_group sg
      LEFT JOIN 
        grading.group_members gm ON sg.group_id = gm.group_id
      LEFT JOIN 
        grading.user u ON gm.student_id = u.user_id
      LEFT JOIN 
        grading.score s ON sg.course_id = s.course_id AND gm.student_id = s.student_id
      LEFT JOIN 
        grading.group_teacher_scores gts ON sg.group_id = gts.group_id AND sg.course_id = gts.course_id
      WHERE 
        sg.course_id = ?
      ORDER BY 
        sg.group_id;
    `;

    const [rows] = await pool.query(query, [course_id]);

    // Transform the rows into a structured format
    const groupsMap = {};

    rows.forEach((row) => {
      const groupId = row.group_id;
      if (!groupsMap[groupId]) {
        groupsMap[groupId] = {
          groupId: groupId,
          groupName: row.group_name,
          teacherScore:
            row.teacher_score !== null ? Number(row.teacher_score) : null,
          students: [],
          groupAverageScore: 0, // To be computed
          totalAverageScore: null, // To be computed
          peerScoresGiven: [], // To be added
          peerScoresReceived: [], // To be added
        };
      }

      // Add student details
      if (row.student_id) {
        groupsMap[groupId].students.push({
          studentId: row.student_id,
          studentName: row.student_name,
          studentScore:
            row.student_score !== null ? Number(row.student_score) : null,
        });
      }
    });

    const groupsWithScores = Object.values(groupsMap);

    // Compute groupAverageScore for each group
    groupsWithScores.forEach((group) => {
      const totalScore = group.students.reduce(
        (sum, student) => sum + (student.studentScore || 0),
        0
      );
      const count = group.students.length;
      group.groupAverageScore =
        count > 0 ? parseFloat((totalScore / count).toFixed(2)) : null;
    });

    // Compute totalAverageScore for each group (average of other groups' groupAverageScore)
    groupsWithScores.forEach((currentGroup) => {
      const otherGroups = groupsWithScores.filter(
        (group) =>
          group.groupId !== currentGroup.groupId &&
          group.groupAverageScore !== null
      );
      const totalOtherScores = otherGroups.reduce(
        (sum, group) => sum + group.groupAverageScore,
        0
      );
      const countOtherGroups = otherGroups.length;
      currentGroup.totalAverageScore =
        countOtherGroups > 0
          ? parseFloat((totalOtherScores / countOtherGroups).toFixed(2))
          : null;
    });

    // Fetch peer scores given by each group
    const peerScoresGivenQuery = `
      SELECT 
          course_id,
          scorer_group_id,
          scored_group_id,
          student_id,
          score_value
      FROM 
          peer_scores
      WHERE 
          course_id = ?
    `;

    const [peerGivenRows] = await pool.query(peerScoresGivenQuery, [course_id]);

    // Assign peerScoresGiven to groups
    peerGivenRows.forEach((score) => {
      const group = groupsMap[score.scorer_group_id];
      if (group) {
        group.peerScoresGiven.push({
          scoredGroupId: score.scored_group_id,
          studentId: score.student_id,
          scoreValue: score.score_value,
        });
      }
    });

    const [peerReceivedRows] = await pool.query(peerScoresGivenQuery, [
      course_id,
    ]);

    peerReceivedRows.forEach((score) => {
      const group = groupsMap[score.scored_group_id];
      if (group) {
        group.peerScoresReceived.push({
          scorerGroupId: score.scorer_group_id,
          studentId: score.student_id,
          scoreValue: score.score_value,
        });
      }
    });
    return NextResponse.json({ groups: groupsWithScores }, { status: 200 });
  } catch (error) {
    console.error("Error fetching group data:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// POST Handler remains unchanged for teacher scores
export async function POST(request) {
  try {
    const { groups } = await request.json();

    if (!groups || groups.length === 0) {
      return NextResponse.json(
        { message: "No group scores provided" },
        { status: 400 }
      );
    }

    const course_id = "3137"; // Adjust as needed or extract from request
    const teacher_id = "T10823001"; // Replace with actual teacher ID from authentication

    // Prepare the query to update the teacher scores
    const query = `
      INSERT INTO group_teacher_scores (group_id, teacher_id, course_id, score_value)
      VALUES ${groups.map(() => "(?, ?, ?, ?)").join(", ")}
      ON DUPLICATE KEY UPDATE
        score_value = VALUES(score_value);
    `;

    const values = groups.flatMap((group) => [
      group.groupId,
      teacher_id,
      course_id,
      group.teacherScore,
    ]);

    console.log("Executing query:", query);
    console.log("With values:", values);

    const [result] = await pool.query(query, values);

    if (result.affectedRows > 0) {
      return NextResponse.json(
        { message: "Teacher scores updated successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "No teacher scores were updated" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error updating teacher scores:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
