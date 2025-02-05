import { AuthenticatedProviders } from "@/features/globals/providers";
import { MainMenu } from "@/features/main-menu/main-menu";
import { AI_NAME } from "@/features/theme/theme-config";
import { cn } from "@/ui/lib";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { getCurrentUserGroups } from "@/features/auth-page/helpers";

export const dynamic = "force-dynamic";

export const metadata = {
  title: AI_NAME,
  description: AI_NAME,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Check if user is logged in at all
  const session = await getServerSession();
  if (!session) {
    return redirect("/login");
  }

  // 2. Enforce group membership
  const groups = await getCurrentUserGroups(session.accessToken!);
  const requiredGroup = process.env.NDI_USER_GROUP; // e.g. "11111111-2222-3333-4444-555555555555"
  if (!groups.includes(requiredGroup!)) {
    return redirect("/unauthorized");
  }

  // 3. If user is in the group, render children
  return <>{children}</>;
}