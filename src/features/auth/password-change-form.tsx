"use client";

import { type FormEvent, useState } from "react";
import { CheckCircle2, Eye, EyeOff, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const MIN_PASSWORD_LENGTH = 8;

export function PasswordChangeForm() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(undefined);
    setError(undefined);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Use at least ${MIN_PASSWORD_LENGTH} characters for your new password.`);
      return;
    }

    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }

    setWorking(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError("Career OS could not update your password. Please try again.");
    } else {
      setPassword("");
      setConfirmation("");
      setMessage("Password updated. You can use it the next time you sign in.");
    }

    setWorking(false);
  }

  return (
    <form className="space-y-5" onSubmit={updatePassword}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="new-password" className="text-sm font-medium">
            New password
          </label>
          <div className="relative">
            <Input
              id="new-password"
              className="pr-10"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              required
              disabled={working}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
              aria-label={showPassword ? "Hide new password" : "Show new password"}
              aria-pressed={showPassword}
              disabled={working}
              onClick={() => setShowPassword((visible) => !visible)}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="confirm-new-password" className="text-sm font-medium">
            Confirm new password
          </label>
          <div className="relative">
            <Input
              id="confirm-new-password"
              className="pr-10"
              type={showConfirmation ? "text" : "password"}
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              required
              disabled={working}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
              aria-label={showConfirmation ? "Hide password confirmation" : "Show password confirmation"}
              aria-pressed={showConfirmation}
              disabled={working}
              onClick={() => setShowConfirmation((visible) => !visible)}
            >
              {showConfirmation ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          Use at least {MIN_PASSWORD_LENGTH} characters.
        </p>
        <Button type="submit" disabled={working}>
          {working ? <LoaderCircle className="size-4 animate-spin" /> : null}
          Update password
        </Button>
      </div>

      {message ? (
        <div
          role="status"
          className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-emerald-400"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          {message}
        </div>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}
    </form>
  );
}
