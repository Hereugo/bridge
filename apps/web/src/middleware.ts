import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

import {
  backendPathFromApiPath,
  isNextAuthApiRoute,
} from "@/lib/api-proxy";

const authMiddleware = withAuth({
  pages: { signIn: "/login" },
});

async function proxyApiRequest(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (isNextAuthApiRoute(pathname)) {
    return NextResponse.next();
  }

  const target = process.env.API_PROXY_TARGET?.replace(/\/$/, "");
  if (!target) {
    return NextResponse.next();
  }

  const backendPath = backendPathFromApiPath(pathname);
  const url = new URL(backendPath, `${target}/`);
  url.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.set("x-forwarded-host", request.headers.get("host") ?? "");
  headers.set(
    "x-forwarded-proto",
    request.nextUrl.protocol.replace(":", "") || "https"
  );

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  const upstream = await fetch(url, init);
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("transfer-encoding");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export default async function middleware(
  request: NextRequest,
  event: Parameters<typeof authMiddleware>[1]
) {
  if (request.nextUrl.pathname.startsWith("/api")) {
    return proxyApiRequest(request);
  }
  return authMiddleware(request, event);
}

export const config = {
  matcher: [
    "/api/:path*",
    "/",
    "/onboarding",
    "/swipe",
    "/know",
    "/matched",
    "/call",
    "/complete",
  ],
};
