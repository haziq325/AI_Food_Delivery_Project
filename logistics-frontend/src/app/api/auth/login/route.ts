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

    // Universal Demo Login (Bypassing DB for easy access)
    if (email !== 'admin@kinetic.ai' || password !== 'admin') {
      return NextResponse.json({ error: 'Invalid credentials. Try admin@kinetic.ai / admin' }, { status: 401 });
    }

    // Generate JWT
    const token = jwt.sign({ userId: 1, email: email }, JWT_SECRET, { expiresIn: '1h' });

    // Mock successful login
    const response = NextResponse.json({ 
      success: true, 
      message: 'Logged in successfully',
      user: { id: 1, email: email, name: 'Kinetic Admin' }
    });

    response.cookies.set('session_id', token, {
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
