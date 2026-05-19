import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: [
    "/",
    "/onboarding",
    "/swipe",
    "/know",
    "/matched",
    "/call",
    "/complete",
  ],
};
