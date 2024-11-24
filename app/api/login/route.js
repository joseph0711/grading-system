import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

export async function POST(request) {
  const { account, password, rememberMe } = await request.json();

  try {
    // Check if account is locked
    const [lockStatus] = await pool.query(
      `SELECT attempts, last_attempt, is_locked 
       FROM user.login_attempts 
       WHERE account = ?`,
      [account]
    );

    const now = new Date();
    if (lockStatus.length > 0) {
      const lastAttempt = new Date(lockStatus[0].last_attempt);
      const timeDiff = (now - lastAttempt) / 1000 / 60; // difference in minutes

      if (lockStatus[0].is_locked && timeDiff < 10) {
        return NextResponse.json(
          {
            message: "Account is locked. Please try again later.",
            remainingTime: Math.ceil(10 - timeDiff),
          },
          { status: 423 }
        );
      }

      // If 10 minutes have passed, reset the lock
      if (timeDiff >= 10) {
        await pool.query(
          `UPDATE user.login_attempts 
           SET attempts = 0, is_locked = FALSE 
           WHERE account = ?`,
          [account]
        );
      }
    }

    // Check if the account exists in the 'user' table
    const [rows] = await pool.query(
      `SELECT a.account, a.password, a.role 
       FROM user.account a 
       WHERE a.account = ?`,
      [account]
    );

    // Handle failed login
    const handleFailedLogin = async () => {
      // First, update the attempts
      await pool.query(
        `INSERT INTO user.login_attempts (account, attempts, last_attempt) 
         VALUES (?, 1, CURRENT_TIMESTAMP)
         ON DUPLICATE KEY UPDATE 
         attempts = attempts + 1,
         last_attempt = CURRENT_TIMESTAMP,
         is_locked = IF(attempts + 1 >= 5, TRUE, FALSE)`,
        [account]
      );

      // Then, get the current attempts count
      const [attemptsResult] = await pool.query(
        `SELECT attempts FROM user.login_attempts WHERE account = ?`,
        [account]
      );

      const currentAttempts = attemptsResult[0]?.attempts || 1;
      const attemptsLeft = 5 - currentAttempts;

      return NextResponse.json(
        {
          message: "Invalid account or password",
          attemptsLeft: Math.max(0, attemptsLeft),
          isLocked: currentAttempts >= 5,
        },
        { status: 401 }
      );
    };

    if (rows.length === 0) {
      return handleFailedLogin();
    }

    const user = rows[0];

    if (!password || !user.password) {
      console.error("Password or hashed password is missing");
      return handleFailedLogin();
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return handleFailedLogin();
    }

    // Reset login attempts on successful login
    await pool.query(
      `INSERT INTO user.login_attempts (account, attempts, last_attempt, is_locked) 
       VALUES (?, 0, CURRENT_TIMESTAMP, FALSE)
       ON DUPLICATE KEY UPDATE 
       attempts = 0,
       is_locked = FALSE`,
      [account]
    );

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
