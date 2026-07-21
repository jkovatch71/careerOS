drop policy if exists "Users can insert their own follow_ups" on public.follow_ups;
create policy "Users can insert their own follow_ups"
on public.follow_ups for insert to authenticated
with check (
  (select auth.uid()) is not null
  and user_id = (select auth.uid())
  and (opportunity_id is null or exists (
    select 1 from public.opportunities opportunity
    where opportunity.id = follow_ups.opportunity_id
      and opportunity.user_id = (select auth.uid())
  ))
  and (contact_id is null or exists (
    select 1 from public.contacts contact
    where contact.id = follow_ups.contact_id
      and contact.user_id = (select auth.uid())
  ))
);

drop policy if exists "Users can update their own follow_ups" on public.follow_ups;
create policy "Users can update their own follow_ups"
on public.follow_ups for update to authenticated
using ((select auth.uid()) is not null and user_id = (select auth.uid()))
with check (
  (select auth.uid()) is not null
  and user_id = (select auth.uid())
  and (opportunity_id is null or exists (
    select 1 from public.opportunities opportunity
    where opportunity.id = follow_ups.opportunity_id
      and opportunity.user_id = (select auth.uid())
  ))
  and (contact_id is null or exists (
    select 1 from public.contacts contact
    where contact.id = follow_ups.contact_id
      and contact.user_id = (select auth.uid())
  ))
);
