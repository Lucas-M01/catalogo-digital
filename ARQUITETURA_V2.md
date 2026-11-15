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
│   ├── layout.tsx                    # RootLayout — só html (lang="pt-BR"), body, fonte e tema
│   ├── not-found.tsx                 # Página 404 personalizada
│   ├── error.tsx                     # Error boundary de rota
│   ├── robots.ts                     # Disallow: /admin
│   │
│   ├── (loja)/                       # Site público — as URLs não mudam
│   │   ├── layout.tsx                # CarrinhoProvider + Header + Footer
│   │   ├── error.tsx                 # Erro de uma rota pública
│   │   ├── not-found.tsx             # 404 sob o layout da loja
│   │   ├── (inicio)/
│   │   │   ├── page.tsx              # Home com filtro por categoria
│   │   │   └── loading.tsx           # Skeleton da home
│   │   ├── produto/
│   │   │   └── [slug]/
│   │   │       ├── layout.tsx        # Garante o HTTP 404 antes de renderizar
│   │   │       ├── page.tsx          # Página individual do produto
│   │   │       └── loading.tsx       # Skeleton da página de produto
│   │   └── busca/
│   │       ├── page.tsx              # Busca com filtros — lê searchParams
│   │       └── loading.tsx           # Skeleton da busca
│   │
│   ├── (admin)/admin/                # Painel do dono da loja
│   │   ├── login/
│   │   │   ├── page.tsx              # Login (fora do layout com navegação)
│   │   │   └── actions.ts            # entrar()
│   │   └── (painel)/
│   │       ├── layout.tsx            # exigirAdmin() + navegação + noindex
│   │       ├── page.tsx              # Resumo
│   │       ├── actions.ts            # sair()
│   │       ├── produtos/
│   │       │   ├── page.tsx          # Lista em cards
│   │       │   ├── novo/page.tsx
│   │       │   ├── [id]/page.tsx     # Edição
│   │       │   ├── not-found.tsx
│   │       │   └── actions.ts        # criarProduto, atualizarProduto, alternarDisponivel, excluirProduto
│   │       ├── categorias/
│   │       │   ├── page.tsx
│   │       │   └── actions.ts
│   │       └── promocoes/
│   │           ├── page.tsx          # Ativas · Agendadas · Expiradas
│   │           ├── nova/page.tsx     # Aceita ?produto=<id>
│   │           ├── [id]/page.tsx     # Edição
│   │           ├── not-found.tsx
│   │           └── actions.ts       # criar, atualizar, encerrar, excluir
│   │
│   └── api/
│       └── keepalive/route.ts        # Evita a pausa do Supabase Free
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
│   │   ├── sheet.tsx                 # Alternativa ao drawer
│   │   ├── label.tsx                 # Fase 7
│   │   ├── textarea.tsx              # Fase 7
│   │   ├── select.tsx                # Fase 7
│   │   ├── switch.tsx                # Fase 7
│   │   └── alert-dialog.tsx          # Fase 7 — confirmação de exclusão
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
│   ├── layout/
│   │   ├── header.tsx                # Server Component — logo + ícone do carrinho
│   │   ├── icone-carrinho.tsx        # 'use client' — ícone com contador de itens
│   │   └── footer.tsx                # Server Component — info da loja
│   │
│   └── admin/                        # Fase 7
│       ├── navegacao-admin.tsx       # Barra inferior (mobile) / lateral (desktop)
│       ├── form-login.tsx            # 'use client' — useActionState
│       ├── form-categoria.tsx        # 'use client'
│       ├── form-produto.tsx          # 'use client' — recebe `action` por props
│       ├── form-promocao.tsx         # 'use client'
│       ├── upload-imagem.tsx         # 'use client' — redimensiona e envia ao Storage
│       ├── card-produto-admin.tsx    # Server Component (+ interruptor de disponível)
│       ├── botao-excluir.tsx         # 'use client' — AlertDialog de confirmação
│       ├── card-promocao.tsx
│       ├── form-encerrar-promocao.tsx
│       ├── form-sair.tsx
│       ├── interruptor-disponibilidade.tsx
│       ├── feedback-admin.tsx        # Confirmações de operação
│       └── use-foco-erro.ts          # Move o foco após erro de formulário
│
├── lib/
│   ├── env.ts                        # Variáveis de ambiente validadas com Zod
│   ├── produtos.ts                   # Leitura pública: getProdutos, getProdutoBySlug, buscarProdutos...
│   ├── whatsapp.ts                   # gerarLinkWhatsApp — puro e testável
│   ├── utils.ts                      # cn para classes CSS
│   │
│   ├── supabase/                     # Fase 6 e 7
│   │   ├── publico.ts                # anon, sem cookies — leitura pública
│   │   ├── servidor.ts               # @supabase/ssr com cookies — só admin
│   │   ├── navegador.ts              # createBrowserClient — só upload de imagem
│   │   └── sessao.ts                 # atualizarSessao() usada pelo proxy.ts
│   │
│   └── admin/                        # Fase 7 — tudo com `import "server-only"` (exceto imagem.ts)
│       ├── auth.ts                   # exigirAdmin()
│       ├── produtos.ts               # queries e mutações de produtos
│       ├── categorias.ts
│       ├── promocoes.ts              # inclui calcularStatus() e checagem de sobreposição
│       ├── schemas.ts                # schemas Zod compartilhados pelas actions
│       ├── preco.ts                  # "22,90" → 22.9
│       ├── datas.ts                  # Converte e formata horários de Brasília
│       ├── slug.ts                   # slugify + tratamento de colisão
│       ├── imagem.ts                 # ← roda no NAVEGADOR: valida, redimensiona, converte para WebP
│       └── revalidar.ts              # revalidarCatalogo()
│
├── types/
│   └── index.ts                      # Produto, Categoria, ItemCarrinho, Promocao, ProdutoAdmin, EstadoForm
│
├── proxy.ts                          # Renova a sessão e redireciona /admin/* (matcher só /admin)
├── supabase/
│   └── migrations/                   # 0001_schema · 0002_rls · 0003_storage · 0004_seed (SQL em PLANEJAMENTO_V2.md)
│
├── biome.json
├── next.config.ts
├── tailwind.config.ts                # Tokens de cor, fonte e breakpoints do projeto
├── components.json                   # Configuração do shadcn/ui
└── .env.local                        # WhatsApp + NEXT_PUBLIC_SUPABASE_URL / ANON_KEY (sem service_role)
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

