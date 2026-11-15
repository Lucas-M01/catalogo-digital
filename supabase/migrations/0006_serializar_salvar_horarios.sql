begin;

create or replace function public.salvar_horarios(p_horarios jsonb)
returns void language plpgsql security invoker set search_path = public as $$
begin
  -- Serializa a substituição, mesmo quando a semana está vazia.
  lock table public.horarios_funcionamento in share row exclusive mode;
  delete from public.horarios_funcionamento where true;
  insert into public.horarios_funcionamento (dia_semana, abre, fecha)
  select dia_semana, abre, fecha
  from jsonb_to_recordset(p_horarios) as x(dia_semana int2, abre time, fecha time);
end $$;

commit;
