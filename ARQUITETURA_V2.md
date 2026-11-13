# Arquitetura — Catálogo Digital v2 (Fase de Testes)

> Blueprint técnico adaptado para desenvolvimento local com mock de dados.  
> Sem Git, sem Supabase, sem Cloudflare obrigatórios — tudo isso fica nas seções opcionais ao final.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript (modo estrito) |
| Estilização | Tailwind CSS + CVA + tailwind-merge |
| Componentes | shadcn/ui (primitivos Radix UI) |
| Gerenciador | pnpm |
| Dados | Mock local (`lib/mock/produtos.ts`) |
| Linting/Format | Biome |
| MCP | Context7 (docs) + OctoCode (melhores práticas) |

---

## Filosofia Arquitetural

O projeto é organizado em camadas com responsabilidades claras. A regra principal é: **nenhuma camada importa de uma camada acima dela**.

A camada de dados (`lib/`) é o único ponto de contato com a fonte de dados. Hoje lê do mock — amanhã lê do Supabase. Os componentes nunca sabem de onde os dados vêm.

```
lib/mock/   → fonte de dados local (mock de produtos e categorias)
lib/        → funções de acesso a dados — única camada que muda ao trocar para Supabase
types/      → contratos TypeScript compartilhados por todo o projeto
components/ → UI pura — nunca busca dados diretamente
app/        → rotas finas — compõe componentes, chama lib/, define metadata
```

---

## Regras de Dependência entre Camadas

```
lib/mock/      → não importa nada do projeto
lib/           → importa apenas de lib/mock/ e types/
types/         → não importa nada
components/ui/ → não importa de components/ nem de lib/
components/    → importa de types/ e components/ui/
app/           → importa de lib/, components/ e types/
```

**Proibido:**
- Componentes fazendo fetch/query inline — toda lógica de dados fica em `lib/`
- `components/ui/` importar de `components/catalogo/` ou `components/carrinho/`
- `lib/` importar de `components/` ou `app/`
- Importações circulares entre componentes
- Barrel exports (`index.ts` que re-exporta tudo) — importar direto do arquivo

---

## Estrutura de Pastas Completa

```
catalogo-digital/
│
├── app/
│   ├── layout.tsx                    # RootLayout — CarrinhoProvider, fonte, lang="pt-BR"
│   ├── page.tsx                      # Página inicial — lista produtos com categorias
│   ├── not-found.tsx                 # Página 404 personalizada
│   ├── error.tsx                     # Error boundary de rota
│   ├── loading.tsx                   # Skeleton global (fallback de Suspense)
│   │
│   ├── produto/
│   │   └── [slug]/
│   │       ├── page.tsx              # Página individual do produto
│   │       ├── loading.tsx           # Skeleton da página de produto
│   │       └── not-found.tsx         # 404 do produto
│   │
│   └── busca/
│       ├── page.tsx                  # Busca com filtros — lê searchParams
│       └── loading.tsx               # Skeleton da busca
│
├── components/
│   │
│   ├── ui/                           # shadcn/ui — gerados via `pnpm dlx shadcn@latest add`
│   │   ├── button.tsx
│   │   ├── badge.tsx
│   │   ├── drawer.tsx                # Base do drawer do carrinho
│   │   ├── input.tsx
│   │   ├── scroll-area.tsx
│   │   ├── separator.tsx
│   │   ├── skeleton.tsx              # Usado nos loading states
│   │   └── sheet.tsx                 # Alternativa ao drawer
│   │
│   ├── catalogo/
│   │   ├── lista-produtos.tsx        # Server Component — grid de cards
│   │   ├── card-produto.tsx          # Server Component — card individual
│   │   ├── categorias.tsx            # Server Component — nav horizontal de categorias
│   │   ├── filtros.tsx               # 'use client' — input de busca + select de categoria
│   │   ├── skeleton-lista.tsx        # Skeleton do grid de produtos
│   │   └── estado-vazio.tsx          # Mensagem quando não há resultados
│   │
│   ├── carrinho/
│   │   ├── carrinho-provider.tsx     # 'use client' — Context + useState
│   │   ├── botao-adicionar.tsx       # 'use client' — adiciona produto ao carrinho
│   │   ├── drawer-carrinho.tsx       # 'use client' — bottom sheet (mobile) / lateral (desktop)
│   │   ├── lista-itens.tsx           # 'use client' — lista itens com controles de quantidade
│   │   ├── item-carrinho.tsx         # 'use client' — item individual (+ / - / remover)
│   │   ├── resumo-carrinho.tsx       # 'use client' — total + botão WhatsApp
│   │   └── botao-whatsapp.tsx        # 'use client' — monta mensagem e abre wa.me
│   │
│   └── layout/
│       ├── header.tsx                # Server Component — logo + ícone do carrinho
│       ├── icone-carrinho.tsx        # 'use client' — ícone com contador de itens
│       └── footer.tsx                # Server Component — info da loja
│
├── lib/
│   ├── mock/
│   │   └── produtos.ts               # ← DADOS MOCK — 10 produtos, 4 categorias
│   │
│   ├── produtos.ts                   # getProdutos, getProdutoBySlug, buscarProdutos...
│   ├── whatsapp.ts                   # gerarLinkWhatsApp — puro e testável
│   └── utils.ts                      # formatarPreco, gerarSlug, cn (tailwind-merge)
│
├── types/
│   └── index.ts                      # Produto, Categoria, ItemCarrinho
│
├── biome.json
├── next.config.ts
├── tailwind.config.ts                # Tokens de cor, fonte e breakpoints do projeto
├── components.json                   # Configuração do shadcn/ui
└── .env.local                        # NUMERO_WHATSAPP (único obrigatório agora)
```

