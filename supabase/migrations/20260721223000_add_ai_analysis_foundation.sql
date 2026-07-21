alter table public.opportunities
add column if not exists job_description text;

create table if not exists public.ai_analyses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  resume_id uuid references public.resumes(id) on delete set null,
  analysis_type text not null check (analysis_type in ('job_description', 'resume_match', 'company_research')),
  input_hash text not null,
  model text not null,
  result jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists ai_analyses_user_opportunity_created_idx
on public.ai_analyses (user_id, opportunity_id, created_at desc);

alter table public.ai_analyses enable row level security;

create policy "Users can view their own AI analyses"
on public.ai_analyses for select to authenticated
using ((select auth.uid()) is not null and user_id = (select auth.uid()));

create policy "Users can insert their own AI analyses"
on public.ai_analyses for insert to authenticated
with check (
  (select auth.uid()) is not null
  and user_id = (select auth.uid())
  and exists (
    select 1 from public.opportunities opportunity
    where opportunity.id = ai_analyses.opportunity_id
      and opportunity.user_id = (select auth.uid())
  )
  and (
    resume_id is null
    or exists (
      select 1 from public.resumes resume
      where resume.id = ai_analyses.resume_id
        and resume.user_id = (select auth.uid())
    )
  )
);

create policy "Users can delete their own AI analyses"
on public.ai_analyses for delete to authenticated
using ((select auth.uid()) is not null and user_id = (select auth.uid()));
