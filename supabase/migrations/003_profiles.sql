create table if not exists profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  username text not null unique,
  display_name text,
  created_at timestamptz default now() not null,
  constraint username_format check (username ~ '^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$')
);

alter table profiles enable row level security;

create policy "Public can read profiles"
  on profiles for select using (true);

create policy "Users can insert their own profile"
  on profiles for insert with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = user_id);

-- Allow public read of visited and bucket list (needed for public profile page)
create policy "Public can read visited countries"
  on visited_countries for select using (true);

create policy "Public can read bucket list countries"
  on bucketlist_countries for select using (true);

-- Drop the old owner-only select policies (public ones replace them)
drop policy if exists "Users can read their own visited countries" on visited_countries;
drop policy if exists "Users can read their own bucket list" on bucketlist_countries;

create index if not exists profiles_username_idx on profiles (username);
