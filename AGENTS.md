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
- Dados: mock local em `lib/mock/produtos.ts` até a Fase 5. A partir da Fase 6, Supabase (Postgres + Auth + Storage). O painel admin é a Fase 7.
- Dependências aprovadas para as Fases 6 e 7: `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `slugify`, `server-only`. Qualquer outra, pergunte antes.
- Cloudflare Workers continua sendo etapa futura, não implementar agora.

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
- Todo acesso a dados fica em `lib/`. Componentes nunca importam o mock diretamente, só `lib/produtos.ts`. A troca do mock para o Supabase (Fase 6) altera apenas esse arquivo, e o tipo `Produto` não muda. Escrita e leitura administrativa ficam em `lib/admin/`.
- Componentes pequenos, uma responsabilidade cada.
- Botões e áreas de toque com no mínimo 48px de altura.
- Nunca commite segredos. Toda configuração vem de variáveis de ambiente validadas na inicialização.
- Este projeto **não usa** chave de serviço do Supabase: o admin escreve com a sessão do usuário logado + RLS. Se algo parecer exigir essa chave, pare e pergunte.

## Admin e Supabase (Fases 6 e 7)

Detalhes de código em `ARQUITETURA_V2.md` (seção Admin) e SQL em `PLANEJAMENTO_V2.md` (seção Supabase).

- **Você não tem acesso ao banco.** Escreva as migrations em `supabase/migrations/` (numeradas, `0001_...sql`) e avise ao final. O desenvolvedor executa no SQL Editor do Supabase e confirma antes de você seguir.
- **Três clientes Supabase em `lib/supabase/`:** `publico.ts` (anon, sem cookies; leitura pública), `servidor.ts` (`@supabase/ssr` com cookies; só no admin) e `navegador.ts` (só o upload de imagem; o login é uma Server Action). Nunca use o cliente de servidor em páginas públicas: ler cookies torna a página dinâmica e quebra o `revalidate`.
- **Route groups:** rotas públicas em `app/(loja)/`, admin em `app/(admin)/admin/`. As URLs não mudam. O `app/layout.tsx` raiz fica só com `html`, `body`, fonte e tema.
- **Autorização em camadas:** `proxy.ts` só renova a sessão e redireciona (no Next 16 o `middleware` se chama `proxy`); ele não é a barreira de segurança. Toda página e Server Action protegida chama `exigirAdmin()` primeiro. A action `entrar()` valida as credenciais com Zod antes de iniciar a sessão. Use `getUser()`, nunca confie em `getSession()` para autorizar.
- **Server Actions:** arquivo `actions.ts` com `'use server'`; `exigirAdmin()` primeiro; `FormData` tratado como `unknown`; validação com Zod; retorno `{ ok, erros, mensagem }` (não lançar exceção por erro de validação). Erros do Supabase viram mensagens em português; nunca repasse `error.message` cru ao usuário. Componentes de formulário recebem a action por props (a página importa a action), para manter a regra de camadas.
- **Preço:** o campo aceita vírgula ("22,90"). Converta no servidor com o helper único `lib/admin/preco.ts`; nunca use `Number()` direto no texto digitado.
- **Slug:** gerado no servidor com `slugify` a partir do nome. Em colisão, acrescente `-2`, `-3`. É **imutável** depois de criado (links já compartilhados no WhatsApp não podem quebrar), mesmo que o nome mude.
- **Imagens:** o navegador redimensiona (lado maior 1200px, WebP) antes de enviar direto ao bucket `produtos` do Supabase Storage. A action só aceita `imagem_url` do bucket do próprio projeto e `imagem_path` no formato `<uuid>.webp`. Ao trocar ou excluir, remova o arquivo antigo do Storage.
- **Promoções:** tabela própria. Validar no servidor: preço promocional menor que o preço normal, `fim` depois de `inicio` e sem sobreposição para o mesmo produto. Datas digitadas são horário de Brasília (`-03:00`); armazene em `timestamptz`.
- **Cache:** sem `cacheComponents` e sem `'use cache'`. Home e busca leem os filtros da URL por requisição. O detalhe usa `revalidate = 0` para respeitar a vigência das promoções; toda mutação do admin chama `revalidarCatalogo()` (`lib/admin/revalidar.ts`).
- **Rotas admin:** `noindex`, fora do sitemap, `Disallow` no `robots.txt`, sem nenhum link a partir do site público.
- **UI do admin:** mobile first (o dono usará no celular), cards em vez de tabelas no mobile, alvos de toque de 48px, confirmação (`AlertDialog`) antes de excluir, estados de carregamento e de erro em todo formulário.
- **Auth:** login por e-mail e senha, erro genérico ("E-mail ou senha incorretos"). Cadastro público desabilitado no Supabase; só existe o usuário do dono.

## Documentação das libs

Não confie na memória para APIs de Next.js, Tailwind, shadcn/ui, Biome ou React Compiler, porque mudam rápido entre versões. Antes de usar ou configurar qualquer uma, consulte o MCP **Context7**. Use o **OctoCode** para ver como projetos reais estruturam um padrão quando houver mais de uma abordagem.

## Forma de trabalhar

- Trabalhe uma fase do `PLANEJAMENTO_V2.md` por vez e marque os itens concluídos.
- Antes de iniciar cada fase, crie uma branch exclusiva a partir da `main`, por exemplo `git checkout -b feat/fase-1 main`. Mantenha as mudanças nessa branch até a validação, para que ela possa ser descartada sem afetar a `main`.
- Antes de encerrar cada tarefa, rode `pnpm biome check --write` e corrija os problemas encontrados. Ao terminar cada etapa, rode também `pnpm build` e corrija eventuais erros.
- Com o Biome passando, faça `git add` dos arquivos da tarefa e `git commit`. Faça commits pequenos e use mensagens no padrão Conventional Commits, como `feat:`, `fix:`, `chore:` e `test:`.
- Se o repositório Git ainda não existir (`git status` falha), não rode `git init`, branches nem commits: pule os passos de git e avise ao final da tarefa.
- Se uma decisão não estiver neste arquivo, escolha a opção mais simples e registre a decisão em `docs/decisions.md`.
- Não instale dependências fora do planejamento sem perguntar.
- Se algo no planejamento estiver desatualizado em relação à versão instalada das libs, avise e proponha o ajuste em vez de seguir em silêncio.

## Notas sobre dados

- O mock usa `preco_promocional` direto no produto. No banco real, promoções ficam em tabela separada (`promocoes`, com `inicio` e `fim`). A migração (Fase 6) resolve a promoção ativa dentro de `lib/produtos.ts` e a entrega no mesmo campo `preco_promocional`; por isso o tipo `Produto`, os cards e `lib/whatsapp.ts` **não mudam**. Se a Fase 3 filtra "apenas promoções", mantenha esse filtro depois do mapeamento.
- Slugs são gerados do nome com a lib `slugify` (`{ lower: true, strict: true }`).
