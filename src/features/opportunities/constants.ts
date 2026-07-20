export const OPPORTUNITY_STAGES = [
  { value: "research", label: "Research" },
  { value: "saved", label: "Saved" },
  { value: "applied", label: "Applied" },
  { value: "recruiter_screen", label: "Recruiter screen" },
  { value: "interview", label: "Interview" },
  { value: "final_round", label: "Final round" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
  { value: "closed", label: "Closed" },
] as const;

export const OPPORTUNITY_SOURCES = [
  "LinkedIn",
  "Company website",
  "Recruiter",
  "Referral",
  "Job board",
  "Other",
] as const;

export function opportunityStageLabel(value: string | null) {
  return OPPORTUNITY_STAGES.find((stage) => stage.value === value)?.label ?? "Research";
}