---

## Path Aliases

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

Com isso, os imports ficam:
```typescript
import { getProdutos } from "@/lib/produtos"
import type { Produto } from "@/types"
import { CardProduto } from "@/components/catalogo/card-produto"
```

> O `create-next-app` já configura `@/*` por padrão — não precisa mexer manualmente.

---

## Tipos (`types/index.ts`)

```typescript
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

## Camada `lib/` — Acesso a Dados

### `lib/utils.ts`

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Função padrão do shadcn/ui — combina classes Tailwind sem conflito
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatarPreco(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function gerarSlug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}
```

### `lib/produtos.ts` — hoje usa mock, amanhã usa Supabase

```typescript
// Para migrar para Supabase: substituir as importações abaixo
// pelos clientes do Supabase. Nenhum componente muda.

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
    const matchDesc = p.descricao?.toLowerCase().includes(q) ?? false
    const matchCategoria = categoriaSlug ? p.categoria.slug === categoriaSlug : true
    return p.disponivel && (matchNome || matchDesc) && matchCategoria
  })
}
```

### `lib/whatsapp.ts`

```typescript
import type { ItemCarrinho } from "@/types"
import { formatarPreco } from "@/lib/utils"

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
```

---

## Camada `components/` — UI

### Convenções obrigatórias

- **Server Component por padrão** — sem `'use client'` a menos que precise de estado ou evento
- **`'use client'` mínimo** — só nos componentes que realmente interagem com o usuário
- **Sem fetch inline** — nunca chamar `lib/` de dentro de um Client Component; passar dados via props
- **Props tipadas** — nunca usar `any`
- **`type` em vez de `interface`** — `type Props = { ... }`

### Quem é `'use client'` e por quê

| Componente | Motivo |
|---|---|
| `carrinho-provider.tsx` | `useState` do carrinho |
| `botao-adicionar.tsx` | `onClick` + `useCarrinho` |
| `drawer-carrinho.tsx` | estado de aberto/fechado |
| `lista-itens.tsx` | controles de quantidade |
| `item-carrinho.tsx` | `onClick` de + / - / remover |
| `resumo-carrinho.tsx` | lê do contexto do carrinho |
| `botao-whatsapp.tsx` | `onClick` + gera link dinâmico |
| `icone-carrinho.tsx` | lê contador do contexto |
| `filtros.tsx` | `onChange` do input de busca |

### `components/carrinho/carrinho-provider.tsx`

