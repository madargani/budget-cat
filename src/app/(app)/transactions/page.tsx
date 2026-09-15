import { ListOrdered } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default function TransactionsPage() {
  return (
    <div className="flex flex-col gap-4 px-4 pt-3">
      <div className="flex items-center gap-2">
        <ListOrdered className="size-5 text-muted-foreground" />
        <h1 className="font-heading text-xl font-semibold">Transactions</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>
            Your synced bank transactions will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          This screen is on the roadmap for the next stage.
        </CardContent>
      </Card>
    </div>
  );
}