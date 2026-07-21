export const COMPANY_PRIORITIES = ["A", "B", "C"] as const;

export const ORGANIZATION_TYPES = [
  { value: "employer", label: "Employer" },
  { value: "recruiting_firm", label: "Recruiting firm" },
  { value: "both", label: "Employer and recruiting firm" },
] as const;

export const COMPANY_STATUSES = [
  { value: "target", label: "Target" },
  { value: "researching", label: "Researching" },
  { value: "active", label: "Active opportunity" },
  { value: "paused", label: "Paused" },
  { value: "archived", label: "Archived" },
] as const;

export const REMOTE_POLICIES = [
  "Fully remote",
  "Remote-first",
  "Hybrid",
  "On-site",
  "Unknown",
] as const;

export const COMPANY_SCORE_FACTORS = [
  {
    key: "role_alignment_score",
    label: "Role alignment",
    description: "Leadership scope and relevance to your experience.",
  },
  {
    key: "compensation_score",
    label: "Compensation potential",
    description: "Likelihood of meeting your compensation goals.",
  },
  {
    key: "work_model_score",
    label: "Work-model fit",
    description: "Remote policy, schedule, and location compatibility.",
  },
  {
    key: "company_outlook_score",
    label: "Company outlook",
    description: "Stability, growth, leadership, and market position.",
  },
  {
    key: "culture_interest_score",
    label: "Interest and culture",
    description: "Personal interest, values, and likely culture fit.",
  },
] as const;

export const COMPANY_SCORE_OPTIONS = [
  { value: 0, label: "Poor" },
  { value: 5, label: "Limited" },
  { value: 10, label: "Moderate" },
  { value: 15, label: "Strong" },
  { value: 20, label: "Exceptional" },
] as const;

export function companyStatusLabel(value: string | null) {
  return COMPANY_STATUSES.find((status) => status.value === value)?.label ?? "Target";
}

export function organizationTypeLabel(value: string) {
  return ORGANIZATION_TYPES.find((type) => type.value === value)?.label ?? "Employer";
}
