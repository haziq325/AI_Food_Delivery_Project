import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

async function getUserIdFromSession(req: NextRequest) {
  const sessionId = req.cookies.get('session_id')?.value;
  if (!sessionId) return null;

  const res = await query(
    'SELECT user_id FROM UserSessions WHERE session_id = $1 AND expires_at > CURRENT_TIMESTAMP',
    [sessionId]
  );
  return res.rows[0]?.user_id || null;
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromSession(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { restaurant_id, items, total_price } = await req.json();

    if (!restaurant_id || !total_price) {
      return NextResponse.json({ error: 'Missing required order details' }, { status: 400 });
    }

    // Insert order into DB
    const res = await query(
      'INSERT INTO Orders (user_id, restaurant_id, total_price, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, restaurant_id, total_price, 'Pending']
    );

    const order = res.rows[0];

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      order
    });

  } catch (error: any) {
    console.error('Order placement error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromSession(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get orders for the user
    const res = await query(
      'SELECT * FROM Orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    return NextResponse.json({
      success: true,
      orders: res.rows
    });

  } catch (error: any) {
    console.error('Order retrieval error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
