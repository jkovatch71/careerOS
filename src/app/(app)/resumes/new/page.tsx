import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResumeUploadForm } from "@/features/resumes/resume-upload-form";

export const metadata: Metadata = { title: "Add resume" };

export default function NewResumePage() {
  return <div className="mx-auto max-w-3xl"><Link href="/resumes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="size-4" /> Resumes</Link><Card className="mt-5"><CardHeader><CardTitle>Add resume</CardTitle><CardDescription>Store a private master or targeted resume version.</CardDescription></CardHeader><CardContent><ResumeUploadForm /></CardContent></Card></div>;
}
