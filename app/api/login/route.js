import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

export async function POST(request) {
  const { account, password, rememberMe } = await request.json();

  try {
    // Check if the account exists in the 'user' table
    const [rows] = await pool.query(
      `SELECT a.account, a.password, u.role 
       FROM grading.account a 
       JOIN grading.user u ON a.account = u.user_id 
       WHERE a.account = ?`,
      [account]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Invalid account or password" },
        { status: 401 }
      );
    }

    const user = rows[0];

    // Ensure both passwords are present
    if (!password || !user.password) {
      console.error("Password or hashed password is missing");
      return NextResponse.json(
        { message: "Invalid account or password" },
        { status: 401 }
      );
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid account or password" },
        { status: 401 }
      );
    }

    // At this point, the account and password are valid
    const role = user.role; // Extract the role

    // Create a JWT payload
    const payload = {
      account: user.account,
      role: user.role,
    };

    // Sign the JWT
    const secretKey = process.env.JWT_SECRET_KEY;
    const expiresIn = rememberMe ? "30d" : "1h"; // Token expiration

    const token = jwt.sign(payload, secretKey, { expiresIn });

    // Set the session token in a cookie
    const cookie = serialize("sessionToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 60 * 60, // 30 days for remember me, 1 hour otherwise
      path: "/",
    });

    // Return a successful response with the user's role
    const response = NextResponse.json({
      message: "Login successful",
      role: role,
    });
    response.headers.set("Set-Cookie", cookie);

    return response;
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
