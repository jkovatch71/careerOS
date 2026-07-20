import { BriefcaseBusiness } from "lucide-react";

import { AuthForm } from "./auth-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;

  return (
    <div>
      <div className="mb-10 flex items-center gap-3 lg:hidden">
        <span className="flex size-9 items-center justify-center rounded-lg border bg-card">
          <BriefcaseBusiness className="size-4 text-primary" />
        </span>
        <span className="text-sm font-medium">Career OS</span>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sign in to continue to your career workspace.
      </p>
      {message ? (
        <p className="mt-6 rounded-md border bg-card px-3 py-2 text-sm">{message}</p>
      ) : null}
      <div className="mt-8"><AuthForm /></div>
    </div>
  );
}
