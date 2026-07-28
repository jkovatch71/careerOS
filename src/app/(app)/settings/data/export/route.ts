import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data: claimsResult, error: authError } = await supabase.auth.getClaims();
  const userId =
    typeof claimsResult?.claims?.sub === "string" ? claimsResult.claims.sub : null;

  if (authError || !userId) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  const [
    companies,
    contacts,
    opportunities,
    resumes,
    outreach,
    followUps,
    aiAnalyses,
  ] = await Promise.all([
    supabase.from("companies").select("*").eq("user_id", userId).order("created_at"),
    supabase.from("contacts").select("*").eq("user_id", userId).order("created_at"),
    supabase.from("opportunities").select("*").eq("user_id", userId).order("created_at"),
    supabase.from("resumes").select("*").eq("user_id", userId).order("created_at"),
    supabase.from("outreach").select("*").eq("user_id", userId).order("created_at"),
    supabase.from("follow_ups").select("*").eq("user_id", userId).order("created_at"),
    supabase.from("ai_analyses").select("*").eq("user_id", userId).order("created_at"),
  ]);

  const results = [
    companies,
    contacts,
    opportunities,
    resumes,
    outreach,
    followUps,
    aiAnalyses,
  ];
  const failedResult = results.find((result) => result.error);

  if (failedResult?.error) {
    console.error("Career OS backup export failed", {
      code: failedResult.error.code,
      message: failedResult.error.message,
    });
    return Response.json(
      { error: "Career OS could not prepare the complete backup." },
      { status: 500 },
    );
  }

  const exportedAt = new Date();
  const backup = {
    format: "career-os-backup",
    schemaVersion: 1,
    exportedAt: exportedAt.toISOString(),
    scope: {
      includesPrivateStorageFiles: false,
      notes:
        "Resume metadata and private storage paths are included; uploaded resume file bytes are not included.",
    },
    counts: {
      companies: companies.data?.length ?? 0,
      contacts: contacts.data?.length ?? 0,
      opportunities: opportunities.data?.length ?? 0,
      resumes: resumes.data?.length ?? 0,
      outreach: outreach.data?.length ?? 0,
      followUps: followUps.data?.length ?? 0,
      aiAnalyses: aiAnalyses.data?.length ?? 0,
    },
    data: {
      companies: companies.data ?? [],
      contacts: contacts.data ?? [],
      opportunities: opportunities.data ?? [],
      resumes: resumes.data ?? [],
      outreach: outreach.data ?? [],
      followUps: followUps.data ?? [],
      aiAnalyses: aiAnalyses.data ?? [],
    },
  };
  const filename = `career-os-backup-${exportedAt.toISOString().slice(0, 10)}.json`;

  return new Response(JSON.stringify(backup, null, 2), {
    status: 200,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
