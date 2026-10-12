import { ChartPie } from "lucide-react";
import { redirect } from "next/navigation";

import { PageHeader } from "~/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { getSession } from "~/server/better-auth/server";

export default async function AnalyticsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-4 pb-6">
      <PageHeader
        icon={ChartPie}
        title="Analytics"
        user={{
          name: session.user.name,
          email: session.user.email,
        }}
      />
      <Card className="mx-4">
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
