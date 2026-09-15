import { redirect } from "next/navigation";

import { HomeScreen } from "~/components/home/home-screen";
import { getSession } from "~/server/better-auth/server";

export default async function HomePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <HomeScreen
      user={{
        name: session.user.name,
        email: session.user.email,
      }}
    />
  );
}