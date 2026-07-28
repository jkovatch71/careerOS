import { NextResponse } from "next/server";

import { COMPANY_CONTACT_IMPORT_HEADERS } from "@/features/imports/company-contact-import";
import { createClient } from "@/lib/supabase/server";

const example = [
  "Acme Health",
  "Employer",
  "https://example.com",
  "Healthcare",
  "Fully remote",
  "Target",
  "A",
  "Priority target company",
  "Jane Smith",
  "VP, Talent Acquisition",
  "Talent acquisition",
  "jane@example.com",
  "https://www.linkedin.com/in/example",
  "Potential relationship",
];

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (typeof data?.claims?.sub !== "string") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const content = [
    COMPANY_CONTACT_IMPORT_HEADERS.map(csvCell).join(","),
    example.map(csvCell).join(","),
  ].join("\r\n");

  return new NextResponse(content, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": 'attachment; filename="career-os-company-contact-template.csv"',
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
