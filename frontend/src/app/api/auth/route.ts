import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  const { password } = await req.json();
  const correct = process.env.DEMO_PASSWORD;

  if (!correct) {
    return NextResponse.json({ error: "DEMO_PASSWORD not set" }, { status: 500 });
  }

  if (password !== correct) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("demo_auth", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return res;
}
