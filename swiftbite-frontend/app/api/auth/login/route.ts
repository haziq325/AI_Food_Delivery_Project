import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  // Try to authenticate against the Django backend
  try {
    const backendRes = await fetch(`${API_BASE}/api/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
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

    // Backend returned an error (wrong credentials)
    const errData = await backendRes.json().catch(() => ({}));
    return NextResponse.json(
      { error: errData.error || "Invalid credentials." },
      { status: 401 }
    );
  } catch {
    // Backend unreachable — reject login so user knows something is wrong
    return NextResponse.json(
      { error: "Cannot reach server. Make sure Django is running on port 8000." },
      { status: 503 }
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("swiftbite_token", "", { maxAge: 0, path: "/" });
  res.cookies.set("swiftbite_user", "", { maxAge: 0, path: "/" });
  return res;
}
