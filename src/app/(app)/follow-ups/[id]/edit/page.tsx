import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteFollowUpButton } from "@/features/follow-ups/delete-follow-up-button";
import { FollowUpForm } from "@/features/follow-ups/follow-up-form";
import { createClient } from "@/lib/supabase/server";
export const metadata: Metadata = { title: "Edit follow-up" };
export default async function EditFollowUpPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const supabase = await createClient(); const [{ data: followUp }, { data: opportunities }, { data: contacts }] = await Promise.all([supabase.from("follow_ups").select("*").eq("id", id).maybeSingle(), supabase.from("opportunities").select("id, role_title").order("role_title"), supabase.from("contacts").select("id, name").order("name")]); if (!followUp) notFound(); return <div className="mx-auto max-w-3xl"><div className="flex items-center justify-between gap-4"><Link href="/follow-ups" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="size-4" /> Follow-ups</Link><DeleteFollowUpButton id={followUp.id} /></div><Card className="mt-5"><CardHeader><CardTitle>Edit follow-up</CardTitle><CardDescription>Update the next action, due date, or status.</CardDescription></CardHeader><CardContent><FollowUpForm opportunities={opportunities ?? []} contacts={contacts ?? []} followUp={followUp} /></CardContent></Card></div>; }