Exporta `cn()` para combinar classes CSS. `formatarPreco()` é exportada por `lib/whatsapp.ts` e a geração de slug fica em `lib/admin/slug.ts`.

### `lib/produtos.ts`

A leitura usa o cliente público do Supabase e retorna apenas produtos disponíveis. O preço promocional vigente é mapeado para `preco_promocional` do tipo `Produto`.

- `getProdutos()` e `getProdutosPorCategoria(categoriaSlug)` fornecem as listas públicas.
- `getProdutoBySlug(slug)` retorna `Produto | null` e compartilha a leitura dentro da mesma requisição.
- `getCategorias()` ordena as categorias por ordem e slug.
- `buscarProdutos(query, categoriaSlug?, apenasPromocao = false)` filtra por nome e descrição, ignorando acentos, e permite mostrar apenas promoções.

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
| `/` | Server Component dinâmico com `searchParams` | Aplica o filtro de categoria e consulta o catálogo pelo cliente público |
| `/produto/[slug]` | Server Component com `revalidate = 0` | Confere a vigência da promoção a cada visita |
| `/busca` | Server Component dinâmico com `searchParams` | Aplica os filtros da URL |
| `/admin/*` | Dinâmico com cookies de sessão | O painel verifica a sessão a cada página e action protegida |

O catálogo usa o cliente público sem cookies. As mutações do painel continuam chamando `revalidarCatalogo()`.

### `app/layout.tsx`

O layout raiz define idioma, fonte e tema. [O layout da loja](app/(loja)/layout.tsx) fornece o carrinho, cabeçalho, rodapé e contêiner do conteúdo.

### `app/(loja)/(inicio)/page.tsx`

`HomePage({ searchParams }: PageProps<"/">)` lê a categoria da URL e lista os produtos disponíveis. O skeleton está no mesmo grupo.

### `app/(loja)/produto/[slug]/page.tsx`

`ProdutoPage({ params }: { params: Promise<{ slug: string }> })` mostra o preço vigente, a descrição e produtos relacionados. O layout contém a verificação de existência antes do skeleton. A página, o layout e os metadados compartilham `getProdutoBySlug()` durante a requisição.

### `app/(loja)/busca/page.tsx`

`BuscaPage({ searchParams })` lê `q`, `categoria` e `promocao` da URL. Busca as categorias e os produtos com `buscarProdutos(q, categoria, apenasPromocao)` e entrega os filtros e a lista ao componente de busca.

---

## Horário de funcionamento — Fase 8C

