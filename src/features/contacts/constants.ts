export const CONTACT_TYPES = [
  { value: "recruiter", label: "Recruiter" },
  { value: "hiring_manager", label: "Hiring manager" },
  { value: "talent_acquisition", label: "Talent acquisition" },
  { value: "employee", label: "Employee" },
  { value: "referral", label: "Referral" },
  { value: "other", label: "Other" },
] as const;

export function contactTypeLabel(value: string | null) {
  return CONTACT_TYPES.find((type) => type.value === value)?.label ?? "Other";
}
