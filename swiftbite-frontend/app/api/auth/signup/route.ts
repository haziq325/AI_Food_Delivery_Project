import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password, location_node_id } = body;

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  // Try to create a user against the Django backend
  try {
    const backendRes = await fetch(`${API_BASE}/api/auth/signup/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, location_node_id }),
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      const user = data.user;

      const res = NextResponse.json({ success: true, user });

      // httpOnly auth token (security)
      res.cookies.set("swiftbite_token", `user_${user.user_id}`, {
        httpOnly: true,
        maxAge: 60 * 60 * 24,
        path: "/",
      });

      // Client-readable user data (not sensitive — just IDs and display info)
      res.cookies.set("swiftbite_user", JSON.stringify(user), {
        httpOnly: false,
        maxAge: 60 * 60 * 24,
        path: "/",
      });

      return res;
    }

    // Backend returned an error
    const errData = await backendRes.json().catch(() => ({}));
    return NextResponse.json(
      { error: errData.error || "Signup failed." },
      { status: backendRes.status }
    );
  } catch {
    // Backend unreachable
    return NextResponse.json(
      { error: "Cannot reach server. Make sure Django is running on port 8000." },
      { status: 503 }
    );
  }
}
