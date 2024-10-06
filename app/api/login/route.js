import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import bcrypt from "bcrypt";
import { serialize } from "cookie";

export async function POST(request) {
  const { account, password, rememberMe } = await request.json();
  console.log("Login request payload:", { account, password, rememberMe }); // Log the login request

  try {
    // Check if the account exists in the 'user' table
    const [rows] = await pool.query(
      "SELECT * FROM grading.account WHERE account = ?",
      [account]
    );
    console.log("Database query result:", rows); // Log this to check the query result

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Invalid account or password" },
        { status: 401 }
      );
    }

    const user = rows[0];

    // Log the passwords for debugging (avoid logging sensitive data in production)
    console.log("Password from request:", password);
    console.log("Password from database:", user.password);

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
      console.log("Password mismatch"); // Log this to check if the password comparison fails
      return NextResponse.json(
        { message: "Invalid account or password" },
        { status: 401 }
      );
    }

    // At this point, the account and password are valid
    const role = user.role; // Extract the role

    // Generate a session token (use a secure method in production)
    const sessionToken = user.user_id;

    // Set the session token in a cookie
    const cookie = serialize("sessionToken", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 60 * 60, // 30 days for remember me, 1 hour otherwise
      path: "/",
    });

    // Return a successful response with the user's role
    const response = NextResponse.json({
      message: "Login successful",
      role: role, // Include the role in the response
    });

    response.headers.set("Set-Cookie", cookie);

    return response;
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
