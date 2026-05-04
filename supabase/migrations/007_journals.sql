-- Create storage bucket for country photos
insert into storage.buckets (id, name, public)
values ('country-photos', 'country-photos', true)
on conflict (id) do nothing;

-- Storage RLS
create policy "Users can upload their own photos"
  on storage.objects for insert
  with check (bucket_id = 'country-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own photos"
  on storage.objects for delete
  using (bucket_id = 'country-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Public can view country photos"
  on storage.objects for select
  using (bucket_id = 'country-photos');

-- Journal table
create table if not exists country_journals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  country_code text not null,
  journal_text text default '' not null,
  cities_visited text[] default '{}' not null,
  photo_urls text[] default '{}' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (user_id, country_code)
);

alter table country_journals enable row level security;

create policy "Users can manage their own journals"
  on country_journals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists country_journals_user_id_idx on country_journals (user_id);
