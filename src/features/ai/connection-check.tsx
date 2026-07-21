"use client";

import { useActionState } from "react";
import { CheckCircle2, LoaderCircle, PlugZap, TriangleAlert } from "lucide-react";

import {
  testAiConnection,
  type AiConnectionState,
} from "@/app/(app)/ai/actions";
import { Button } from "@/components/ui/button";

const initialState: AiConnectionState = {};

export function ConnectionCheck() {
  const [state, action, pending] = useActionState(testAiConnection, initialState);

  return (
    <div>
      <form action={action}>
        <Button type="submit" disabled={pending}>
          {pending ? <LoaderCircle className="size-4 animate-spin" /> : <PlugZap className="size-4" />}
          {pending ? "Testing connection…" : "Test connection"}
        </Button>
      </form>

      {state.status ? (
        <div
          role="status"
          className={`mt-5 flex items-start gap-3 rounded-lg border p-4 text-sm ${
            state.status === "success"
              ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
              : "border-destructive/30 bg-destructive/5 text-destructive"
          }`}
        >
          {state.status === "success" ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          ) : (
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          )}
          <div>
            <p className="font-medium">
              {state.status === "success" ? "Workers AI is connected" : "Connection failed"}
            </p>
            <p className="mt-1 text-xs opacity-80">{state.message}</p>
            {state.model ? <p className="mt-1 text-xs opacity-60">Model: {state.model}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
