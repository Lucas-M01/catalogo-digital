# Catálogo Digital — Planejamento v2 (Fase de Testes)

> Versão adaptada para desenvolvimento local sem Git, usando pnpm, mock de dados e foco em mobile first.  
> Supabase e Cloudflare estão documentados ao final como seções opcionais — fáceis de ligar quando chegar a hora.

---

## Visão Geral

Site de catálogo digital para loja com envio de pedidos via WhatsApp. O cliente navega pelos produtos, monta um carrinho e envia o pedido completo em uma única mensagem.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn/ui  
**Gerenciador:** pnpm  
**Dados:** Mock local (arquivo `.ts`) — sem banco de dados no momento  
**Ferramentas:** Biome · React Compiler · Turbopack  
**Mobile first:** layout pensado para celular, expandido progressivamente para desktop

---

## Regras do Projeto

- Sempre usar App Router — nunca Pages Router
- **Mobile first obrigatório** — todo CSS começa pelo breakpoint `sm` (320px) e cresce com `md:`, `lg:`
- Componentes são Server Components por padrão — só usar `'use client'` quando houver interação (estado, eventos, carrinho)
- Não usar `useMemo`, `useCallback` ou `memo` manualmente — o React Compiler cuida disso
- Seguir as regras do React estritamente para o compiler funcionar — nunca mutar estado diretamente
- Componentes pequenos e focados — um componente, uma responsabilidade
- Toda lógica de dados fica em `lib/` — nunca inline nos componentes
- **Dados vêm do mock** durante o desenvolvimento — a troca para Supabase é feita só em `lib/produtos.ts`, sem tocar em nenhum componente

---

## Estrutura de Pastas

```
├── app/
│   ├── layout.tsx                  # Layout global com fonte e providers
│   ├── page.tsx                    # Página inicial — listagem do catálogo
│   ├── produto/
│   │   └── [slug]/
│   │       ├── page.tsx            # Página individual do produto
│   │       └── loading.tsx         # Skeleton de loading
│   └── busca/
│       └── page.tsx                # Resultados de busca e filtro
│
├── components/
│   ├── ui/                         # Componentes shadcn/ui (gerados automaticamente)
│   ├── catalogo/
│   │   ├── lista-produtos.tsx      # Grid de produtos (Server Component)
│   │   ├── card-produto.tsx        # Card individual (Server Component)
│   │   ├── filtros.tsx             # Barra de filtros e busca ('use client')
│   │   └── categorias.tsx          # Navegação por categorias
│   └── carrinho/
│       ├── carrinho-provider.tsx   # Context do carrinho ('use client')
│       ├── botao-adicionar.tsx     # Botão de adicionar ('use client')
│       ├── drawer-carrinho.tsx     # Drawer lateral com resumo ('use client')
│       └── botao-whatsapp.tsx      # Gera link e abre WhatsApp ('use client')
│
├── lib/
│   ├── mock/
│   │   └── produtos.ts             # ← DADOS MOCK — trocar por Supabase depois
│   ├── produtos.ts                 # Funções de acesso a dados (lê do mock agora)
│   └── whatsapp.ts                 # Geração do link wa.me
│
├── types/
│   └── index.ts                    # Tipos TypeScript (Produto, Categoria, ItemCarrinho)
│
├── biome.json
└── next.config.ts
```

---

## Mock de Produtos

O arquivo `lib/mock/produtos.ts` simula o banco de dados durante o desenvolvimento.  
Quando o Supabase for ligado, **apenas `lib/produtos.ts` é alterado** — o resto do projeto não muda.

