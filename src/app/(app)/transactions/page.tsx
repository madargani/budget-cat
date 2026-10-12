import { redirect } from "next/navigation";

import { TransactionsScreen } from "~/components/transactions/transactions-screen";
import { getSession } from "~/server/better-auth/server";

export default async function TransactionsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <TransactionsScreen
      user={{
        name: session.user.name,
        email: session.user.email,
      }}
    />
  );
}
