import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasskeyManager } from "@/features/auth/passkey-manager";
import { PasswordChangeForm } from "@/features/auth/password-change-form";

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

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Password access</CardTitle>
          <CardDescription>
            Change the password used as a fallback when a passkey is unavailable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordChangeForm />
        </CardContent>
      </Card>

      <div className="mt-4 flex items-start gap-3 rounded-lg border bg-muted/15 p-4">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" />
        <div>
          <p className="text-sm font-medium">Your current recovery path</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            If you forget your password, sign in with your passkey and set a new one above.
            Email-based password reset is intentionally deferred until Career OS has production
            email delivery. Passkeys registered here are tied to career-os-lac.vercel.app.
          </p>
        </div>
      </div>
    </div>
  );
}
