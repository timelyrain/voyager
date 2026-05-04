-- share_key was uuid but code generates short alphanumeric strings; change to text
alter table profiles alter column share_key type text using share_key::text;
