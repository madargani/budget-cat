import { redirect } from "next/navigation";

import { BottomNav } from "~/components/layout/bottom-nav";
import { getSession } from "~/server/better-auth/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col pb-20">
        {children}
      </div>
      <BottomNav />
    </>
  );
}