import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value?.toLowerCase();
  const path = req.nextUrl.pathname;

  // 公開ページ（ログイン前でもアクセス可能）
  const publicPaths = ["/login", "/api/login"];

  const isPublic = publicPaths.some((p) => path.startsWith(p));

  // /admin配下はadminまたはapproverのみ許可
  if (path.startsWith("/admin") && role !== "admin" && role !== "approver") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 未ログインで保護ページに来たら /login へ
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};