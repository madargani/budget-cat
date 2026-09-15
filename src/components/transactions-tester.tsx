"use client";

import { Button } from "~/components/ui/button";
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
    <div className="flex w-full flex-col gap-2">
      <Button
        className="w-full"
        variant="outline"
        onClick={() => syncMutation.mutate()}
        disabled={syncMutation.isPending}
      >
        Sync transactions
      </Button>
      <Button
        className="w-full"
        variant="outline"
        onClick={handleFetch}
        disabled={fetchQuery.isFetching}
      >
        Fetch transactions
      </Button>
    </div>
  );
}