```typescript
// lib/mock/produtos.ts

import type { Produto, Categoria } from "@/types"

export const categoriasMock: Categoria[] = [
  { id: "1", nome: "Lanches", slug: "lanches", ordem: 1 },
  { id: "2", nome: "Bebidas", slug: "bebidas", ordem: 2 },
  { id: "3", nome: "Sobremesas", slug: "sobremesas", ordem: 3 },
  { id: "4", nome: "Combos", slug: "combos", ordem: 4 },
]

export const produtosMock: Produto[] = [
  // ── Lanches ──────────────────────────────────────────────────────
  {
    id: "p1",
    nome: "X-Burguer Clássico",
    slug: "x-burguer-classico",
    descricao: "Pão brioche, hambúrguer 150g, queijo cheddar, alface, tomate e maionese especial.",
    preco: 22.90,
    preco_promocional: null,
    imagem_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
    categoria: { id: "1", nome: "Lanches", slug: "lanches" },
    disponivel: true,
    destaque: true,
    ordem: 1,
  },
  {
    id: "p2",
    nome: "X-Bacon Duplo",
    slug: "x-bacon-duplo",
    descricao: "Dois hambúrgueres 150g, bacon crocante, queijo prato, cebola caramelizada.",
    preco: 32.90,
    preco_promocional: 28.90,
    imagem_url: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400",
    categoria: { id: "1", nome: "Lanches", slug: "lanches" },
    disponivel: true,
    destaque: false,
    ordem: 2,
  },
  {
    id: "p3",
    nome: "Veggie Burger",
    slug: "veggie-burger",
    descricao: "Hambúrguer de grão-de-bico, rúcula, tomate seco, homus e pão integral.",
    preco: 26.90,
    preco_promocional: null,
    imagem_url: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400",
    categoria: { id: "1", nome: "Lanches", slug: "lanches" },
    disponivel: true,
    destaque: false,
    ordem: 3,
  },
  // ── Bebidas ───────────────────────────────────────────────────────
  {
    id: "p4",
    nome: "Refrigerante Lata",
    slug: "refrigerante-lata",
    descricao: "Coca-Cola, Guaraná ou Sprite — lata 350ml gelada.",
    preco: 6.00,
    preco_promocional: null,
    imagem_url: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400",
    categoria: { id: "2", nome: "Bebidas", slug: "bebidas" },
    disponivel: true,
    destaque: false,
    ordem: 1,
  },
  {
    id: "p5",
    nome: "Milkshake 500ml",
    slug: "milkshake-500ml",
    descricao: "Chocolate, morango ou baunilha — cremoso e gelado.",
    preco: 18.00,
    preco_promocional: 15.00,
    imagem_url: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400",
    categoria: { id: "2", nome: "Bebidas", slug: "bebidas" },
    disponivel: true,
    destaque: true,
    ordem: 2,
  },
  {
    id: "p6",
    nome: "Suco Natural 300ml",
    slug: "suco-natural-300ml",
    descricao: "Laranja, limão ou maracujá — feito na hora.",
    preco: 10.00,
    preco_promocional: null,
    imagem_url: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400",
    categoria: { id: "2", nome: "Bebidas", slug: "bebidas" },
    disponivel: true,
    destaque: false,
    ordem: 3,
  },
  // ── Sobremesas ────────────────────────────────────────────────────
  {
    id: "p7",
    nome: "Brownie com Sorvete",
    slug: "brownie-com-sorvete",
    descricao: "Brownie quentinho de chocolate com uma bola de sorvete de creme.",
    preco: 16.00,
    preco_promocional: null,
    imagem_url: "https://images.unsplash.com/photo-1606313564200-e75d5e30ef07?w=400",
    categoria: { id: "3", nome: "Sobremesas", slug: "sobremesas" },
    disponivel: true,
    destaque: true,
    ordem: 1,
  },
  {
    id: "p8",
    nome: "Petit Gâteau",
    slug: "petit-gateau",
    descricao: "Bolinho de chocolate com interior cremoso e calda de chocolate quente.",
    preco: 19.90,
    preco_promocional: null,
    imagem_url: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400",
    categoria: { id: "3", nome: "Sobremesas", slug: "sobremesas" },
    disponivel: true,
    destaque: false,
    ordem: 2,
  },
  // ── Combos ────────────────────────────────────────────────────────
  {
    id: "p9",
    nome: "Combo Família",
    slug: "combo-familia",
    descricao: "2 X-Burguer Clássico + 2 refrigerantes lata + 2 sobremesas à escolha.",
    preco: 89.90,
    preco_promocional: 79.90,
    imagem_url: "https://images.unsplash.com/photo-1619881590738-a111d176d906?w=400",
    categoria: { id: "4", nome: "Combos", slug: "combos" },
    disponivel: true,
    destaque: true,
    ordem: 1,
  },
  {
    id: "p10",
    nome: "Combo Solo",
    slug: "combo-solo",
    descricao: "1 lanche à escolha + 1 bebida lata + 1 sobremesa do dia.",
    preco: 42.00,
    preco_promocional: 36.00,
    imagem_url: "https://images.unsplash.com/photo-1594212699903-ec8a3eca368f?w=400",
    categoria: { id: "4", nome: "Combos", slug: "combos" },
    disponivel: true,
    destaque: false,
    ordem: 2,
  },
]
```

