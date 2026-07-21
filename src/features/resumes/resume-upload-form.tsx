"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LoaderCircle, Upload } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export function ResumeUploadForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [fileName, setFileName] = useState<string>();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(undefined);

    const form = new FormData(event.currentTarget);
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      setError("Select a resume file.");
      setPending(false);
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE) {
      setError("Upload a PDF, DOC, or DOCX file no larger than 10 MB.");
      setPending(false);
      return;
    }

    const supabase = createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setError("Your session expired. Sign in and try again.");
      setPending(false);
      return;
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${userData.user.id}/${crypto.randomUUID()}/${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      setError("Career OS could not upload this file.");
      setPending(false);
      return;
    }

    const { error: insertError } = await supabase.from("resumes").insert({
      name: String(form.get("name") ?? "").trim(),
      focus: String(form.get("focus") ?? "").trim() || null,
      file_url: path,
      is_master: form.get("is_master") === "on",
      notes: String(form.get("notes") ?? "").trim() || null,
      user_id: userData.user.id,
    });

    if (insertError) {
      await supabase.storage.from("resumes").remove([path]);
      setError("Career OS could not save the resume details.");
      setPending(false);
      return;
    }

    router.push("/resumes");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Resume name</Label>
          <Input id="name" name="name" placeholder="QA Leadership — Master" required autoFocus />
        </div>
        <div className="space-y-2">
          <Label htmlFor="focus">Focus</Label>
          <Input id="focus" name="focus" placeholder="Director / Head of QA" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Resume file</Label>
          <input
            id="file"
            name="file"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(event) => setFileName(event.target.files?.[0]?.name)}
            className="peer sr-only"
          />
          <label
            htmlFor="file"
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-muted/10 px-4 py-5 text-center transition-colors hover:border-primary/50 hover:bg-muted/20 peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring"
          >
            <span className="flex size-9 items-center justify-center rounded-lg border bg-background">
              <Upload className="size-4 text-primary" />
            </span>
            <span className="mt-3 text-sm font-medium">
              {fileName ?? "Choose a resume file"}
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              {fileName ? "Choose another file" : "PDF, DOC, or DOCX · Maximum 10 MB"}
            </span>
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" name="is_master" className="size-4 accent-primary" />
          Set as master resume
        </label>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <textarea id="notes" name="notes" rows={3} className="w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30" />
        </div>
      </div>
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
      <div className="flex justify-end gap-3 border-t pt-5">
        <Link href="/resumes" className={cn(buttonVariants({ variant: "ghost" }))}>Cancel</Link>
        <Button type="submit" disabled={pending}>
          {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
          Upload resume
        </Button>
      </div>
    </form>
  );
}
