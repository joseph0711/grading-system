import { NextResponse } from 'next/server';
import pool from '../../../lib/db';
import { parse } from 'cookie';

export async function GET(request) {
  const cookies = parse(request.headers.get('cookie') || '');
  const sessionToken = cookies.sessionToken;

  if (!sessionToken) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM user WHERE id = ?', [sessionToken]);

    if (rows.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const user = rows[0];
    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}