import { ChartPie } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-4 px-4 pt-3">
      <div className="flex items-center gap-2">
        <ChartPie className="size-5 text-muted-foreground" />
        <h1 className="font-heading text-xl font-semibold">Analytics</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>
            Spending insights and trends will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          This screen is on the roadmap for the next stage.
        </CardContent>
      </Card>
    </div>
  );
}