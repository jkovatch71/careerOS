import { BriefcaseBusiness, LogOut } from "lucide-react";
import { redirect } from "next/navigation";

import { AppNav } from "@/components/app-nav";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) redirect("/login");

  const email = typeof data.claims.email === "string" ? data.claims.email : "Account";

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-card/40 lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-3 border-b px-6">
          <span className="flex size-8 items-center justify-center rounded-lg border bg-background">
            <BriefcaseBusiness className="size-4 text-primary" />
          </span>
          <span className="text-sm font-semibold tracking-tight">Career OS</span>
        </div>
        <div className="flex-1 py-4"><AppNav /></div>
        <div className="border-t p-4">
          <p className="truncate px-2 text-xs text-muted-foreground">{email}</p>
          <form action={signOut} className="mt-2">
            <Button type="submit" variant="ghost" size="sm" className="w-full justify-start">
              <LogOut className="size-4" /> Sign out
            </Button>
          </form>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/85 px-5 backdrop-blur md:px-8">
          <div className="flex items-center gap-3 lg:hidden">
            <BriefcaseBusiness className="size-4 text-primary" />
            <span className="text-sm font-semibold">Career OS</span>
          </div>
          <p className="hidden text-sm text-muted-foreground lg:block">Executive career workspace</p>
          <div className="size-8 rounded-full border bg-muted" aria-label={email} title={email} />
        </header>
        <main className="px-5 py-8 md:px-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
