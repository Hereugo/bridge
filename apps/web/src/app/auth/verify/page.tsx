import { redirect } from "next/navigation";

/** Back-compat: old magic links used /auth/verify?token=… */
export default async function AuthVerifyRedirect({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (token) {
    redirect(`/login?token=${encodeURIComponent(token)}`);
  }
  redirect("/login");
}
