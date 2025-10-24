import { getAuthenticatedUser } from "@/lib/auth.server";
import { redirect } from "next/navigation";
import "server-only";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/auth/signin?message=You must be logged in to view this page.");
  }

  return <>{children}</>;
}
