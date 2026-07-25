import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasskeyManager } from "@/features/auth/passkey-manager";

export const metadata: Metadata = { title: "Security" };

export default function SecurityPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div>
        <p className="text-sm text-muted-foreground">Account settings</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Security</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Manage secure, passwordless access to your Career OS workspace.
        </p>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base">Passkey access</CardTitle>
          <CardDescription>
            Passkeys are phishing-resistant credentials protected by your device or password manager.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasskeyManager />
        </CardContent>
      </Card>

      <div className="mt-4 flex items-start gap-3 rounded-lg border bg-muted/15 p-4">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" />
        <div>
          <p className="text-sm font-medium">Keep password access available</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Supabase passkeys are currently experimental. Your existing email and password remain
            the recovery path, and passkeys registered here are tied to career-os-lac.vercel.app.
          </p>
        </div>
      </div>
    </div>
  );
}
