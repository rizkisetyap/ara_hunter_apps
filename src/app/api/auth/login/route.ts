import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body as { username: string; password: string };
    const expectedUsername = process.env.ADMIN_USERNAME;
    const expectedPassword = process.env.ADMIN_PASSWORD;

    if (!expectedUsername || !expectedPassword) {
      console.error("Missing admin credentials in environment variables");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    if (username === expectedUsername && password === expectedPassword) {
      // Create a simple token based on timestamp + username for demo purposes
      const token = Buffer.from(`${username}:${Date.now()}`).toString("base64");

      const isHttps =
        request.headers.get("x-forwarded-proto") === "https" ||
        request.url.startsWith("https://");

      // Set token in cookies for middleware auth check
      const response = NextResponse.json({ token });
      response.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: isHttps,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 24 hours
      });

      return response;
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
  }
}

export async function DELETE(_request: Request) {
  const response = NextResponse.json({ message: "Logged out" });
  response.cookies.set("auth_token", "", { path: "/", maxAge: 0 });
  return response;
}