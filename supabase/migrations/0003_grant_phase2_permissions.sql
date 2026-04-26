grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on public.profiles to authenticated, service_role;
grant select, insert, update, delete on public.taxonomy_nodes to authenticated, service_role;
grant select, insert, update, delete on public.reasoning_skills to authenticated, service_role;

grant select on public.taxonomy_nodes to anon;
grant select on public.reasoning_skills to anon;