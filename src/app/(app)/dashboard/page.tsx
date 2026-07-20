import type { Metadata } from "next";
import { ArrowUpRight, CalendarClock, Target, Users } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Dashboard" };

const metrics = [
  { label: "Active opportunities", value: "0", icon: Target },
  { label: "Relationships", value: "0", icon: Users },
  { label: "Follow-ups due", value: "0", icon: CalendarClock },
] as const;

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-muted-foreground">Monday briefing</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Good afternoon.</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Your career command center is ready. Company and opportunity tracking arrive in Sprint 2.
          </p>
        </div>
        <div className="rounded-md border bg-card px-3 py-2 text-xs text-muted-foreground">
          July 20, 2026
        </div>
      </div>

      <section aria-label="Career metrics" className="mt-8 grid gap-4 md:grid-cols-3">
        {metrics.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardDescription>{label}</CardDescription>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><p className="text-3xl font-semibold tracking-tight">{value}</p></CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card className="min-h-72">
          <CardHeader>
            <CardTitle className="text-base">Pipeline</CardTitle>
            <CardDescription>Your active opportunities by stage.</CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed text-center">
            <Target className="size-5 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">No opportunities yet</p>
            <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
              Your pipeline will appear here after opportunity management is enabled.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today</CardTitle>
            <CardDescription>Priority actions and follow-ups.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3 rounded-lg border bg-muted/20 p-4">
              <ArrowUpRight className="mt-0.5 size-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Build your pipeline</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Company and opportunity workflows are the next operating layer.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
