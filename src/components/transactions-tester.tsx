"use client";

import { api } from "~/trpc/react";

export function TransactionsTester() {
  const syncMutation = api.transactions.syncTransactions.useMutation({
    onSuccess: (data) => {
      console.log("syncTransactions result:", data);
    },
    onError: (error) => {
      console.error("syncTransactions error:", error);
    },
  });

  const fetchQuery = api.transactions.getTransactions.useQuery({}, {
    enabled: false,
  });

  const handleFetch = async () => {
    try {
      const result = await fetchQuery.refetch();
      console.log("getTransactions result:", result.data);
    } catch (error) {
      console.error("getTransactions error:", error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
        onClick={() => syncMutation.mutate()}
        disabled={syncMutation.isPending}
      >
        Sync transactions
      </button>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
        onClick={handleFetch}
        disabled={fetchQuery.isFetching}
      >
        Fetch transactions
      </button>
    </div>
  );
}