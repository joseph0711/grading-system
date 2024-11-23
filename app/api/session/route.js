import { NextResponse } from "next/server";
import { parse } from "cookie";
import jwt from "jsonwebtoken";

export async function GET(request) {
  const cookies = parse(request.headers.get("cookie") || "");
  const token = cookies.sessionToken;

  if (token) {
    try {
      const secretKey = process.env.JWT_SECRET_KEY;
      const decoded = jwt.verify(token, secretKey);

      return NextResponse.json({
        authenticated: true,
        user: {
          account: decoded.account,
          role: decoded.role,
          course_id: decoded.course_id,
        },
      });
    } catch (error) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
  } else {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
