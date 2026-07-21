insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resumes',
  'resumes',
  false,
  10485760,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Users can upload their own resume files"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Users can view their own resume files"
on storage.objects for select to authenticated
using (
  bucket_id = 'resumes'
  and owner_id = (select auth.uid()::text)
);

create policy "Users can update their own resume files"
on storage.objects for update to authenticated
using (
  bucket_id = 'resumes'
  and owner_id = (select auth.uid()::text)
)
with check (
  bucket_id = 'resumes'
  and owner_id = (select auth.uid()::text)
);

create policy "Users can delete their own resume files"
on storage.objects for delete to authenticated
using (
  bucket_id = 'resumes'
  and owner_id = (select auth.uid()::text)
);

create or replace function public.ensure_single_master_resume()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.is_master is true then
    update public.resumes
    set is_master = false
    where user_id = new.user_id
      and id <> new.id
      and is_master is true;
  end if;

  return new;
end;
$$;

drop trigger if exists ensure_single_master_resume on public.resumes;

create trigger ensure_single_master_resume
before insert or update of is_master
on public.resumes
for each row
execute function public.ensure_single_master_resume();
