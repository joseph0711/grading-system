import { NextResponse } from "next/server";
import { parse } from "cookie";
import jwt from "jsonwebtoken";

export async function GET(request) {
  const cookies = parse(request.headers.get("cookie") || "");
  const token = cookies.sessionToken;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const secretKey = process.env.JWT_SECRET_KEY;
    const decoded = jwt.verify(token, secretKey);

    // Check if token is about to expire (within 5 minutes)
    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (expirationTime - currentTime < fiveMinutes && decoded.rememberMe) {
      // If token is about to expire and rememberMe is true, issue a new token
      const newToken = jwt.sign(
        {
          account: decoded.account,
          role: decoded.role,
          course_id: decoded.course_id,
          rememberMe: true,
        },
        secretKey,
        { expiresIn: "30d" }
      );

      const response = NextResponse.json({
        authenticated: true,
        user: {
          account: decoded.account,
          role: decoded.role,
          course_id: decoded.course_id,
        },
      });

      response.headers.set(
        "Set-Cookie",
        serialize("sessionToken", newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 30 * 24 * 60 * 60, // 30 days
          path: "/",
        })
      );

      return response;
    }

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
}
