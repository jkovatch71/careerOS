import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FollowUpForm } from "@/features/follow-ups/follow-up-form";
import { createClient } from "@/lib/supabase/server";
export const metadata: Metadata = { title: "New follow-up" };
export default async function NewFollowUpPage() { const supabase = await createClient(); const [{ data: opportunities }, { data: contacts }] = await Promise.all([supabase.from("opportunities").select("id, role_title").order("role_title"), supabase.from("contacts").select("id, name").order("name")]); return <div className="mx-auto max-w-3xl"><Link href="/follow-ups" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="size-4" /> Follow-ups</Link><Card className="mt-5"><CardHeader><CardTitle>New follow-up</CardTitle><CardDescription>Schedule the next action for a relationship or opportunity.</CardDescription></CardHeader><CardContent><FollowUpForm opportunities={opportunities ?? []} contacts={contacts ?? []} /></CardContent></Card></div>; }
