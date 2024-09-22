// app/api/session/route.js
import { NextResponse } from 'next/server';
import { parse } from 'cookie';

export async function GET(request) {
  const cookies = parse(request.headers.get('cookie') || '');
  const sessionToken = cookies.sessionToken;

  if (sessionToken) {
    // Validate session token if necessary
    return NextResponse.json({ authenticated: true, userId: sessionToken });
  } else {
    return NextResponse.json({ authenticated: false });
  }
}