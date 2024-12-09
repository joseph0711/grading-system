import { NextResponse } from "next/server";
import pool from "../../../lib/db";

export async function POST(request) {
  try {
    const data = await request.json();
    console.log("Received data:", data);

    // 驗證所有必要字段
    const requiredFields = [
      "course_id",
      "attendance_criteria",
      "participation_criteria",
      "midterm_criteria",
      "final_criteria",
      "report_criteria",
    ];

    for (const field of requiredFields) {
      if (!(field in data)) {
        return NextResponse.json(
          { error: `缺少必要字段: ${field}` },
          { status: 400 }
        );
      }
    }

    // 驗證權重總和
    const totalWeight = [
      data.attendance_criteria,
      data.participation_criteria,
      data.midterm_criteria,
      data.final_criteria,
      data.report_criteria,
    ].reduce((sum, value) => sum + value, 0);

    if (totalWeight !== 100) {
      return NextResponse.json(
        { error: "所有權重總和必須為 100" },
        { status: 400 }
      );
    }

    // 更新數據庫
    await pool.query(
      `INSERT INTO calculate.grading_criteria 
        (course_id, attendance_criteria, participation_criteria, midterm_criteria, final_criteria, report_criteria)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        attendance_criteria = VALUES(attendance_criteria),
        participation_criteria = VALUES(participation_criteria),
        midterm_criteria = VALUES(midterm_criteria),
        final_criteria = VALUES(final_criteria),
        report_criteria = VALUES(report_criteria)`,
      [
        data.course_id,
        data.attendance_criteria,
        data.participation_criteria,
        data.midterm_criteria,
        data.final_criteria,
        data.report_criteria,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "權重保存成功",
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: `保存配重數據失敗: ${error.message}` },
      { status: 500 }
    );
  }
}
