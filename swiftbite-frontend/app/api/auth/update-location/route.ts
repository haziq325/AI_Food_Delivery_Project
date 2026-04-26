import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  const body = await request.json();
  const { user_id, location_node_id } = body;

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  try {
    const backendRes = await fetch(`${API_BASE}/api/users/${user_id}/location/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location_node_id }),
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      const user = data.user;

      const res = NextResponse.json({ success: true, user });

      // Update the client-readable user data cookie
      res.cookies.set("swiftbite_user", JSON.stringify(user), {
        httpOnly: false,
        maxAge: 60 * 60 * 24,
        path: "/",
      });

      return res;
    }

    const errData = await backendRes.json().catch(() => ({}));
    return NextResponse.json(
      { error: errData.error || "Failed to update location." },
      { status: backendRes.status }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Cannot reach server." },
      { status: 503 }
    );
  }
}
