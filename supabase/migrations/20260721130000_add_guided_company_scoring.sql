alter table public.companies
  add column role_alignment_score smallint
    constraint companies_role_alignment_score_check check (role_alignment_score between 0 and 20),
  add column compensation_score smallint
    constraint companies_compensation_score_check check (compensation_score between 0 and 20),
  add column work_model_score smallint
    constraint companies_work_model_score_check check (work_model_score between 0 and 20),
  add column company_outlook_score smallint
    constraint companies_company_outlook_score_check check (company_outlook_score between 0 and 20),
  add column culture_interest_score smallint
    constraint companies_culture_interest_score_check check (culture_interest_score between 0 and 20);

create or replace function public.set_company_guided_score()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.role_alignment_score is not null
    and new.compensation_score is not null
    and new.work_model_score is not null
    and new.company_outlook_score is not null
    and new.culture_interest_score is not null then
    new.score := new.role_alignment_score
      + new.compensation_score
      + new.work_model_score
      + new.company_outlook_score
      + new.culture_interest_score;
  else
    new.score := null;
  end if;

  return new;
end;
$$;

drop trigger if exists set_company_guided_score on public.companies;

create trigger set_company_guided_score
before insert or update of
  role_alignment_score,
  compensation_score,
  work_model_score,
  company_outlook_score,
  culture_interest_score
on public.companies
for each row
execute function public.set_company_guided_score();
