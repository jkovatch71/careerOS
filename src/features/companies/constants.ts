export const COMPANY_PRIORITIES = ["A", "B", "C"] as const;

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

export function companyStatusLabel(value: string | null) {
  return COMPANY_STATUSES.find((status) => status.value === value)?.label ?? "Target";
}
