/** NextAuth catch-all segments under /api/auth — must stay on Next.js, not the FastAPI proxy. */
export const NEXTAUTH_API_SEGMENTS = new Set([
  "signin",
  "signout",
  "callback",
  "session",
  "csrf",
  "providers",
  "error",
]);

export function isNextAuthApiRoute(pathname: string): boolean {
  if (!pathname.startsWith("/api/auth")) return false;
  const rest = pathname.slice("/api/auth".length).replace(/^\//, "");
  if (!rest) return true;
  const segment = rest.split("/")[0];
  return NEXTAUTH_API_SEGMENTS.has(segment);
}

export function backendPathFromApiPath(pathname: string): string {
  const stripped = pathname.replace(/^\/api/, "") || "/";
  return stripped.startsWith("/") ? stripped : `/${stripped}`;
}