```typescript
"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Produto, ItemCarrinho } from "@/types"

type CarrinhoContextType = {
  itens: ItemCarrinho[]
  total: number
  totalItens: number
  adicionar: (produto: Produto, quantidade?: number) => void
  remover: (produtoId: string) => void
  alterarQuantidade: (produtoId: string, quantidade: number) => void
  limpar: () => void
}

const CarrinhoContext = createContext<CarrinhoContextType | null>(null)

export function CarrinhoProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>([])

  const adicionar = (produto: Produto, quantidade = 1) => {
    setItens((prev) => {
      const existente = prev.find((i) => i.produto.id === produto.id)
      if (existente) {
        return prev.map((i) =>
          i.produto.id === produto.id
            ? { ...i, quantidade: i.quantidade + quantidade }
            : i
        )
      }
      return [...prev, { produto, quantidade }]
    })
  }

  const remover = (produtoId: string) =>
    setItens((prev) => prev.filter((i) => i.produto.id !== produtoId))

  const alterarQuantidade = (produtoId: string, quantidade: number) => {
    if (quantidade <= 0) return remover(produtoId)
    setItens((prev) =>
      prev.map((i) => (i.produto.id === produtoId ? { ...i, quantidade } : i))
    )
  }

  const limpar = () => setItens([])

  const total = itens.reduce(
    (acc, i) => acc + (i.produto.preco_promocional ?? i.produto.preco) * i.quantidade,
    0
  )
  const totalItens = itens.reduce((acc, i) => acc + i.quantidade, 0)

  return (
    <CarrinhoContext.Provider
      value={{ itens, total, totalItens, adicionar, remover, alterarQuantidade, limpar }}
    >
      {children}
    </CarrinhoContext.Provider>
  )
}

export function useCarrinho(): CarrinhoContextType {
  const ctx = useContext(CarrinhoContext)
  if (!ctx) throw new Error("useCarrinho deve ser usado dentro de CarrinhoProvider")
  return ctx
}
```

### `components/catalogo/card-produto.tsx`

```typescript
import Image from "next/image"
import Link from "next/link"
import type { Produto } from "@/types"
import { formatarPreco } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { BotaoAdicionar } from "@/components/carrinho/botao-adicionar"

type Props = { produto: Produto }

export function CardProduto({ produto }: Props) {
  const preco = produto.preco_promocional ?? produto.preco
  const temPromocao = produto.preco_promocional !== null

  return (
    <article className="flex flex-col rounded-xl border bg-white shadow-sm overflow-hidden">
      {/* Imagem — proporção fixa para consistência no mobile */}
      <Link href={`/produto/${produto.slug}`} className="relative aspect-square block">
        {produto.imagem_url ? (
          <Image
            src={produto.imagem_url}
            alt={produto.nome}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400 text-sm">Sem imagem</span>
          </div>
        )}
        {temPromocao && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white">
            Promoção
          </Badge>
        )}
      </Link>

      {/* Informações */}
      <div className="flex flex-col gap-2 p-3 flex-1">
        <Link href={`/produto/${produto.slug}`}>
          <h2 className="font-semibold text-sm leading-tight line-clamp-2">
            {produto.nome}
          </h2>
        </Link>

        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex flex-col">
            {temPromocao && (
              <span className="text-xs text-gray-400 line-through">
                {formatarPreco(produto.preco)}
              </span>
            )}
            <span className="font-bold text-base text-green-700">
              {formatarPreco(preco)}
            </span>
          </div>

          {/* Botão com tamanho mínimo de 48px para toque mobile */}
          <BotaoAdicionar produto={produto} />
        </div>
      </div>
    </article>
  )
}
```

### `components/catalogo/lista-produtos.tsx`

```typescript
import type { Produto } from "@/types"
import { CardProduto } from "@/components/catalogo/card-produto"
import { EstadoVazio } from "@/components/catalogo/estado-vazio"

type Props = { produtos: Produto[] }

export function ListaProdutos({ produtos }: Props) {
  if (produtos.length === 0) return <EstadoVazio />

  return (
    // Mobile first: 2 colunas no celular, 3 no tablet, 4 no desktop
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {produtos.map((produto) => (
        <li key={produto.id}>
          <CardProduto produto={produto} />
        </li>
      ))}
    </ul>
  )
}
```

### `components/catalogo/categorias.tsx`

