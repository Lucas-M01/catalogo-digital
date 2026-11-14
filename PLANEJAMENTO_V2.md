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
- Cards em 2 colunas no mobile, 3 no tablet e 4 no desktop após a revisão visual do Stitch
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
- [ ] Testar performance no PageSpeed Mobile (meta: acima de 85)

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

### 🗄️ Supabase — Banco de Dados

**Quando ligar:** quando o cliente precisar cadastrar produtos sem precisar de você.

#### Passos
1. Criar conta em supabase.com e novo projeto
2. Instalar: `pnpm add @supabase/supabase-js`
3. Criar `lib/supabase.ts` (server) e `lib/supabase-client.ts` (browser)
4. Descomentar variáveis no `.env.local`
5. Substituir o conteúdo de `lib/produtos.ts` pelas queries do Supabase

#### SQL — Tabelas e RLS

```sql
-- Categorias
create table categorias (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  ordem int default 0,
  criado_em timestamptz default now()
);

-- Produtos
create table produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  descricao text,
  preco numeric(10,2) not null,
  preco_promocional numeric(10,2),
  imagem_url text,
  categoria_id uuid references categorias(id),
  disponivel boolean default true,
  destaque boolean default false,
  ordem int default 0,
  criado_em timestamptz default now()
);

create index on produtos(categoria_id);
create index on produtos(disponivel);
create index on produtos(slug);

-- RLS — leitura pública
alter table produtos enable row level security;
alter table categorias enable row level security;

create policy "Leitura pública de produtos"
  on produtos for select using (disponivel = true);

create policy "Leitura pública de categorias"
  on categorias for select using (true);
```

#### `lib/produtos.ts` com Supabase (substitui o mock)

```typescript
import { supabase } from "@/lib/supabase"
import type { Produto, Categoria } from "@/types"

export async function getProdutos(): Promise<Produto[]> {
  const { data, error } = await supabase
    .from("produtos")
    .select("*, categorias(id, nome, slug, ordem)")
    .eq("disponivel", true)
    .order("ordem")
  if (error) throw new Error(error.message)
  return data ?? []
}

// ... demais funções
```

#### Keepalive (Supabase Free pausa após 1 semana sem acesso)

```typescript
// app/api/keepalive/route.ts
import { supabase } from "@/lib/supabase"

export async function GET() {
  await supabase.from("produtos").select("id").limit(1)
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
