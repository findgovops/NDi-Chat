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
  // 1. Retrieve the server-side session
  const session = await getServerSession();
  if (!session) {
    return redirect("/login"); 
  }

  // 2. Fetch group membership for the authenticated user
  const groups = await getCurrentUserGroups(session.accessToken!);
  const requiredGroup = `${process.env.NDI_USER_GROUP}`;
  if (!groups.includes(requiredGroup)) {
    return redirect("/unauthorized");
  }

  // 3. If user is authorized, render children
  return (
    <AuthenticatedProviders>
      <div className={cn("flex flex-1 items-stretch")}>
        <MainMenu />
        <div className="flex-1 flex">{children}</div>
      </div>
    </AuthenticatedProviders>
  );
}