### Funções de acesso em `lib/produtos.ts`

Essas funções são o único lugar que muda quando o Supabase entrar.

```typescript
// lib/produtos.ts
// ↑ Para ligar o Supabase: substituir as importações do mock
//   pelos clientes do Supabase. Os componentes não mudam nada.

import { produtosMock, categoriasMock } from "@/lib/mock/produtos"
import type { Produto, Categoria } from "@/types"

export async function getProdutos(): Promise<Produto[]> {
  return produtosMock.filter((p) => p.disponivel)
}

export async function getProdutoBySlug(slug: string): Promise<Produto | null> {
  return produtosMock.find((p) => p.slug === slug && p.disponivel) ?? null
}

export async function getProdutosPorCategoria(categoriaSlug: string): Promise<Produto[]> {
  return produtosMock.filter(
    (p) => p.disponivel && p.categoria.slug === categoriaSlug
  )
}

export async function getCategorias(): Promise<Categoria[]> {
  return categoriasMock.sort((a, b) => a.ordem - b.ordem)
}

export async function buscarProdutos(query: string, categoriaSlug?: string): Promise<Produto[]> {
  const q = query.toLowerCase()
  return produtosMock.filter((p) => {
    const matchNome = p.nome.toLowerCase().includes(q)
    const matchCategoria = categoriaSlug ? p.categoria.slug === categoriaSlug : true
    return p.disponivel && matchNome && matchCategoria
  })
}
```

---

## Tipos TypeScript

```typescript
// types/index.ts

export type Categoria = {
  id: string
  nome: string
  slug: string
  ordem: number
}

export type Produto = {
  id: string
  nome: string
  slug: string
  descricao: string | null
  preco: number
  preco_promocional: number | null
  imagem_url: string | null
  categoria: Categoria
  disponivel: boolean
  destaque: boolean
  ordem: number
}

export type ItemCarrinho = {
  produto: Produto
  quantidade: number
}
```

---

## Mobile First — Diretrizes de Layout

Todos os componentes seguem a ordem: **base (mobile) → `md:` (tablet) → `lg:` (desktop)**.

```
// ✅ Correto — mobile first
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

// ❌ Errado — desktop first
<div className="grid grid-cols-3 gap-4 sm:grid-cols-1">
```

### Breakpoints usados

| Prefixo | Largura | Dispositivo alvo |
|---|---|---|
| (sem prefixo) | 0–767px | Celular — layout principal |
| `md:` | 768px+ | Tablet — adaptações |
| `lg:` | 1024px+ | Desktop — expansões |

### Pontos críticos de UX mobile

- Botão "Adicionar ao carrinho" sempre visível e grande (min 48px de altura — tamanho mínimo de toque)
- Drawer do carrinho abre por baixo no mobile (bottom sheet), lateral no desktop
- Cards em 1 coluna no mobile, 2 no tablet e 3 no desktop
- Filtros de categoria em scroll horizontal no mobile, vertical/sidebar no desktop
- Input de busca ocupa toda a largura no mobile
- Imagem do produto ocupa pelo menos 40% da altura do card no mobile

---

## Geração do Link WhatsApp

```typescript
// lib/whatsapp.ts
import type { ItemCarrinho } from "@/types"

export function gerarLinkWhatsApp(itens: ItemCarrinho[], numeroWhatsApp: string): string {
  const linhas = itens.map(
    (item) =>
      `• ${item.quantidade}x ${item.produto.nome} — ${formatarPreco(
        (item.produto.preco_promocional ?? item.produto.preco) * item.quantidade
      )}`
  )

  const total = itens.reduce(
    (acc, item) =>
      acc + (item.produto.preco_promocional ?? item.produto.preco) * item.quantidade,
    0
  )

  const mensagem = [
    "Olá! Gostaria de fazer um pedido:",
    "",
    "🛒 *Meu Pedido*",
    ...linhas,
    "",
    `*Total: ${formatarPreco(total)}*`,
    "",
    "Aguardo confirmação! 😊",
  ].join("\n")

  return `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`
}

export function formatarPreco(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}
```

