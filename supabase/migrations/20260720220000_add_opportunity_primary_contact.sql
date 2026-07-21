alter table public.opportunities
  add column primary_contact_id uuid
    references public.contacts(id) on delete set null;

create index opportunities_primary_contact_id_idx
  on public.opportunities(primary_contact_id);

drop policy "Users can insert their own opportunities"
  on public.opportunities;

create policy "Users can insert their own opportunities"
  on public.opportunities
  for insert
  to authenticated
  with check (
    (select auth.uid()) is not null
    and (select auth.uid()) = user_id
    and (
      company_id is null
      or exists (
        select 1 from public.companies employer
        where employer.id = opportunities.company_id
          and employer.user_id = (select auth.uid())
          and employer.organization_type in ('employer', 'both')
      )
    )
    and (
      primary_contact_id is null
      or exists (
        select 1 from public.contacts primary_contact
        where primary_contact.id = opportunities.primary_contact_id
          and primary_contact.user_id = (select auth.uid())
          and primary_contact.company_id = opportunities.company_id
      )
    )
    and (
      recruiting_firm_id is null
      or exists (
        select 1 from public.companies firm
        where firm.id = opportunities.recruiting_firm_id
          and firm.user_id = (select auth.uid())
          and firm.organization_type in ('recruiting_firm', 'both')
      )
    )
    and (
      recruiter_contact_id is null
      or exists (
        select 1 from public.contacts recruiter
        where recruiter.id = opportunities.recruiter_contact_id
          and recruiter.user_id = (select auth.uid())
          and (
            opportunities.recruiting_firm_id is null
            or recruiter.company_id = opportunities.recruiting_firm_id
          )
      )
    )
  );

drop policy "Users can update their own opportunities"
  on public.opportunities;

create policy "Users can update their own opportunities"
  on public.opportunities
  for update
  to authenticated
  using (
    (select auth.uid()) is not null
    and (select auth.uid()) = user_id
  )
  with check (
    (select auth.uid()) is not null
    and (select auth.uid()) = user_id
    and (
      company_id is null
      or exists (
        select 1 from public.companies employer
        where employer.id = opportunities.company_id
          and employer.user_id = (select auth.uid())
          and employer.organization_type in ('employer', 'both')
      )
    )
    and (
      primary_contact_id is null
      or exists (
        select 1 from public.contacts primary_contact
        where primary_contact.id = opportunities.primary_contact_id
          and primary_contact.user_id = (select auth.uid())
          and primary_contact.company_id = opportunities.company_id
      )
    )
    and (
      recruiting_firm_id is null
      or exists (
        select 1 from public.companies firm
        where firm.id = opportunities.recruiting_firm_id
          and firm.user_id = (select auth.uid())
          and firm.organization_type in ('recruiting_firm', 'both')
      )
    )
    and (
      recruiter_contact_id is null
      or exists (
        select 1 from public.contacts recruiter
        where recruiter.id = opportunities.recruiter_contact_id
          and recruiter.user_id = (select auth.uid())
          and (
            opportunities.recruiting_firm_id is null
            or recruiter.company_id = opportunities.recruiting_firm_id
          )
      )
    )
  );
