import { z } from "zod";

export const COMPANY_CONTACT_IMPORT_HEADERS = [
  "company_name",
  "organization_type",
  "company_website",
  "industry",
  "remote_policy",
  "company_status",
  "company_priority",
  "company_notes",
  "contact_name",
  "contact_title",
  "contact_type",
  "contact_email",
  "linkedin_url",
  "contact_notes",
] as const;

const importText = (maximum: number) => z.string().trim().max(maximum);

export const companyContactImportRowSchema = z.object({
  company_name: importText(160).min(1, "Company name is required."),
  organization_type: importText(40),
  company_website: importText(500),
  industry: importText(120),
  remote_policy: importText(40),
  company_status: importText(40),
  company_priority: importText(5),
  company_notes: importText(5000),
  contact_name: importText(160),
  contact_title: importText(160),
  contact_type: importText(40),
  contact_email: importText(320),
  linkedin_url: importText(500),
  contact_notes: importText(5000),
}).superRefine((row, context) => {
  if (row.company_website && !isHttpUrl(row.company_website)) {
    context.addIssue({
      code: "custom",
      path: ["company_website"],
      message: "Company website must begin with http:// or https://.",
    });
  }

  if (row.linkedin_url && !isHttpUrl(row.linkedin_url)) {
    context.addIssue({
      code: "custom",
      path: ["linkedin_url"],
      message: "LinkedIn URL must begin with http:// or https://.",
    });
  }

  if (row.contact_email && !z.email().safeParse(row.contact_email).success) {
    context.addIssue({
      code: "custom",
      path: ["contact_email"],
      message: "Contact email is invalid.",
    });
  }

  const hasContactDetails = Boolean(
    row.contact_title ||
      row.contact_type ||
      row.contact_email ||
      row.linkedin_url ||
      row.contact_notes,
  );
  if (hasContactDetails && !row.contact_name) {
    context.addIssue({
      code: "custom",
      path: ["contact_name"],
      message: "Contact name is required when contact details are provided.",
    });
  }
});

export type CompanyContactImportRow = z.infer<typeof companyContactImportRowSchema>;

export function normalizeRecordName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US");
}

export function normalizeOrganizationType(value: string) {
  const normalized = normalizeRecordName(value).replaceAll("-", " ").replaceAll("_", " ");
  if (["recruiting firm", "recruiter", "search firm"].includes(normalized)) {
    return "recruiting_firm";
  }
  if (["both", "employer and recruiting firm"].includes(normalized)) return "both";
  return "employer";
}

export function normalizeCompanyStatus(value: string) {
  const normalized = normalizeRecordName(value);
  if (["researching", "active", "paused", "archived"].includes(normalized)) {
    return normalized;
  }
  if (normalized === "active opportunity") return "active";
  return "target";
}

export function normalizeRemotePolicy(value: string) {
  const normalized = normalizeRecordName(value);
  const policies = new Map([
    ["fully remote", "Fully remote"],
    ["remote first", "Remote-first"],
    ["remote-first", "Remote-first"],
    ["hybrid", "Hybrid"],
    ["on site", "On-site"],
    ["on-site", "On-site"],
    ["unknown", "Unknown"],
  ]);
  return policies.get(normalized) ?? null;
}

export function normalizeContactType(value: string) {
  const normalized = normalizeRecordName(value).replaceAll("-", " ").replaceAll("_", " ");
  const types = new Map([
    ["recruiter", "recruiter"],
    ["hiring manager", "hiring_manager"],
    ["talent acquisition", "talent_acquisition"],
    ["hr", "talent_acquisition"],
    ["human resources", "talent_acquisition"],
    ["employee", "employee"],
    ["referral", "referral"],
    ["other", "other"],
  ]);
  return types.get(normalized) ?? "other";
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