```typescript
import Link from "next/link"
import type { Categoria } from "@/types"
import { cn } from "@/lib/utils"

type Props = {
  categorias: Categoria[]
  categoriaAtiva?: string
}

export function Categorias({ categorias, categoriaAtiva }: Props) {
  return (
    // Scroll horizontal no mobile, wrap no desktop
    <nav className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible">
      <Link
        href="/"
        className={cn(
          "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
          !categoriaAtiva
            ? "bg-black text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        )}
      >
        Todos
      </Link>
      {categorias.map((cat) => (
        <Link
          key={cat.id}
          href={`/busca?categoria=${cat.slug}`}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            categoriaAtiva === cat.slug
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          {cat.nome}
        </Link>
      ))}
    </nav>
  )
}
```

---

## Camada `app/` — Rotas

### Estratégia de renderização

| Rota | Estratégia | Motivo |
|---|---|---|
| `/` | Server Component padrão | Lê do mock — sem necessidade de cache |
| `/produto/[slug]` | Server Component + `generateStaticParams` | Gera todas as páginas na build |
| `/busca` | Server Component com `searchParams` | Filtra por query string |

> Quando o Supabase entrar: adicionar `revalidate = 300` em `/` e `/produto/[slug]`.

### `app/layout.tsx`

```typescript
import type { Metadata } from "next"
import { CarrinhoProvider } from "@/components/carrinho/carrinho-provider"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export const metadata: Metadata = {
  title: "Cardápio Digital",
  description: "Faça seu pedido e envie pelo WhatsApp.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gray-50 flex flex-col">
        <CarrinhoProvider>
          <Header />
          <main className="flex-1 container mx-auto px-4 py-6 max-w-5xl">
            {children}
          </main>
          <Footer />
        </CarrinhoProvider>
      </body>
    </html>
  )
}
```

### `app/page.tsx`

```typescript
import { getProdutos, getCategorias } from "@/lib/produtos"
import { ListaProdutos } from "@/components/catalogo/lista-produtos"
import { Categorias } from "@/components/catalogo/categorias"

export default async function HomePage() {
  const [produtos, categorias] = await Promise.all([
    getProdutos(),
    getCategorias(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <Categorias categorias={categorias} />
      <ListaProdutos produtos={produtos} />
    </div>
  )
}
```

### `app/produto/[slug]/page.tsx`

```typescript
import { getProdutoBySlug, getProdutos } from "@/lib/produtos"
import { notFound } from "next/navigation"
import Image from "next/image"
import type { Metadata } from "next"
import { formatarPreco } from "@/lib/utils"
import { BotaoAdicionar } from "@/components/carrinho/botao-adicionar"

type Props = { params: Promise<{ slug: string }> }

// Gera todas as páginas de produto na build
export async function generateStaticParams() {
  const produtos = await getProdutos()
  return produtos.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const produto = await getProdutoBySlug(slug)
  if (!produto) return {}
  return { title: produto.nome, description: produto.descricao ?? undefined }
}

export default async function ProdutoPage({ params }: Props) {
  const { slug } = await params
  const produto = await getProdutoBySlug(slug)
  if (!produto) notFound()

  const preco = produto.preco_promocional ?? produto.preco

  return (
    // Stack no mobile, lado a lado no desktop
    <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
      {/* Imagem */}
      <div className="relative aspect-square w-full md:w-1/2 rounded-xl overflow-hidden">
        {produto.imagem_url ? (
          <Image
            src={produto.imagem_url}
            alt={produto.nome}
            fill
            priority
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100" />
        )}
      </div>

      {/* Informações */}
      <div className="flex flex-col gap-4 md:flex-1">
        <div>
          <span className="text-sm text-gray-500">{produto.categoria.nome}</span>
          <h1 className="text-2xl font-bold mt-1">{produto.nome}</h1>
        </div>

        {produto.descricao && (
          <p className="text-gray-600 text-sm leading-relaxed">{produto.descricao}</p>
        )}

        <div className="flex flex-col">
          {produto.preco_promocional && (
            <span className="text-sm text-gray-400 line-through">
              {formatarPreco(produto.preco)}
            </span>
          )}
          <span className="text-2xl font-bold text-green-700">
            {formatarPreco(preco)}
          </span>
        </div>

        {/* Botão largo no mobile */}
        <BotaoAdicionar produto={produto} className="w-full md:w-auto" />
      </div>
    </div>
  )
}
```

