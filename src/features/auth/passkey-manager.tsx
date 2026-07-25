"use client";

import { useCallback, useEffect, useState } from "react";
import { KeyRound, LoaderCircle, ShieldCheck, Trash2 } from "lucide-react";
import type { PasskeyListItem } from "@supabase/auth-js";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function PasskeyManager() {
  const [passkeys, setPasskeys] = useState<PasskeyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();

  const loadPasskeys = useCallback(async () => {
    const supabase = createClient();
    const { data, error: loadError } = await supabase.auth.passkey.list();

    if (loadError) {
      setError("Career OS could not load your passkeys.");
    } else {
      setPasskeys(data);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    void supabase.auth.passkey.list().then(({ data, error: loadError }) => {
      if (!active) return;

      if (loadError) {
        setError("Career OS could not load your passkeys.");
      } else {
        setPasskeys(data);
      }

      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  async function registerPasskey() {
    if (!window.PublicKeyCredential) {
      setError("This browser or device does not support passkeys.");
      return;
    }

    setError(undefined);
    setMessage(undefined);
    setWorking(true);

    const supabase = createClient();
    const { error: registrationError } = await supabase.auth.registerPasskey();

    if (registrationError) {
      setError(
        registrationError.name === "NotAllowedError"
          ? "Passkey registration was cancelled or timed out."
          : "Career OS could not register this passkey.",
      );
      setWorking(false);
      return;
    }

    setMessage("Passkey registered. You can now use it from the login page.");
    await loadPasskeys();
    setWorking(false);
  }

  async function deletePasskey(passkey: PasskeyListItem) {
    const label = passkey.friendly_name ?? "this passkey";
    if (!window.confirm(`Remove ${label}? You will no longer be able to sign in with it.`)) {
      return;
    }

    setError(undefined);
    setMessage(undefined);
    setWorking(true);

    const supabase = createClient();
    const { error: deleteError } = await supabase.auth.passkey.delete({
      passkeyId: passkey.id,
    });

    if (deleteError) {
      setError("Career OS could not remove that passkey.");
    } else {
      setMessage("Passkey removed.");
      await loadPasskeys();
    }

    setWorking(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium">Your passkeys</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Use your fingerprint, face, device PIN, or password manager without entering a password.
          </p>
        </div>
        <Button onClick={registerPasskey} disabled={loading || working}>
          {working ? <LoaderCircle className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
          Register a passkey
        </Button>
      </div>

      {message ? (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-emerald-400">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" />
          {message}
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="flex min-h-28 items-center justify-center rounded-lg border border-dashed">
          <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : passkeys.length ? (
        <div className="divide-y rounded-lg border">
          {passkeys.map((passkey) => (
            <div key={passkey.id} className="flex items-center gap-4 p-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <KeyRound className="size-4 text-primary" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {passkey.friendly_name ?? "Passkey"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Added {new Date(passkey.created_at).toLocaleDateString()}
                  {passkey.last_used_at
                    ? ` · Last used ${new Date(passkey.last_used_at).toLocaleDateString()}`
                    : ""}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove ${passkey.friendly_name ?? "passkey"}`}
                disabled={working}
                onClick={() => deletePasskey(passkey)}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex min-h-28 flex-col items-center justify-center rounded-lg border border-dashed text-center">
          <KeyRound className="size-5 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">No passkeys registered</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Password sign-in remains available until you add one.
          </p>
        </div>
      )}
    </div>
  );
}