- O layout da loja chama `getDadosLoja()`, que lê a semana e a configuração em paralelo pelo cliente público do Supabase. Se qualquer leitura falhar, o servidor registra o erro e usa a configuração de loja aberta. A página 404 da raiz usa a mesma leitura.
- A estrutura da loja passa os dados serializáveis ao `LojaProvider`. O status começa desconhecido no HTML e na primeira renderização no navegador. O efeito inicializa o relógio depois da hidratação, atualiza a cada 30 segundos e consulta a hora novamente quando a aba fica visível. O cálculo sempre usa `America/Fortaleza`.
- A faixa abaixo do cabeçalho anuncia o fechamento e a próxima abertura, ou o horário de fechamento quando faltam até 30 minutos. O rodapé agrupa dias consecutivos com horários iguais quando a grade está ativa.
- O carrinho permite adicionar e editar itens em qualquer horário. O botão do WhatsApp fica desabilitado enquanto o status é desconhecido ou a loja está fechada. O clique recalcula o status com o instante atual antes de abrir o link.
- O fluxo preserva a renderização descrita acima. A home e a busca resolvem os filtros da URL por requisição, e o detalhe consulta o preço vigente com `revalidate = 0`. A mutação do painel chama `revalidarCatalogo()`. A próxima requisição recebe a configuração nova, e a aba aberta reavalia o relógio com a grade que recebeu.

---

## Admin — Fases 6 e 7

### Fluxo

```
Dono → /admin/login → Server Action entrar() → cookie de sessão (@supabase/ssr)
     → páginas admin (Server Components, exigirAdmin())
     → formulários (Client Components, useActionState)
     → Server Actions (exigirAdmin → Zod → lib/admin → revalidarCatalogo)
     → Supabase com a sessão do dono (RLS `to authenticated`)
```

### Segurança em camadas

| Camada | O que faz | Basta sozinha? |
|---|---|---|
| Cadastro público desabilitado | Só o dono existe como usuário | Não, mas é pré-requisito das políticas abaixo |
| `proxy.ts` | Renova a sessão e redireciona quem não está logado | **Não** — é conveniência, não segurança |
| `exigirAdmin()` em cada página e action protegida | Confere o usuário com `getUser()` | Sim, para a aplicação |
| RLS (`to authenticated`) | Só a sessão do dono escreve no banco e no Storage | Última barreira, no banco |

> Server Actions são endpoints públicos: qualquer um pode chamá-las com `fetch`. Por isso `exigirAdmin()` é a **primeira instrução** de cada action protegida. `entrar()` valida as credenciais com Zod e inicia a sessão com `signInWithPassword()`. Layouts não são re-renderizados a cada navegação, então a checagem também vai em cada página, não só no layout.

### Três clientes Supabase

| Arquivo | Chave | Cookies | Uso |
|---|---|---|---|
| `lib/supabase/publico.ts` | anon | Não | Leitura pública sem acesso à sessão administrativa |
| `lib/supabase/servidor.ts` | anon + sessão do dono | Sim | Páginas e actions do admin |
| `lib/supabase/navegador.ts` | anon + sessão do dono | Sim | Somente o upload de imagem |

Nenhum usa `service_role`.

`lerEnvSupabase()`, em `lib/env.ts`, valida as duas variáveis públicas. `publico.ts` exporta `supabasePublico` sem persistência de sessão. `criarClienteServidor()` é assíncrona e integra os cookies do Next ao cliente Supabase. `criarClienteNavegador()` devolve o cliente para upload com a sessão do dono.

```typescript
// proxy.ts (Next 16: o antigo "middleware" agora se chama "proxy")
import type { NextRequest } from "next/server"
import { atualizarSessao } from "@/lib/supabase/sessao"

export function proxy(request: NextRequest) {
  return atualizarSessao(request)
}

export const config = { matcher: ["/admin/:path*"] }
```

`lib/supabase/sessao.ts` segue o template oficial do `@supabase/ssr` para Next.js (consultar o Context7): cria o cliente a partir dos cookies da requisição, confere o usuário, **redireciona para `/admin/login`** se não houver sessão e a rota não for a de login, e **redireciona para `/admin`** se já houver sessão e a rota for a de login. O matcher cobre só `/admin`, então o site público não paga esse custo.

`exigirAdmin()`, em `lib/admin/auth.ts`, verifica `getUser()` e devolve `{ supabase, user }`. Uma sessão ausente ou inválida redireciona para `/admin/login`. O resultado é compartilhado apenas dentro da renderização atual.

### Padrão de Server Action

