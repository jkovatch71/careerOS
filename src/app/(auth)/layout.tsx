import { BriefcaseBusiness } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </section>
      <aside className="relative hidden overflow-hidden border-l bg-card lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_38%)]" />
        <div className="relative flex items-center gap-3 text-sm font-medium">
          <span className="flex size-9 items-center justify-center rounded-lg border bg-background">
            <BriefcaseBusiness className="size-4 text-primary" />
          </span>
          Career OS
        </div>
        <div className="relative max-w-lg">
          <p className="text-3xl font-medium leading-tight tracking-tight">
            Run your career search with the discipline of an executive operating system.
          </p>
          <p className="mt-5 text-sm leading-6 text-muted-foreground">
            Opportunities, relationships, outreach, and decisions—organized in one focused workspace.
          </p>
        </div>
      </aside>
    </main>
  );
}
