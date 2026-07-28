"use server";

import { revalidatePath } from "next/cache";

import {
  companyContactImportRowSchema,
  normalizeCompanyStatus,
  normalizeContactType,
  normalizeOrganizationType,
  normalizeRecordName,
  normalizeRemotePolicy,
} from "@/features/imports/company-contact-import";
import { createClient } from "@/lib/supabase/server";

const MAX_IMPORT_ROWS = 500;

export type ImportResult = {
  error?: string;
  createdCompanies?: number;
  matchedCompanies?: number;
  createdContacts?: number;
  skippedContacts?: number;
};

function nullable(value: string) {
  return value || null;
}

export async function importCompanyContacts(payload: unknown): Promise<ImportResult> {
  if (!Array.isArray(payload) || payload.length === 0) {
    return { error: "Add at least one company row before importing." };
  }
  if (payload.length > MAX_IMPORT_ROWS) {
    return { error: `Import no more than ${MAX_IMPORT_ROWS} rows at a time.` };
  }

  const rows = [];
  for (let index = 0; index < payload.length; index += 1) {
    const parsed = companyContactImportRowSchema.safeParse(payload[index]);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return {
        error: `Row ${index + 2}: ${issue?.message ?? "Review this row."}`,
      };
    }
    rows.push(parsed.data);
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = typeof claimsData?.claims?.sub === "string" ? claimsData.claims.sub : null;
  if (claimsError || !userId) return { error: "Your session expired. Sign in and try again." };

  const [companiesResult, contactsResult] = await Promise.all([
    supabase.from("companies").select("id, name").eq("user_id", userId),
    supabase
      .from("contacts")
      .select("id, name, email, linkedin_url, company_id")
      .eq("user_id", userId),
  ]);
  if (companiesResult.error || contactsResult.error) {
    return { error: "Career OS could not check existing companies and contacts." };
  }

  const companyIds = new Map(
    (companiesResult.data ?? []).map((company) => [normalizeRecordName(company.name), company.id]),
  );
  const uniqueCompanyRows = new Map<string, (typeof rows)[number]>();
  for (const row of rows) {
    const key = normalizeRecordName(row.company_name);
    if (!companyIds.has(key) && !uniqueCompanyRows.has(key)) uniqueCompanyRows.set(key, row);
  }

  const companyRowsToCreate = [...uniqueCompanyRows.values()].map((row) => ({
    user_id: userId,
    name: row.company_name,
    organization_type: normalizeOrganizationType(row.organization_type),
    website: nullable(row.company_website),
    industry: nullable(row.industry),
    remote_policy: normalizeRemotePolicy(row.remote_policy),
    status: normalizeCompanyStatus(row.company_status),
    priority: ["A", "B", "C"].includes(row.company_priority.toUpperCase())
      ? row.company_priority.toUpperCase()
      : "B",
    notes: nullable(row.company_notes),
  }));

  if (companyRowsToCreate.length) {
    const { data: createdCompanies, error } = await supabase
      .from("companies")
      .insert(companyRowsToCreate)
      .select("id, name");
    if (error || !createdCompanies) {
      return { error: "Career OS could not create the imported companies." };
    }
    for (const company of createdCompanies) {
      companyIds.set(normalizeRecordName(company.name), company.id);
    }
  }

  const existingContactKeys = new Set<string>();
  for (const contact of contactsResult.data ?? []) {
    const companyId = contact.company_id ?? "";
    if (contact.email) existingContactKeys.add(`email:${normalizeRecordName(contact.email)}`);
    if (contact.linkedin_url) {
      existingContactKeys.add(`linkedin:${normalizeRecordName(contact.linkedin_url)}`);
    }
    existingContactKeys.add(
      `name:${normalizeRecordName(contact.name)}:${companyId}`,
    );
  }

  const contactsToCreate = [];
  let skippedContacts = 0;
  for (const row of rows) {
    if (!row.contact_name) continue;
    const companyId = companyIds.get(normalizeRecordName(row.company_name));
    if (!companyId) {
      return { error: `Career OS could not link ${row.contact_name} to ${row.company_name}.` };
    }

    const possibleKeys = [
      row.contact_email ? `email:${normalizeRecordName(row.contact_email)}` : null,
      row.linkedin_url ? `linkedin:${normalizeRecordName(row.linkedin_url)}` : null,
      `name:${normalizeRecordName(row.contact_name)}:${companyId}`,
    ].filter((key): key is string => Boolean(key));

    if (possibleKeys.some((key) => existingContactKeys.has(key))) {
      skippedContacts += 1;
      continue;
    }

    contactsToCreate.push({
      user_id: userId,
      company_id: companyId,
      name: row.contact_name,
      title: nullable(row.contact_title),
      contact_type: normalizeContactType(row.contact_type),
      email: nullable(row.contact_email),
      linkedin_url: nullable(row.linkedin_url),
      notes: nullable(row.contact_notes),
    });
    possibleKeys.forEach((key) => existingContactKeys.add(key));
  }

  if (contactsToCreate.length) {
    const { error } = await supabase.from("contacts").insert(contactsToCreate);
    if (error) {
      return {
        error:
          "Companies were checked, but Career OS could not finish importing contacts. You can safely retry the same file.",
      };
    }
  }

  revalidatePath("/companies");
  revalidatePath("/contacts");
  revalidatePath("/dashboard");

  return {
    createdCompanies: companyRowsToCreate.length,
    matchedCompanies: new Set(rows.map((row) => normalizeRecordName(row.company_name))).size -
      companyRowsToCreate.length,
    createdContacts: contactsToCreate.length,
    skippedContacts,
  };
}