```typescript
// app/(admin)/admin/(painel)/categorias/actions.ts
"use server"

import { z } from "zod"
import { exigirAdmin } from "@/lib/admin/auth"
import { inserirCategoria } from "@/lib/admin/categorias"
import { revalidarCatalogo } from "@/lib/admin/revalidar"
import type { EstadoForm } from "@/types"

const schema = z.object({
  nome: z.string().trim().min(1, "Informe o nome").max(60, "Máximo de 60 caracteres"),
  ordem: z.string("Informe a ordem.").trim().regex(/^\d{1,3}$/, "Informe um número inteiro de 0 a 999.").transform(Number),
})

export async function criarCategoria(
  _estado: EstadoForm,
  formData: FormData
): Promise<EstadoForm> {
  const { supabase } = await exigirAdmin()                 // 1. autorização

  const dados = schema.safeParse(Object.fromEntries(formData)) // 2. validação
  if (!dados.success) {
    // Zod 4: z.flattenError(dados.error).fieldErrors · Zod 3: dados.error.flatten().fieldErrors
    return { ok: false, erros: z.flattenError(dados.error).fieldErrors }
  }

  const resultado = await inserirCategoria(supabase, dados.data) // 3. escrita
  if (!resultado.ok) return { ok: false, mensagem: resultado.mensagem }

  revalidarCatalogo()                                      // 4. cache
  return { ok: true, mensagem: "Categoria criada." }
}
```

`inserirCategoria(supabase, dados)` usa `gerarSlugDisponivel(supabase, "categorias", dados.nome)` para procurar sufixos livres. Se uma gravação concorrente usar o mesmo slug, consulta novamente antes de tentar inserir.

```typescript
// lib/admin/revalidar.ts
import "server-only"
import { revalidatePath } from "next/cache"

// Catálogo pequeno: invalidar tudo é mais simples e seguro que listar rotas.
export function revalidarCatalogo() {
  revalidatePath("/", "layout")
}
```

`FormCategoria({ action, categoria, campo })` usa `useActionState()` para enviar os dados e controlar o estado de envio. `useFocoErro(estado, pendente)` aponta o foco para o primeiro campo inválido. Sucessos são informados em `<output>` e erros identificados por `role="alert"` e `aria-describedby`.

Regras do padrão: `FormData` entra como `unknown` e só vira dado tipado depois do Zod; erro de validação é **retorno**, não exceção; mensagem do Supabase nunca vai crua para a tela; a página (Server Component) importa a action e passa por props.

### Preço, slug e datas

- **Preço:** `lib/admin/preco.ts` converte texto pt-BR para número (`"1.234,50"` → `1234.5`) e rejeita o que não for número válido, negativo ou acima de `99999999.99`. Usado em produtos e promoções.
- **Slug:** gerado na criação por `gerarSlugDisponivel()` de `lib/admin/slug.ts`, com `slugify`. Colisões recebem `-2`, `-3` e assim por diante. A restrição de unicidade cobre gravações concorrentes. A edição mantém o slug original.
- **Datas de promoção:** o formulário usa `datetime-local`; o servidor interpreta como horário de Brasília (`-03:00`, sem horário de verão) e grava `timestamptz`.

### Imagens

1. `components/admin/upload-imagem.tsx` (client) recebe o arquivo (galeria ou câmera).
2. `lib/admin/imagem.ts` valida o tipo (JPEG, PNG, WebP) e o tamanho de origem (máx. 8 MB), redimensiona para no máximo 1200 px no lado maior e converte para WebP (~qualidade 0,8) via canvas. O bucket aceita até 1 MB.
3. Envia direto ao bucket `produtos` como `<uuid>.webp` com o cliente do navegador (sessão do dono). Isso evita o limite de corpo das Server Actions e do Worker.
4. Preenche dois campos ocultos: `imagem_url` (URL pública) e `imagem_path` (`<uuid>.webp`).
5. A action **valida**: `imagem_url` deve começar com `${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/produtos/` e `imagem_path` deve casar com `^[0-9a-f-]{36}\.webp$`. Sem isso, qualquer URL poderia ser gravada.
6. Ao trocar a imagem ou excluir o produto, a action remove o arquivo antigo do Storage (depois que o banco confirmou a escrita).
7. Imagens enviadas e nunca salvas ficam órfãs. Aceitável no MVP; limpeza manual pelo painel do Supabase se necessário.

### Promoções

```typescript
// lib/admin/promocoes.ts (trechos)
import type { Promocao, StatusPromocao } from "@/types"

export function calcularStatus(p: Pick<Promocao, "inicio" | "fim">, agora = new Date()): StatusPromocao {
  if (new Date(p.inicio) > agora) return "agendada"
  if (p.fim && new Date(p.fim) <= agora) return "expirada"
  return "ativa"
}
```

