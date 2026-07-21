import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteOutreachButton } from "@/features/outreach/delete-outreach-button";
import { OutreachForm } from "@/features/outreach/outreach-form";
import { createClient } from "@/lib/supabase/server";
export const metadata: Metadata = { title: "Edit outreach" };
export default async function EditOutreachPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const supabase = await createClient(); const [{ data: outreach }, { data: opportunities }, { data: contacts }] = await Promise.all([supabase.from("outreach").select("*").eq("id", id).maybeSingle(), supabase.from("opportunities").select("id, role_title").order("role_title"), supabase.from("contacts").select("id, name").order("name")]); if (!outreach) notFound(); return <div className="mx-auto max-w-3xl"><div className="flex items-center justify-between gap-4"><Link href="/outreach" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="size-4" /> Outreach</Link><DeleteOutreachButton id={outreach.id} /></div><Card className="mt-5"><CardHeader><CardTitle>Edit outreach</CardTitle><CardDescription>Update the interaction, response, or outcome.</CardDescription></CardHeader><CardContent><OutreachForm opportunities={opportunities ?? []} contacts={contacts ?? []} outreach={outreach} /></CardContent></Card></div>; }
