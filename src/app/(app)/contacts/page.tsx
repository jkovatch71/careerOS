import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Search, SlidersHorizontal, Users, X } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CONTACT_TYPES, contactTypeLabel } from "@/features/contacts/constants";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Contacts" };

const CONTACT_SORTS = [
  { value: "name_asc", label: "Name A–Z" },
  { value: "name_desc", label: "Name Z–A" },
  { value: "created_desc", label: "Recently added" },
  { value: "type_asc", label: "Relationship type" },
] as const;

type SearchParams = {
  q?: string | string[];
  type?: string | string[];
  company?: string | string[];
  sort?: string | string[];
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function safeSearchTerm(value: string) {
  return value
    .replace(/[^\p{L}\p{N}\s.@&'’+-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const q = safeSearchTerm(firstValue(params.q));
  const requestedType = firstValue(params.type);
  const contactType = CONTACT_TYPES.some((option) => option.value === requestedType)
    ? requestedType
    : "";
  const requestedSort = firstValue(params.sort);
  const sort = CONTACT_SORTS.some((option) => option.value === requestedSort)
    ? requestedSort
    : "name_asc";

  const supabase = await createClient();
  const { data: companies } = await supabase.from("companies").select("id, name").order("name");
  const companyOptions = companies ?? [];
  const requestedCompany = firstValue(params.company);
  const company = requestedCompany === "independent" ||
    companyOptions.some((option) => option.id === requestedCompany)
    ? requestedCompany
    : "";
  const hasFilters = Boolean(q || contactType || company || sort !== "name_asc");
  const matchingCompanyIds = q
    ? companyOptions
      .filter((option) => option.name.toLocaleLowerCase().includes(q.toLocaleLowerCase()))
      .map((option) => option.id)
    : [];

  let query = supabase.from("contacts").select("*, companies(id, name)");
  if (q) {
    const searchFilters = [
      `name.ilike.%${q}%`,
      `title.ilike.%${q}%`,
      `email.ilike.%${q}%`,
      `notes.ilike.%${q}%`,
    ];
    if (matchingCompanyIds.length) {
      searchFilters.push(`company_id.in.(${matchingCompanyIds.join(",")})`);
    }
    query = query.or(searchFilters.join(","));
  }
  if (contactType) query = query.eq("contact_type", contactType);
  if (company === "independent") {
    query = query.is("company_id", null);
  } else if (company) {
    query = query.eq("company_id", company);
  }

  if (sort === "name_desc") {
    query = query.order("name", { ascending: false });
  } else if (sort === "created_desc") {
    query = query.order("created_at", { ascending: false, nullsFirst: false });
  } else if (sort === "type_asc") {
    query = query.order("contact_type", { ascending: true, nullsFirst: false })
      .order("name", { ascending: true });
  } else {
    query = query.order("name", { ascending: true });
  }

  const { data: contacts, error } = await query;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex items-end justify-between gap-4">
        <div><p className="text-sm text-muted-foreground">Career network</p><h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Contacts</h1><p className="mt-2 text-sm text-muted-foreground">Track recruiters, hiring managers, referrals, and advocates.</p></div>
        <Link href="/contacts/new" className={cn(buttonVariants())}><Plus className="size-4" /> Add contact</Link>
      </div>

      <form
        method="get"
        className="mt-8 grid gap-3 rounded-xl border bg-card/40 p-4 lg:grid-cols-[minmax(240px,1fr)_180px_210px_180px_auto]"
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search name, title, company, email…"
            aria-label="Search contacts"
            className="pl-9"
          />
        </div>
        <select
          name="type"
          defaultValue={contactType}
          aria-label="Filter by relationship type"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          <option value="">All relationship types</option>
          {CONTACT_TYPES.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <select
          name="company"
          defaultValue={company}
          aria-label="Filter by organization"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          <option value="">All organizations</option>
          <option value="independent">Independent / unassigned</option>
          {companyOptions.map((option) => (
            <option key={option.id} value={option.id}>{option.name}</option>
          ))}
        </select>
        <select
          name="sort"
          defaultValue={sort}
          aria-label="Sort contacts"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          {CONTACT_SORTS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <Button type="submit" variant="outline" className="flex-1 lg:flex-none">
            <SlidersHorizontal className="size-4" />
            Apply
          </Button>
          {hasFilters ? (
            <Link
              href="/contacts"
              aria-label="Clear contact filters"
              title="Clear filters"
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
            >
              <X className="size-4" />
            </Link>
          ) : null}
        </div>
      </form>

      {error ? (
        <Card className="mt-8 border-destructive/40"><CardContent className="p-6 text-sm text-destructive">Career OS could not load contacts.</CardContent></Card>
      ) : contacts.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="flex min-h-72 flex-col items-center justify-center text-center">
            <span className="flex size-11 items-center justify-center rounded-lg border bg-muted/30"><Users className="size-5 text-muted-foreground" /></span>
            <h2 className="mt-4 text-sm font-medium">{hasFilters ? "No matching contacts" : "No contacts yet"}</h2>
            <p className="mt-2 max-w-sm text-xs leading-5 text-muted-foreground">
              {hasFilters ? "Adjust or clear the current search and filters." : "Add a recruiter, hiring manager, or professional relationship."}
            </p>
            {hasFilters ? (
              <Link href="/contacts" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-5")}><X className="size-4" /> Clear filters</Link>
            ) : (
              <Link href="/contacts/new" className={cn(buttonVariants({ size: "sm" }), "mt-5")}><Plus className="size-4" /> Add your first contact</Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border">
          <div className="border-b bg-muted/15 px-5 py-2 text-xs text-muted-foreground">
            {contacts.length} contact{contacts.length === 1 ? "" : "s"}
          </div>
          <div className="hidden grid-cols-[minmax(200px,1.5fr)_1fr_1fr_1fr] gap-4 border-b bg-card/70 px-5 py-3 text-xs font-medium text-muted-foreground md:grid"><span>Contact</span><span>Relationship</span><span>Organization</span><span>Email</span></div>
          <div className="divide-y">{contacts.map((contact) => (
            <Link key={contact.id} href={`/contacts/${contact.id}/edit`} className="grid gap-3 bg-background px-5 py-4 transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring md:grid-cols-[minmax(200px,1.5fr)_1fr_1fr_1fr] md:items-center md:gap-4">
              <div className="min-w-0"><p className="truncate text-sm font-medium">{contact.name}</p><p className="mt-1 truncate text-xs text-muted-foreground">{contact.title ?? "Title not set"}</p></div>
              <span className="w-fit rounded-full border bg-muted/30 px-2 py-1 text-xs">{contactTypeLabel(contact.contact_type)}</span>
              <p className="truncate text-sm text-muted-foreground">{contact.companies?.name ?? "Independent"}</p>
              <p className="truncate text-sm text-muted-foreground">{contact.email ?? "—"}</p>
            </Link>
          ))}</div>
        </div>
      )}
    </div>
  );
}
