-- Allow public read of journals so shared profile pages can show city/destination counts
create policy "Public can read country journals"
  on country_journals for select using (true);
