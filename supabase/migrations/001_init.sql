-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Visited countries table
create table if not exists visited_countries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  country_code char(2) not null,
  visited_at timestamptz default now() not null,
  unique (user_id, country_code)
);

-- Row Level Security
alter table visited_countries enable row level security;

create policy "Users can read their own visited countries"
  on visited_countries for select
  using (auth.uid() = user_id);

create policy "Users can insert their own visited countries"
  on visited_countries for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own visited countries"
  on visited_countries for delete
  using (auth.uid() = user_id);

-- Index for fast lookups per user
create index if not exists visited_countries_user_id_idx on visited_countries (user_id);