---

## Configurações Importantes

### `.env.local`
```env
# WhatsApp — único obrigatório no momento
NEXT_PUBLIC_NUMERO_WHATSAPP=5583999999999

# Supabase — deixar comentado até ligar o banco
# NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
# SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### `next.config.ts`
```typescript
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
  },
  images: {
    remotePatterns: [
      // Unsplash — usado nas imagens do mock
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Supabase Storage — descomentar quando ligar o banco
      // {
      //   protocol: "https",
      //   hostname: "*.supabase.co",
      // },
      // Cloudinary — descomentar se adicionar painel admin
      // {
      //   protocol: "https",
      //   hostname: "res.cloudinary.com",
      // },
    ],
  },
}

export default nextConfig
```

---

## Fases de Desenvolvimento

### Fase 1 — Setup

- [x] Criar projeto: `pnpm create next-app@latest catalogo-digital`
  - TypeScript: **Yes** | ESLint: **No** | Tailwind: **Yes** | `src/`: **No** | App Router: **Yes** | Turbopack: **Yes** | Alias: **No**
- [x] Instalar Biome: `pnpm add -D --save-exact @biomejs/biome && pnpm biome init`
- [x] Configurar React Compiler no `next.config.ts`
- [x] Instalar shadcn/ui: `pnpm dlx shadcn@latest init`
- [x] Criar estrutura de pastas (`components/`, `lib/`, `types/`)
- [x] Criar `types/index.ts` com os tipos `Produto`, `Categoria`, `ItemCarrinho`
- [x] Criar `lib/mock/produtos.ts` com os 10 produtos de exemplo
- [x] Criar `lib/produtos.ts` apontando para o mock
- [x] Criar `lib/whatsapp.ts`
- [x] Configurar `.env.local` com `NEXT_PUBLIC_NUMERO_WHATSAPP`

### Fase 2 — Catálogo (leitura)

- [x] `app/page.tsx` — lista todos os produtos via `getProdutos()`
- [x] `components/catalogo/lista-produtos.tsx` — grid responsivo (1 → 2 → 3 colunas)
- [x] `components/catalogo/card-produto.tsx` — imagem, nome, preço e badge de promoção
- [x] `components/catalogo/categorias.tsx` — navegação horizontal com scroll no mobile
- [x] `app/produto/[slug]/page.tsx` — página individual com `getProdutoBySlug()`
- [x] `app/produto/[slug]/loading.tsx` — skeleton de loading
- [x] Header com logo e ícone do carrinho (contador de itens)
- [x] Footer simples

### Fase 3 — Busca e Filtros

- [x] `app/busca/page.tsx` — recebe `searchParams` e chama `buscarProdutos()`
- [x] `components/catalogo/filtros.tsx` — input de busca + seleção de categoria (`'use client'`)
- [x] Filtro para exibir apenas produtos em promoção
- [x] Estado da busca refletido na URL (fácil de compartilhar)
- [x] Estado vazio com mensagem amigável quando não há resultados

### Fase 4 — Carrinho e WhatsApp

- [x] `components/carrinho/carrinho-provider.tsx` — Context API com `useState`
- [x] Funções: `adicionar`, `remover`, `alterarQuantidade`, `limpar`
- [x] `components/carrinho/botao-adicionar.tsx` — botão em cada card
- [x] `components/carrinho/drawer-carrinho.tsx` — bottom sheet no mobile, lateral no desktop
- [x] `components/carrinho/botao-whatsapp.tsx` — monta mensagem e abre `wa.me`
- [ ] Testar mensagem no iOS e Android

### Fase 5 — Polimento Visual

- [x] Responsividade revisada em 320px, 375px, 768px, 1280px
- [x] Favicon e meta tags básicas
- [x] Imagens com `next/image` e `preload` nos quatro primeiros cards e na imagem principal do produto
- [x] Loading skeletons em todas as páginas
- [x] Cores e tipografia definidas em `app/globals.css` com `@theme inline` (Tailwind CSS 4)
- [x] Aplicar o tema escuro, os cards e o layout do detalhe com base no Stitch
- [x] Alternar entre os temas escuro e claro pelo cabeçalho e lembrar a escolha no navegador
- [x] Permitir ajustar quantidades nos cards e no detalhe, com acesso ao carrinho durante a rolagem
- [ ] Testar performance no PageSpeed Mobile (meta: acima de 85)

### Fase 6 — Supabase (pré-requisito do admin)

> O admin só faz sentido sobre o banco real. Ao final desta fase o site público deve ficar idêntico ao de hoje, agora lendo do Supabase.

- [x] Criar o projeto no Supabase (região São Paulo)
- [ ] Auth: **desabilitar** "Allow new users to sign up" e criar manualmente o usuário do dono (Authentication → Users → Add user, com e-mail confirmado)
- [x] `pnpm add @supabase/supabase-js @supabase/ssr zod slugify server-only`
- [x] `.env.example` com as variáveis públicas e `.env.local` ignorado pelo Git
- [x] `.env.local` com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [x] `lib/env.ts` — valida as variáveis do Supabase com Zod na inicialização do cliente
- [x] Escrever `supabase/migrations/0001_schema.sql`, `0002_rls.sql`, `0003_storage.sql` e `0004_seed.sql` (SQL na seção Supabase abaixo; o seed vem do mock)
- [x] Executar as quatro migrations no SQL Editor do Supabase
- [x] `lib/supabase/publico.ts` (anon, sem cookies)
- [x] Reescrever `lib/produtos.ts` com o Supabase, resolvendo a promoção ativa em `preco_promocional` (código em `ARQUITETURA_V2.md`)
- [x] `next.config.ts`: liberar o host do Storage em `remotePatterns`
- [x] `export const revalidate = 300` em `/` e `/produto/[slug]`
- [x] Criar `app/api/keepalive/route.ts`
- [ ] Configurar cron externo para chamar `/api/keepalive` a cada 3 dias
- [x] Validar com `pnpm build && pnpm start`: catálogo igual ao do mock; busca, filtros, detalhe, not-found e preços promocionais no card e na mensagem do WhatsApp
- [x] Validar com respostas simuladas: produto indisponível fica de fora e promoções futuras ou vencidas são descartadas
- [x] Depois de validado, remover `lib/mock/` (confirmar com o desenvolvedor)

### Fase 7 — Painel Admin

> Cada subfase termina com `pnpm biome check --write` e `pnpm build`, e é testada no celular.

**7A — Base e autenticação**

- [x] Route groups: mover rotas públicas para `app/(loja)/`; `Header`, `Footer` e `CarrinhoProvider` vão para `app/(loja)/layout.tsx`; `app/layout.tsx` fica só com html, body, fonte e tema
- [x] `lib/supabase/servidor.ts`, `lib/supabase/navegador.ts` e `lib/supabase/sessao.ts`
- [x] `proxy.ts` com matcher só em `/admin/:path*`
- [x] `lib/admin/auth.ts` — `exigirAdmin()` com `getUser()`
- [x] `/admin/login` (e-mail e senha, mensagem de erro genérica) e ação de sair
- [x] Layout do painel: barra inferior no mobile, lateral no desktop; `noindex`; `app/robots.ts` com `Disallow: /admin`
- [x] `/admin` — resumo (contagem de produtos, ocultos e promoções ativas) com atalhos
- [x] shadcn: `label`, `textarea`, `select`, `switch`, `alert-dialog`
- [x] Testar: `/admin` sem login redireciona; `sair()` sem sessão é rejeitada; rotas públicas seguem sem cookies, com ISR no detalhe e renderização dinâmica na home e na busca por causa de `searchParams`
- [x] Testar login válido, erro genérico e saída com uma sessão simulada na build de produção
- [ ] Validar login e saída com a conta real do dono no Supabase configurado

**7B — Categorias** (vem antes de produtos, que dependem delas)

- [x] Listar, criar, renomear e reordenar (`ordem`, `int2`)
- [x] Excluir só se não houver produtos (a FK é `on delete restrict`); mensagem clara quando bloqueado
- [x] `lib/admin/slug.ts` com `slugify` e tratamento de colisão
- [x] `lib/admin/revalidar.ts` e chamada após cada mutação

**7C — Produtos**

- [x] Lista em cards (mobile): foto, nome, preço, categoria, interruptor de disponível, busca por nome
- [x] Criar e editar: nome, descrição, preço (aceita vírgula), categoria, disponível, destaque, ordem
- [x] Excluir com `AlertDialog`; apagar também a imagem do Storage
- [x] `lib/admin/preco.ts` e schemas Zod
- [x] Slug gerado na criação e nunca alterado

---

## Checklist de Entrega (quando o projeto estiver pronto)

- [ ] Catálogo funcionando com produtos reais
- [ ] Pedido via WhatsApp testado no iOS e Android
- [ ] Layout aprovado no celular
- [ ] Performance acima de 85 no PageSpeed Mobile
- [ ] Domínio configurado (se tiver)

---

## ⚡ Seções Opcionais — Ligar quando precisar

> As seções abaixo não são necessárias agora. Estão aqui para consulta rápida quando o projeto evoluir.

---

### 🗄️ Supabase — Banco, Auth e Storage

**Quando ligar:** Fase 6 (pré-requisito do admin da Fase 7).

#### Passos
1. Criar conta em supabase.com e novo projeto (região São Paulo)
2. Auth → desabilitar cadastro público e criar o usuário do dono
3. `pnpm add @supabase/supabase-js @supabase/ssr zod slugify server-only`
4. Preencher `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` no `.env.local`
5. Executar as migrations abaixo no SQL Editor, na ordem
6. Substituir `lib/produtos.ts` pelas queries do Supabase

#### `0001_schema.sql` — tabelas

```sql
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
```

> "Preço promocional menor que o normal" e "sem sobreposição de promoções" dependem de mais de uma tabela, então são validados na Server Action, não no banco.

#### `0002_rls.sql` — leitura pública, escrita só do dono

```sql
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
```

> As políticas `to authenticated` só são seguras porque o cadastro público está desabilitado. Se um dia houver mais de um usuário, trocar por uma verificação de papel (por exemplo, uma tabela `admins`).

#### `0003_storage.sql` — bucket de imagens

```sql
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
```

#### `0004_seed.sql`

Gerar a partir de `lib/mock/produtos.ts`: 4 categorias, 10 produtos (com `imagem_url` do Unsplash, `imagem_path` nulo) e uma linha em `promocoes` para cada produto que hoje tem `preco_promocional` (`inicio = now()`, `fim = null`). Usar `slug` do mock.

#### Keepalive (Supabase Free pausa após 1 semana sem acesso)

```typescript
// app/api/keepalive/route.ts
import { supabasePublico } from "@/lib/supabase/publico"

