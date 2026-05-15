-- Migration: create_profiles_and_admin_rls
-- Datum: 2026-05-15

create table if not exists public.profiles (
  id         uuid references auth.users(id) on delete cascade primary key,
  role       text        not null default 'user',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role) values (new.id, 'user');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Kör denna en gång för att ge ägaren admin-roll:
-- update public.profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'ÄGARENS@EMAIL.SE');