### `app/busca/page.tsx`

```typescript
import { buscarProdutos, getCategorias } from "@/lib/produtos"
import { ListaProdutos } from "@/components/catalogo/lista-produtos"
import { Categorias } from "@/components/catalogo/categorias"
import { Filtros } from "@/components/catalogo/filtros"

type Props = {
  searchParams: Promise<{ q?: string; categoria?: string }>
}

export default async function BuscaPage({ searchParams }: Props) {
  const { q = "", categoria } = await searchParams
  const [produtos, categorias] = await Promise.all([
    buscarProdutos(q, categoria),
    getCategorias(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <Filtros q={q} categoriaAtiva={categoria} />
      <Categorias categorias={categorias} categoriaAtiva={categoria} />
      <ListaProdutos produtos={produtos} />
    </div>
  )
}
```

---

## Mobile First — Padrões de Implementação

### Regra de ouro

```typescript
// ✅ Correto — mobile first (base sem prefixo, cresce com md: lg:)
<div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
<div className="flex flex-col gap-4 md:flex-row md:gap-10">
<button className="w-full md:w-auto">

// ❌ Errado — desktop first (quebra em telas menores)
<div className="grid grid-cols-4 gap-4 sm:grid-cols-2">
```

### Tamanhos mínimos de toque

Qualquer elemento interativo deve ter no mínimo **48×48px** de área clicável:

```typescript
// ✅ Botão de adicionar — mínimo 48px de altura
<button className="min-h-[48px] min-w-[48px] px-4">

// ✅ Links de categoria
<a className="py-2 px-4"> {/* py-2 = 8px top+bottom + fonte = ~36px; compensar com min-h */}
```

### Drawer do carrinho — comportamento por breakpoint

| Breakpoint | Comportamento |
|---|---|
| Mobile (< 768px) | Bottom sheet — abre de baixo para cima |
| Desktop (≥ 768px) | Sheet lateral — abre da direita |

```typescript
// drawer-carrinho.tsx
// No mobile: Sheet com side="bottom"
// No desktop: Sheet com side="right"
// Implementar com useMediaQuery ou classes Tailwind no wrapper
```

### Imagens responsivas — `sizes` correto

```typescript
// Card no grid (2 col mobile / 3 tablet / 4 desktop)
<Image
  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
/>

// Imagem de destaque na página do produto
<Image
  sizes="(max-width: 768px) 100vw, 50vw"
  priority  // ← obrigatório na imagem principal acima do fold
/>
```

---

## Checklist de Setup Inicial

```bash
# 1. Criar projeto
pnpm create next-app@latest catalogo-digital
# TypeScript: Yes | ESLint: No | Tailwind: Yes | src/: No | App Router: Yes | Turbopack: Yes | Alias: No

# 2. Instalar Biome
pnpm add -D --save-exact @biomejs/biome
pnpm biome init

# 3. Instalar shadcn/ui
pnpm dlx shadcn@latest init

# 4. Instalar dependências adicionais (tailwind-merge + clsx para cn())
pnpm add tailwind-merge clsx

# 5. Configurar React Compiler no next.config.ts
# (ver seção de configurações abaixo)

# 6. Criar estrutura de pastas
mkdir -p components/{ui,catalogo,carrinho,layout} lib/mock types

# 7. Criar arquivos base
# types/index.ts → tipos Produto, Categoria, ItemCarrinho
# lib/mock/produtos.ts → 10 produtos de exemplo
# lib/produtos.ts → funções que leem do mock
# lib/whatsapp.ts → gerarLinkWhatsApp
# lib/utils.ts → cn, formatarPreco, gerarSlug

# 8. Configurar .env.local
echo "NUMERO_WHATSAPP=5583999999999" > .env.local
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
      {
        protocol: "https",
        hostname: "images.unsplash.com", // imagens do mock
      },
      // Supabase Storage — descomentar quando ligar o banco
      // { protocol: "https", hostname: "*.supabase.co" },
      // Cloudinary — descomentar se adicionar painel admin
      // { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
}

export default nextConfig
```

