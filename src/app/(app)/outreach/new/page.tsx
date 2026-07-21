import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OutreachForm } from "@/features/outreach/outreach-form";
import { createClient } from "@/lib/supabase/server";
export const metadata: Metadata = { title: "Log outreach" };
export default async function NewOutreachPage() { const supabase = await createClient(); const [{ data: opportunities }, { data: contacts }] = await Promise.all([supabase.from("opportunities").select("id, role_title").order("role_title"), supabase.from("contacts").select("id, name").order("name")]); return <div className="mx-auto max-w-3xl"><Link href="/outreach" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="size-4" /> Outreach</Link><Card className="mt-5"><CardHeader><CardTitle>Log outreach</CardTitle><CardDescription>Capture an interaction and its current outcome.</CardDescription></CardHeader><CardContent><OutreachForm opportunities={opportunities ?? []} contacts={contacts ?? []} /></CardContent></Card></div>; }
