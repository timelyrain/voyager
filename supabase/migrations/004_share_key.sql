-- Add share_key as a UUID (auto-generated, unguessable)
alter table profiles add column if not exists share_key uuid default gen_random_uuid() not null unique;

-- Backfill any existing rows that got a null share_key before the default kicks in
update profiles set share_key = gen_random_uuid() where share_key is null;

-- Make username optional (no longer required for the share URL)
alter table profiles alter column username drop not null;
alter table profiles alter column username set default null;

-- Update the public profile index to also cover share_key lookups
create index if not exists profiles_share_key_idx on profiles (share_key);
