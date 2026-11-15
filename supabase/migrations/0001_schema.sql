begin;

create table public.categorias (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(nome) between 1 and 60),
  slug text not null unique,
  ordem int2 not null default 0,
  criado_em timestamptz not null default now()
);

create table public.produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(nome) between 1 and 120),
  slug text not null unique,
  descricao text check (char_length(descricao) <= 1000),
  preco numeric(10,2) not null check (preco >= 0),
  imagem_url text,
  imagem_path text,                       -- só quando a imagem está no Storage
  categoria_id uuid not null references public.categorias(id) on delete restrict,
  disponivel boolean not null default true,
  destaque boolean not null default false,
  ordem int2 not null default 0,
  criado_em timestamptz not null default now()
);

create table public.promocoes (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references public.produtos(id) on delete cascade,
  preco_promocional numeric(10,2) not null check (preco_promocional >= 0),
  inicio timestamptz not null default now(),
  fim timestamptz,                        -- null = sem data de término
  criado_em timestamptz not null default now(),
  check (fim is null or fim > inicio)
);

create index on public.produtos (categoria_id);
create index on public.produtos (disponivel);
create index on public.promocoes (produto_id);
create index on public.promocoes (inicio, fim);

commit;
