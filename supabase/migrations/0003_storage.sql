begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('produtos', 'produtos', true, 1048576, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

-- Bucket público: as imagens abrem por URL sem política de leitura.
-- As políticas abaixo são só para o dono gerenciar os arquivos.
create policy "admin le imagens" on storage.objects
  for select to authenticated using (bucket_id = 'produtos');
create policy "admin envia imagens" on storage.objects
  for insert to authenticated with check (bucket_id = 'produtos');
create policy "admin altera imagens" on storage.objects
  for update to authenticated using (bucket_id = 'produtos');
create policy "admin remove imagens" on storage.objects
  for delete to authenticated using (bucket_id = 'produtos');

commit;
