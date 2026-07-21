"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";

import {
  moveOpportunityStage,
  type PipelineStageActionState,
} from "@/app/(app)/pipeline/actions";
import { Button } from "@/components/ui/button";
import { OPPORTUNITY_STAGES } from "@/features/opportunities/constants";

const initialState: PipelineStageActionState = {};

export function PipelineStageControl({
  opportunityId,
  currentStage,
}: {
  opportunityId: string;
  currentStage: string | null;
}) {
  const action = moveOpportunityStage.bind(null, opportunityId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <div className="flex gap-2">
        <select
          name="stage"
          defaultValue={currentStage ?? "research"}
          aria-label="Move opportunity to stage"
          className="h-8 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          {OPPORTUNITY_STAGES.map((stage) => (
            <option key={stage.value} value={stage.value}>{stage.label}</option>
          ))}
        </select>
        <Button type="submit" variant="outline" size="sm" disabled={pending}>
          {pending ? <LoaderCircle className="size-3.5 animate-spin" /> : "Move"}
        </Button>
      </div>
      {state.error ? <p role="alert" className="text-xs text-destructive">{state.error}</p> : null}
    </form>
  );
}
