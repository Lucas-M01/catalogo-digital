# AGENTS.md — Catálogo Digital

Catálogo digital para uma loja. O visitante navega pelos produtos, monta um carrinho e envia o pedido completo em uma única mensagem via link `wa.me` do WhatsApp. Não há checkout, pagamento online nem API oficial do WhatsApp.

## Fonte de verdade

- `PLANEJAMENTO_V2.md` — fases, checklists, mock de dados, tipos, configurações
- `ARQUITETURA_V2.md` — estrutura de pastas, camadas, código de referência dos componentes

Leia os dois antes de começar qualquer tarefa. Em caso de conflito entre este arquivo e eles, pergunte antes de decidir.

## Stack

- Next.js (App Router) · TypeScript estrito · Tailwind CSS · shadcn/ui
- pnpm (nunca npm ou yarn)
- Biome para lint e format (sem ESLint, sem Prettier)
- React Compiler habilitado
- Dados: mock local em `lib/mock/produtos.ts`. Supabase e Cloudflare Workers são etapas futuras e opcionais, não implementar agora.

## Comandos

```bash
pnpm dev                 # servidor de desenvolvimento
pnpm build               # build de produção
pnpm biome check --write     # lint + format + organizar imports
```

## Regras

- Sempre App Router. Nunca Pages Router.
- Use TypeScript com `strict: true`. É proibido usar `any`. Use `unknown` e valide o valor antes de usá-lo.
- Mobile first obrigatório: estilos base para celular, depois `md:` e `lg:`. Nunca o contrário.
- Server Component por padrão. `'use client'` só quando houver estado, eventos ou o carrinho.
- Não usar `useMemo`, `useCallback` nem `memo`. O React Compiler cuida disso. Nunca mutar estado diretamente.
- Todo acesso a dados fica em `lib/`. Componentes nunca importam o mock diretamente, só `lib/produtos.ts`. A troca para Supabase deve alterar apenas esse arquivo.
- Componentes pequenos, uma responsabilidade cada.
- Botões e áreas de toque com no mínimo 48px de altura.
- Nunca commite segredos. Toda configuração vem de variáveis de ambiente validadas na inicialização.
- Nunca expor `SUPABASE_SERVICE_ROLE_KEY` no cliente (quando o Supabase entrar).

## Documentação das libs

Não confie na memória para APIs de Next.js, Tailwind, shadcn/ui, Biome ou React Compiler, porque mudam rápido entre versões. Antes de usar ou configurar qualquer uma, consulte o MCP **Context7**. Use o **OctoCode** para ver como projetos reais estruturam um padrão quando houver mais de uma abordagem.

## Forma de trabalhar

- Trabalhe uma fase do `PLANEJAMENTO_V2.md` por vez e marque os itens concluídos.
- Antes de iniciar cada fase, crie uma branch exclusiva a partir da `main`, por exemplo `git checkout -b feat/fase-1 main`. Mantenha as mudanças nessa branch até a validação, para que ela possa ser descartada sem afetar a `main`.
- Antes de encerrar cada tarefa, rode `pnpm biome check --write` e corrija os problemas encontrados. Ao terminar cada etapa, rode também `pnpm build` e corrija eventuais erros.
- Com o Biome passando, faça `git add` dos arquivos da tarefa e `git commit`. Faça commits pequenos e use mensagens no padrão Conventional Commits, como `feat:`, `fix:`, `chore:` e `test:`.
- Se uma decisão não estiver neste arquivo, escolha a opção mais simples e registre a decisão em `docs/decisions.md`.
- Não instale dependências fora do planejamento sem perguntar.
- Se algo no planejamento estiver desatualizado em relação à versão instalada das libs, avise e proponha o ajuste em vez de seguir em silêncio.

## Notas sobre dados

- O mock usa `preco_promocional` direto no produto por simplicidade. No banco real, promoções ficam em tabela separada (`promocoes`, com `inicio` e `fim`). Ao migrar para Supabase, ajustar o tipo `Produto` e a resolução de preço em `lib/whatsapp.ts` e nos cards.
- Slugs são gerados do nome com a lib `slugify` (`{ lower: true, strict: true }`).
