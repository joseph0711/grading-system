import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { parse } from "cookie";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const { courseId } = await request.json();
    const cookieStore = cookies();
    const sessionToken = cookieStore.get("sessionToken");

    if (!sessionToken) {
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }

    // Decode existing token
    const secretKey = process.env.JWT_SECRET_KEY;
    const decoded = jwt.verify(sessionToken.value, secretKey);

    // Remove exp from decoded token before creating new one
    const { exp, ...decodedWithoutExp } = decoded;

    // Create new token with course_id
    const newToken = jwt.sign(
      {
        ...decodedWithoutExp,
        course_id: courseId,
      },
      secretKey,
      { expiresIn: "24h" }
    );

    // Set the new token in cookies
    cookieStore.set("sessionToken", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error setting course:", error);
    return NextResponse.json(
      { error: "Failed to set course" },
      { status: 500 }
    );
  }
}