Validações na action (não dá para expressar no banco): preço promocional **menor** que o preço do produto; `fim` depois de `inicio`; **sem sobreposição** para o mesmo produto — existe conflito quando `inicio_novo < fim_existente` (ou o existente não tem fim) **e** `fim_novo > inicio_existente` (ou o novo não tem fim). "Encerrar agora" grava `fim = now()`. O site usa o menor preço entre as promoções ativas, como defesa extra.

### Telas (mobile first)

| Rota | Conteúdo |
|---|---|
| `/admin/login` | E-mail e senha; erro genérico "E-mail ou senha incorretos" |
| `/admin` | Contagens (produtos, ocultos, promoções ativas) e atalhos |
| `/admin/produtos` | Cards com foto, nome, preço, categoria e interruptor de disponível; busca por nome |
| `/admin/produtos/novo` · `/admin/produtos/[id]` | Formulário com upload de imagem. A exclusão com confirmação fica na lista |
| `/admin/categorias` | Lista, criar, renomear, reordenar; excluir bloqueado se houver produtos |
| `/admin/promocoes` | Ativas, Agendadas e Expiradas, com atalhos para criar, editar, encerrar e excluir |
| `/admin/promocoes/nova` · `/admin/promocoes/[id]` | Formulários em horário de Brasília. A criação aceita `?produto=<id>` |

Navegação: barra inferior fixa no mobile (Produtos · Categorias · Promoções · Sair), lateral no `lg:`. Tabelas só a partir de `lg:`.

### Quem é `'use client'` no admin

| Componente | Motivo |
|---|---|
| `form-login`, `form-categoria`, `form-produto`, `form-promocao` | `useActionState` e foco no primeiro campo inválido com `useFocoErro` |
| `form-sair`, `form-encerrar-promocao` | Estado do envio e mensagens de falha |
| `upload-imagem.tsx` | Arquivo, canvas, prévia e upload pelo navegador |
| `botao-excluir.tsx` | Estado do `AlertDialog` |
| Interruptor de disponível | `onChange` que chama a action |

Tudo o mais (páginas, layout, cards, navegação) é Server Component.

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
# lib/utils.ts → cn

# 8. Configurar .env.local
echo "NEXT_PUBLIC_NUMERO_WHATSAPP=5583999999999" > .env.local
```

### `next.config.ts`

```typescript
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com", // imagens do mock
      },
      // Supabase Storage — Fase 6 (trocar pelo host real do projeto)
      {
        protocol: "https",
        hostname: "xxxx.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Cloudinary — só se o Storage deixar de bastar
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
| `exigirAdmin()` na primeira instrução das páginas e actions protegidas | Cada rota valida a sessão. A action de login valida as credenciais antes de iniciá-la. |
| `FormData` como `unknown` + Zod | Nunca confiar em dado vindo do cliente |
| Sem `service_role` | O admin usa a sessão do dono + RLS |
| Páginas públicas só com `supabasePublico` | Consulta sem cookies do painel |
| Mutação → `revalidarCatalogo()` | O site reflete a mudança sem esperar o `revalidate` |

---

## ⚡ Supabase (Fase 6) e Seções Opcionais

---

### 🗄️ Supabase — Banco de Dados

**Quando ligar:** Fase 6, antes do admin. O código dos clientes, de `lib/produtos.ts` e das Server Actions está na seção **Admin** acima; o SQL (tabelas, RLS, Storage e seed) está em `PLANEJAMENTO_V2.md`.

```bash
pnpm add @supabase/supabase-js @supabase/ssr zod slugify server-only
```

#### `.env.local` com Supabase

```env
NEXT_PUBLIC_NUMERO_WHATSAPP=5583999999999
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...   # chave pública (anon / publishable, conforme o painel)
# O admin usa a sessão do dono e as políticas de acesso do banco.
```

#### Cache do catálogo

A home preserva `revalidate = 300` como configuração padrão, mas a rota é renderizada a cada requisição porque lê `searchParams`. No detalhe, `revalidate = 0` permite servir imediatamente o preço vigente. O cliente público usa os dados visíveis sem sessão do painel.

#### Keepalive — Supabase Free pausa após 1 semana sem acesso

`GET /api/keepalive` faz uma consulta curta ao catálogo. Retorna HTTP 200 com `{ ok: true }` quando o Supabase responde e HTTP 503 com `{ ok: false }` em caso de erro.

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
NEXT_PUBLIC_NUMERO_WHATSAPP = ""
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
