"use client";

import { useActionState } from "react";
import { Building2, CheckCircle2, LoaderCircle, TriangleAlert } from "lucide-react";

import { analyzeCompanyResearch, type CompanyResearchState } from "@/app/(app)/ai/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Option = { id: string; label: string };
const initialState: CompanyResearchState = {};

function ResearchList({ title, items }: { title: string; items: string[] }) {
  return <div><h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</h4>{items.length ? <ul className="mt-2 space-y-1.5 text-sm">{items.map((item) => <li key={item} className="flex gap-2"><span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />{item}</li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">None identified</p>}</div>;
}

export function CompanyResearchForm({ opportunities }: { opportunities: Option[] }) {
  const [state, action, pending] = useActionState(analyzeCompanyResearch, initialState);
  return <div>
    <form action={action} className="space-y-4">
      <div className="space-y-2"><Label htmlFor="research_opportunity_id">Opportunity</Label><select id="research_opportunity_id" name="opportunity_id" required className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"><option value="">Select an opportunity</option>{opportunities.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div>
      <div className="space-y-2"><Label htmlFor="source_material">Company source material</Label><textarea id="source_material" name="source_material" rows={10} required minLength={200} maxLength={30000} placeholder="Paste relevant About-page text, leadership information, recent announcements, investor notes, or your own research…" className="w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring/30" /><p className="text-xs text-muted-foreground">Include dates and source names in the pasted text when available. Career OS will not treat undated material as current.</p></div>
      <Button type="submit" disabled={pending || opportunities.length === 0}>{pending ? <LoaderCircle className="size-4 animate-spin" /> : <Building2 className="size-4" />}{pending ? "Building brief…" : "Create and save brief"}</Button>
    </form>

    {state.status === "error" ? <div role="alert" className="mt-5 flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"><TriangleAlert className="mt-0.5 size-4 shrink-0" />{state.message}</div> : null}
    {state.status === "success" && state.research ? <div className="mt-6 rounded-xl border bg-muted/10 p-5">
      <div className="flex items-center gap-2 text-sm font-medium text-emerald-300"><CheckCircle2 className="size-4" />{state.message}</div>
      <div className="mt-5 space-y-4"><div><h3 className="text-base font-semibold">Company snapshot</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{state.research.company_snapshot}</p></div><div><h3 className="text-sm font-medium">Business model</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{state.research.business_model}</p></div></div>
      <div className="mt-6 grid gap-5 md:grid-cols-2"><ResearchList title="Strategic priorities" items={state.research.strategic_priorities} /><ResearchList title="Market position" items={state.research.market_position} /><ResearchList title="Culture signals" items={state.research.culture_signals} /><ResearchList title="Role implications" items={state.research.role_implications} /><ResearchList title="Risks and unknowns" items={state.research.risks_and_unknowns} /><ResearchList title="Talking points" items={state.research.talking_points} /><ResearchList title="Interview questions" items={state.research.interview_questions} /><ResearchList title="Source limitations" items={state.research.source_limitations} /></div>
    </div> : null}
  </div>;
}
