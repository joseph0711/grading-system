// lib/session.js
import { IronSession } from 'iron-session';
import { NextRequest, NextResponse } from 'next/server';

const sessionOptions = {
  password: process.env.SESSION_PASSWORD,
  cookieName: 'grading-sys_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60, // 1 hour default
  },
};

// Function to get the session
export async function getSession(req) {
  const response = NextResponse.next();
  const session = await IronSession(req, response, sessionOptions);
  return session;
}

// Function to commit the session (update cookies)
export async function commitSession(session, response) {
  await session.save();
  // Iron-session will automatically set the cookie headers
}

// Function to destroy the session
export async function destroySession(session) {
  await session.destroy();
}