import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Send } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { outreachOutcomeLabel } from "@/features/outreach/constants";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Outreach" };
export default async function OutreachPage() {
  const supabase = await createClient();
  const { data: entries, error } = await supabase.from("outreach").select("*, opportunity:opportunities(id, role_title), contact:contacts(id, name)").order("sent_at", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false });
  return <div className="mx-auto max-w-7xl">
    <div className="flex items-end justify-between gap-4"><div><p className="text-sm text-muted-foreground">Relationship activity</p><h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Outreach</h1><p className="mt-2 text-sm text-muted-foreground">Track messages, conversations, responses, and outcomes.</p></div><Link href="/outreach/new" className={cn(buttonVariants())}><Plus className="size-4" /> Log outreach</Link></div>
    {error ? <Card className="mt-8 border-destructive/40"><CardContent className="p-6 text-sm text-destructive">Career OS could not load outreach.</CardContent></Card> : entries.length === 0 ? <Card className="mt-8"><CardContent className="flex min-h-72 flex-col items-center justify-center text-center"><span className="flex size-11 items-center justify-center rounded-lg border bg-muted/30"><Send className="size-5 text-muted-foreground" /></span><h2 className="mt-4 text-sm font-medium">No outreach yet</h2><p className="mt-2 max-w-sm text-xs leading-5 text-muted-foreground">Log your first email, LinkedIn message, call, or conversation.</p><Link href="/outreach/new" className={cn(buttonVariants({ size: "sm" }), "mt-5")}><Plus className="size-4" /> Log outreach</Link></CardContent></Card> : <div className="mt-8 overflow-hidden rounded-xl border"><div className="hidden grid-cols-[120px_1fr_1fr_120px_130px] gap-4 border-b bg-card/70 px-5 py-3 text-xs font-medium text-muted-foreground md:grid"><span>Channel</span><span>Contact</span><span>Opportunity</span><span>Outcome</span><span>Sent</span></div><div className="divide-y">{entries.map((entry) => <Link key={entry.id} href={`/outreach/${entry.id}/edit`} className="grid gap-3 bg-background px-5 py-4 transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring md:grid-cols-[120px_1fr_1fr_120px_130px] md:items-center md:gap-4"><span className="text-sm">{entry.channel ?? "Other"}</span><span className="truncate text-sm text-muted-foreground">{entry.contact?.name ?? "—"}</span><span className="truncate text-sm text-muted-foreground">{entry.opportunity?.role_title ?? "—"}</span><span className="w-fit rounded-full border bg-muted/30 px-2 py-1 text-xs">{outreachOutcomeLabel(entry.outcome)}</span><span className="text-sm text-muted-foreground">{entry.sent_at ? new Date(entry.sent_at).toLocaleDateString("en-US") : "—"}</span></Link>)}</div></div>}
  </div>;
}
