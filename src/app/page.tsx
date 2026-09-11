import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PlaidLink } from "~/components/plaid-link";

import { auth } from "~/server/better-auth";
import { getSession } from "~/server/better-auth/server";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Create <span className="text-[hsl(280,100%,70%)]">T3</span> App
          </h1>
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-center text-2xl text-white">
                {session && <span>Logged in as {session.user?.name}</span>}
              </p>
              {!session ? (
                <Link
                  href={"/login"}
                  className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
                >
                  Sign in
                </Link>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <PlaidLink />
                  <form>
                    <button
                      className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
                      formAction={async () => {
                        "use server";
                        await auth.api.signOut({
                          headers: await headers(),
                        });
                        redirect("/");
                      }}
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