### `biome.json`

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.0/schema.json",
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": { "recommended": true }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  }
}
```

---

## Convenções Obrigatórias

| Regra | Motivo |
|---|---|
| `type` em vez de `interface` | Consistência — `type` é mais flexível |
| Funções puras em `lib/` | Fácil de trocar a fonte de dados |
| Sem `useEffect` para dados | Usar Server Components |
| Sem `useMemo`/`useCallback`/`memo` | React Compiler cuida disso |
| `'use client'` mínimo | Performance — menos JS no cliente |
| Import direto (sem barrel) | `@/components/catalogo/card-produto` |
| Props sempre tipadas | Nunca `any` |

---

## ⚡ Seções Opcionais — Ligar quando precisar

---

### 🗄️ Supabase — Banco de Dados

**Quando ligar:** quando precisar persistir produtos em banco real.

```bash
pnpm add @supabase/supabase-js
```

#### `lib/supabase.ts` (server-side)

```typescript
import { createClient } from "@supabase/supabase-js"

// Nunca importar em componentes 'use client'
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

#### `lib/supabase-client.ts` (browser — somente leitura)

```typescript
"use client"
import { createClient } from "@supabase/supabase-js"

export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

#### `lib/produtos.ts` com Supabase (substitui o mock inteiro)

```typescript
import { supabase } from "@/lib/supabase"
import type { Produto, Categoria } from "@/types"

export async function getProdutos(): Promise<Produto[]> {
  const { data, error } = await supabase
    .from("produtos")
    .select("*, categoria:categorias(id, nome, slug, ordem)")
    .eq("disponivel", true)
    .order("ordem")
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getProdutoBySlug(slug: string): Promise<Produto | null> {
  const { data } = await supabase
    .from("produtos")
    .select("*, categoria:categorias(id, nome, slug, ordem)")
    .eq("slug", slug)
    .eq("disponivel", true)
    .single()
  return data ?? null
}

export async function getCategorias(): Promise<Categoria[]> {
  const { data } = await supabase
    .from("categorias")
    .select("*")
    .order("ordem")
  return data ?? []
}

export async function buscarProdutos(query: string, categoriaSlug?: string): Promise<Produto[]> {
  let q = supabase
    .from("produtos")
    .select("*, categoria:categorias(id, nome, slug, ordem)")
    .eq("disponivel", true)
    .ilike("nome", `%${query}%`)

  if (categoriaSlug) {
    // Filtro por categoria via join — ajustar conforme estrutura real do banco
    q = q.eq("categorias.slug", categoriaSlug)
  }

  const { data } = await q.order("ordem")
  return data ?? []
}
```

#### `.env.local` com Supabase

```env
NUMERO_WHATSAPP=5583999999999
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # somente server-side, nunca expor no cliente
```

#### ISR — adicionar após ligar o Supabase

```typescript
// app/page.tsx e app/produto/[slug]/page.tsx
export const revalidate = 300  // revalida a cada 5 minutos
```

#### Keepalive — Supabase Free pausa após 1 semana sem acesso

```typescript
// app/api/keepalive/route.ts
import { supabase } from "@/lib/supabase"

export async function GET() {
  await supabase.from("produtos").select("id").limit(1)
  return Response.json({ ok: true })
}
```

Configure um cron externo em [cron-job.org](https://cron-job.org) para chamar `/api/keepalive` a cada 3 dias.

---

### ☁️ Cloudflare Workers — Deploy

**Quando ligar:** quando o projeto estiver pronto para produção.

```bash
pnpm add -D @opennextjs/cloudflare wrangler
```

#### `wrangler.toml`

```toml
name = "catalogo-digital"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]

[vars]
NUMERO_WHATSAPP = ""
# NEXT_PUBLIC_SUPABASE_URL = ""
# NEXT_PUBLIC_SUPABASE_ANON_KEY = ""
```

#### `package.json` — scripts de deploy

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

> Cloudflare **Pages** está depreciado para Next.js — usar Workers + OpenNext.

---

### 🐙 Git — Quando quiser versionar

```bash
git init
git checkout -b develop
```

Estrutura sugerida quando chegar a hora:
```
main      ← produção
develop   ← integração
feat/*    ← features em desenvolvimento
```

---

*Arquitetura atualizada em maio de 2026.*
