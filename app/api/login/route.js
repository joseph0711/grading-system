import { NextResponse } from 'next/server';
import pool from '../../../lib/db';
import bcrypt from 'bcrypt';
import { serialize } from 'cookie';

export async function POST(request) { 
  const { account, password, rememberMe } = await request.json();
  console.log('Login request payload:', { account, password, rememberMe }); // Log the login request

  try {
    const [rows] = await pool.query('SELECT * FROM grading.account WHERE account = ?', [account]);
    console.log('Database query result:', rows); // Add this log to check the query result


    if (rows.length === 0) {
      return NextResponse.json({ message: 'Invalid Account or password' }, { status: 401 });
    }

    const user = rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('Password mismatch'); // Log this to check if the password comparison fails
      return NextResponse.json({ message: 'Invalid ID or password' }, { status: 401 });
    }

    // Generate a session token (for example purposes, we'll just use the user ID, but it should be something more secure in production)
    const sessionToken = user.account;

    // Set the session token in a cookie
    const cookie = serialize('sessionToken', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 60 * 60, // 30 days for remember me, 1 hour otherwise
      path: '/',
    });

    const response = NextResponse.json({ message: 'Login successful' });
    response.headers.set('Set-Cookie', cookie);

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}