drop policy if exists "Users can insert their own outreach" on public.outreach;
create policy "Users can insert their own outreach"
on public.outreach for insert to authenticated
with check (
  (select auth.uid()) is not null
  and user_id = (select auth.uid())
  and (
    opportunity_id is null
    or exists (
      select 1 from public.opportunities opportunity
      where opportunity.id = outreach.opportunity_id
        and opportunity.user_id = (select auth.uid())
    )
  )
  and (
    contact_id is null
    or exists (
      select 1 from public.contacts contact
      where contact.id = outreach.contact_id
        and contact.user_id = (select auth.uid())
    )
  )
);

drop policy if exists "Users can update their own outreach" on public.outreach;
create policy "Users can update their own outreach"
on public.outreach for update to authenticated
using (
  (select auth.uid()) is not null
  and user_id = (select auth.uid())
)
with check (
  (select auth.uid()) is not null
  and user_id = (select auth.uid())
  and (
    opportunity_id is null
    or exists (
      select 1 from public.opportunities opportunity
      where opportunity.id = outreach.opportunity_id
        and opportunity.user_id = (select auth.uid())
    )
  )
  and (
    contact_id is null
    or exists (
      select 1 from public.contacts contact
      where contact.id = outreach.contact_id
        and contact.user_id = (select auth.uid())
    )
  )
);
