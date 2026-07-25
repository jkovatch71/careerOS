"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ArrowRight, KeyRound, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { signIn, signUp, type AuthState } from "./actions";

const initialState: AuthState = {};
const rememberedEmailKey = "career-os:remembered-email";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [passkeyError, setPasskeyError] = useState<string>();
  const [passkeyPending, setPasskeyPending] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const rememberEmailRef = useRef<HTMLInputElement>(null);
  const action = mode === "sign-in" ? signIn : signUp;
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    const rememberedEmail = window.localStorage.getItem(rememberedEmailKey);

    if (!rememberedEmail) return;
    if (emailRef.current) emailRef.current.value = rememberedEmail;
    if (rememberEmailRef.current) rememberEmailRef.current.checked = true;
  }, []);

  function handleSubmit() {
    const email = emailRef.current?.value.trim() ?? "";

    if (rememberEmailRef.current?.checked && email) {
      window.localStorage.setItem(rememberedEmailKey, email);
      return;
    }

    window.localStorage.removeItem(rememberedEmailKey);
  }

  async function handlePasskeySignIn() {
    if (!window.PublicKeyCredential) {
      setPasskeyError("This browser or device does not support passkeys.");
      return;
    }

    setPasskeyError(undefined);
    setPasskeyPending(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPasskey();

    if (error) {
      setPasskeyError(
        error.name === "NotAllowedError"
          ? "Passkey sign-in was cancelled or timed out."
          : "Career OS could not sign in with that passkey.",
      );
      setPasskeyPending(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <form action={formAction} className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          ref={emailRef}
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
          minLength={8}
          required
        />
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <input
          ref={rememberEmailRef}
          type="checkbox"
          className="size-4 accent-primary"
        />
        Remember my email on this device
      </label>
      {state.error ? (
        <p role="alert" className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
        {mode === "sign-in" ? "Sign in" : "Create account"}
        {!pending ? <ArrowRight className="size-4" /> : null}
      </Button>
      {mode === "sign-in" ? (
        <>
          <div className="flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={pending || passkeyPending}
            onClick={handlePasskeySignIn}
          >
            {passkeyPending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <KeyRound className="size-4" />
            )}
            Sign in with a passkey
          </Button>
          {passkeyError ? (
            <p role="alert" className="text-sm text-destructive">{passkeyError}</p>
          ) : null}
        </>
      ) : null}
      <p className="text-center text-sm text-muted-foreground">
        {mode === "sign-in" ? "New to Career OS?" : "Already have an account?"}{" "}
        <button
          type="button"
          className="font-medium text-foreground underline-offset-4 hover:underline"
          onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
        >
          {mode === "sign-in" ? "Create an account" : "Sign in"}
        </button>
      </p>
    </form>
  );
}
