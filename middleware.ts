import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiter
// For production, swap this with Upstash Redis or Vercel KV
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 10;      // 10 analyze calls per minute per IP

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function middleware(req: NextRequest) {
  // Only rate-limit the expensive API routes
  if (!req.nextUrl.pathname.startsWith("/api/analyze") &&
      !req.nextUrl.pathname.startsWith("/api/generate")) {
    return NextResponse.next();
  }

  const ip = getIp(req);
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return NextResponse.next();
  }

  if (record.count >= MAX_REQUESTS) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute before trying again." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((record.resetAt - now) / 1000)),
        },
      }
    );
  }

  record.count++;
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/analyze", "/api/generate"],
};
