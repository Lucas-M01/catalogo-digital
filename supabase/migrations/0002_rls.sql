begin;

alter table public.categorias enable row level security;
alter table public.produtos   enable row level security;
alter table public.promocoes  enable row level security;

-- Leitura pública (site)
create policy "leitura publica de categorias" on public.categorias
  for select using (true);

create policy "leitura publica de produtos disponiveis" on public.produtos
  for select using (disponivel = true);

create policy "leitura publica de promocoes ativas" on public.promocoes
  for select using (inicio <= now() and (fim is null or fim > now()));

-- Dono (único usuário autenticado; cadastro público desabilitado)
create policy "admin le tudo em categorias" on public.categorias
  for select to authenticated using (true);
create policy "admin escreve categorias" on public.categorias
  for all to authenticated using (true) with check (true);

create policy "admin le tudo em produtos" on public.produtos
  for select to authenticated using (true);
create policy "admin escreve produtos" on public.produtos
  for all to authenticated using (true) with check (true);

create policy "admin le tudo em promocoes" on public.promocoes
  for select to authenticated using (true);
create policy "admin escreve promocoes" on public.promocoes
  for all to authenticated using (true) with check (true);

-- A Data API exige permissões explícitas para tabelas novas.
grant select on public.categorias, public.produtos, public.promocoes to anon;
grant select, insert, update, delete
  on public.categorias, public.produtos, public.promocoes to authenticated;

commit;
