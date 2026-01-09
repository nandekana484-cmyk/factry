import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  // ログインしていない場合は /login にリダイレクト
  if (!token && req.nextUrl.pathname.startsWith("/documents")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}