import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Find user in DB
    const res = await query('SELECT * FROM Users WHERE email = $1', [email]);
    const user = res.rows[0];

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    // Create session in UserSessions
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now
    const sessionRes = await query(
      'INSERT INTO UserSessions (user_id, expires_at, data) VALUES ($1, $2, $3) RETURNING session_id',
      [user.id, expiresAt, JSON.stringify({ token })]
    );

    const sessionId = sessionRes.rows[0].session_id;

    // Set cookie or return session info
    const response = NextResponse.json({ 
      success: true, 
      message: 'Logged in successfully',
      user: { id: user.id, email: user.email, name: user.name }
    });

    response.cookies.set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600, // 1 hour
      path: '/',
    });

    return response;

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
