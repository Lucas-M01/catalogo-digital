begin;

create table public.horarios_funcionamento (
  id uuid primary key default gen_random_uuid(),
  dia_semana int2 not null check (dia_semana between 0 and 6),
  abre time not null,
  fecha time not null,
  check (abre <> fecha)
);
create index on public.horarios_funcionamento (dia_semana);

create table public.configuracoes_loja (
  id int2 primary key default 1 check (id = 1),
  usar_horarios boolean not null default false,
  fechada_manualmente boolean not null default false,
  reabre_em timestamptz,
  mensagem_fechada text check (char_length(mensagem_fechada) <= 200)
);
insert into public.configuracoes_loja (id) values (1) on conflict do nothing;

alter table public.horarios_funcionamento enable row level security;
alter table public.configuracoes_loja enable row level security;

create policy "leitura publica de horarios" on public.horarios_funcionamento for select using (true);
create policy "admin escreve horarios" on public.horarios_funcionamento for all to authenticated using (true) with check (true);
create policy "leitura publica da configuracao" on public.configuracoes_loja for select using (true);
create policy "admin escreve configuracao" on public.configuracoes_loja for all to authenticated using (true) with check (true);

-- A Data API exige permissões explícitas para tabelas novas.
grant select on public.horarios_funcionamento, public.configuracoes_loja to anon;
grant select, insert, update, delete
  on public.horarios_funcionamento, public.configuracoes_loja to authenticated;

-- Salvar a semana inteira de forma atômica (sem risco de ficar sem horários se falhar no meio)
create or replace function public.salvar_horarios(p_horarios jsonb)
returns void language plpgsql security invoker set search_path = public as $$
begin
  delete from public.horarios_funcionamento where true;
  insert into public.horarios_funcionamento (dia_semana, abre, fecha)
  select dia_semana, abre, fecha
  from jsonb_to_recordset(p_horarios) as x(dia_semana int2, abre time, fecha time);
end $$;
revoke execute on function public.salvar_horarios(jsonb) from public, anon;
grant execute on function public.salvar_horarios(jsonb) to authenticated;

commit;
