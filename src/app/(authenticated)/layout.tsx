import { AuthenticatedProviders } from "@/features/globals/providers";
import { MainMenu } from "@/features/main-menu/main-menu";
import { AI_NAME } from "@/features/theme/theme-config";
import { cn } from "@/ui/lib";

export const dynamic = "force-dynamic";

export const metadata = {
  title: AI_NAME,
  description: AI_NAME,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthenticatedProviders>
      <div className={cn("flex flex-1 h-full")}>
        <MainMenu />
        <div className="flex-1 flex flex-col">{children}</div>
      </div>
    </AuthenticatedProviders>
  );
}