export async function GET() {
  await supabasePublico.from("produtos").select("id").limit(1)
  return Response.json({ ok: true })
}
```

Configure um cron externo (ex: cron-job.org) para chamar `/api/keepalive` a cada 3 dias.

---

### ☁️ Cloudflare Workers — Deploy

**Quando ligar:** quando o projeto estiver pronto para produção.

#### Passos
```bash
pnpm add -D @opennextjs/cloudflare wrangler
```

#### `wrangler.toml`
```toml
name = "catalogo-digital"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]

[vars]
NEXT_PUBLIC_NUMERO_WHATSAPP = ""                  # preencher
# NEXT_PUBLIC_SUPABASE_URL = ""       # descomentar quando usar Supabase
# NEXT_PUBLIC_SUPABASE_ANON_KEY = ""  # descomentar quando usar Supabase
```

#### `package.json` — scripts
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "deploy": "opennextjs-cloudflare build && wrangler deploy",
    "preview": "opennextjs-cloudflare build && wrangler dev"
  }
}
```

> **Lembrete:** Cloudflare **Pages** está depreciado para Next.js. Usar Workers + OpenNext.

---

### 🐙 Git — Quando quiser versionar

**Quando ligar:** antes de mostrar para o cliente ou subir no GitHub.

```bash
git init
git checkout -b develop
```

Commits sugeridos (Conventional Commits):
```
feat(catalogo): adicionar grid de produtos mobile first
feat(carrinho): implementar drawer bottom sheet no mobile
fix(whatsapp): corrigir encoding de acentos na mensagem
```

---

*Planejamento atualizado em maio de 2026.*
