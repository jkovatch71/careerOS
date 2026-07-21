export const OUTREACH_CHANNELS = ["Email", "LinkedIn", "Phone", "Text", "Other"] as const;

export const OUTREACH_OUTCOMES = [
  { value: "no_response", label: "No response" },
  { value: "replied", label: "Replied" },
  { value: "meeting_scheduled", label: "Meeting scheduled" },
  { value: "declined", label: "Declined" },
  { value: "referred", label: "Referred" },
  { value: "other", label: "Other" },
] as const;

export function outreachOutcomeLabel(value: string | null) {
  return OUTREACH_OUTCOMES.find((outcome) => outcome.value === value)?.label ?? "Pending";
}
