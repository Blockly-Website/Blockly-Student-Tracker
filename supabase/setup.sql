-- Blockly Student OSS
-- One Supabase project = one student's data

create extension if not exists "pgcrypto";

create table if not exists public.schedule_types (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  lunch_enabled boolean not null default true,
  lunch_start time,
  lunch_end time,
  created_at timestamptz not null default now(),
  unique (id, user_id),
  check (
    (not lunch_enabled and lunch_start is null and lunch_end is null)
    or
    (lunch_enabled and lunch_start is not null and lunch_end is not null and lunch_start < lunch_end)
  ),
  unique (user_id, name)
);

create table if not exists public.schedule_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  schedule_type_id uuid not null,
  name text not null,
  start_time time not null,
  end_time time not null,
  block_index integer not null,
  is_lunch boolean not null default false,
  created_at timestamptz not null default now(),
  unique (id, user_id),
  check (start_time < end_time),
  check (block_index > 0),
  constraint schedule_blocks_schedule_type_owner_fk
    foreign key (schedule_type_id, user_id)
    references public.schedule_types(id, user_id)
    on delete cascade,
  unique (schedule_type_id, block_index)
);

create table if not exists public.schedule_overrides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  override_date date not null,
  schedule_type_id uuid not null,
  created_at timestamptz not null default now(),
  constraint schedule_overrides_schedule_type_owner_fk
    foreign key (schedule_type_id, user_id)
    references public.schedule_types(id, user_id)
    on delete restrict,
  unique (user_id, override_date)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  due_date date,
  schedule_block_id uuid,
  is_completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint tasks_schedule_block_owner_fk
    foreign key (schedule_block_id, user_id)
    references public.schedule_blocks(id, user_id)
    on delete set null
);

create or replace function public.set_user_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if new.user_id is null then
    new.user_id = auth.uid();
  end if;

  if new.user_id <> auth.uid() then
    raise exception 'user_id must match authenticated user';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_schedule_types_user_id on public.schedule_types;
create trigger trg_schedule_types_user_id
before insert or update on public.schedule_types
for each row execute procedure public.set_user_id();

drop trigger if exists trg_schedule_blocks_user_id on public.schedule_blocks;
create trigger trg_schedule_blocks_user_id
before insert or update on public.schedule_blocks
for each row execute procedure public.set_user_id();

drop trigger if exists trg_schedule_overrides_user_id on public.schedule_overrides;
create trigger trg_schedule_overrides_user_id
before insert or update on public.schedule_overrides
for each row execute procedure public.set_user_id();

drop trigger if exists trg_tasks_user_id on public.tasks;
create trigger trg_tasks_user_id
before insert or update on public.tasks
for each row execute procedure public.set_user_id();

alter table public.schedule_types enable row level security;
alter table public.schedule_blocks enable row level security;
alter table public.schedule_overrides enable row level security;
alter table public.tasks enable row level security;

alter table public.schedule_types force row level security;
alter table public.schedule_blocks force row level security;
alter table public.schedule_overrides force row level security;
alter table public.tasks force row level security;

drop policy if exists "User owns rows" on public.schedule_types;
create policy "User owns rows"
on public.schedule_types
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "User owns rows" on public.schedule_blocks;
create policy "User owns rows"
on public.schedule_blocks
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "User owns rows" on public.schedule_overrides;
create policy "User owns rows"
on public.schedule_overrides
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "User owns rows" on public.tasks;
create policy "User owns rows"
on public.tasks
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

revoke all on public.schedule_types from anon;
revoke all on public.schedule_blocks from anon;
revoke all on public.schedule_overrides from anon;
revoke all on public.tasks from anon;

grant select, insert, update, delete on public.schedule_types to authenticated;
grant select, insert, update, delete on public.schedule_blocks to authenticated;
grant select, insert, update, delete on public.schedule_overrides to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;

insert into public.schedule_types (name, user_id, lunch_enabled, lunch_start, lunch_end)
select 'Even Day', auth.uid(), true, '12:00', '12:30'
where auth.uid() is not null
on conflict do nothing;
