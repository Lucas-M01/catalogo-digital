# Catálogo Digital

Catálogo para lojas com navegação por produtos, carrinho e envio do pedido completo em uma única mensagem pelo WhatsApp. Inclui painel administrativo para gerenciar o catálogo e os horários de funcionamento.

## Funcionalidades

- Busca por nome e descrição, filtros por categoria e promoções.
- Detalhes do produto, imagens e sugestões da mesma categoria.
- Carrinho com ajuste de quantidades e geração do pedido via link `wa.me`.
- Promoções com início e fim programados.
- Horários semanais e pausa manual, com bloqueio de pedidos fora do horário.
- Painel com autenticação por e-mail e senha para gerenciar produtos, categorias, promoções e horários.
- Upload de imagens com redimensionamento e conversão para WebP no navegador.
- Interface adaptada para celular e alternância entre temas claro e escuro.

O pedido é confirmado diretamente com a loja pelo WhatsApp. O projeto não inclui checkout, pagamento online ou integração com a API oficial do WhatsApp.

## Tecnologias

Next.js 16 (App Router), React 19 com React Compiler, TypeScript estrito, Tailwind CSS 4, shadcn/ui, Supabase (Postgres, Auth e Storage), Zod e Biome. Dependências gerenciadas com pnpm.

## Executar localmente

1. Instale o Node.js compatível com o pnpm 11 e disponibilize a versão de pnpm indicada no `package.json`.
2. Instale as dependências:

   ```bash
   pnpm install --frozen-lockfile
   ```

3. Copie o arquivo de exemplo e preencha as variáveis com a configuração do seu ambiente:

   ```bash
   cp .env.example .env.local
   ```

   | Variável | Uso |
   | --- | --- |
   | `NEXT_PUBLIC_NUMERO_WHATSAPP` | Número com país e DDD, apenas dígitos |
   | `NEXT_PUBLIC_SUPABASE_URL` | URL do seu projeto Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública anon ou publishable do projeto |
   | `SITE_URL` | Origem da loja; localmente, `http://localhost:3000` |

4. Configure seu próprio projeto Supabase: execute os arquivos de `supabase/migrations/` no SQL Editor, em ordem numérica. A migration `0004_seed.sql` inclui dados de demonstração. Desabilite o cadastro público e crie somente a conta do dono da loja no Auth: as políticas de escrita pressupõem esse modelo de usuário único. Use a sessão dessa conta e a chave pública da aplicação; o projeto não usa chave de serviço.
5. Inicie a aplicação:

   ```bash
   pnpm dev
   ```

Abra [localhost:3000](http://localhost:3000). O painel fica em `/admin` e requer a conta criada no seu projeto Supabase.

O arquivo `.env.local` fica fora do versionamento. As variáveis `NEXT_PUBLIC_*` precisam estar disponíveis durante o build.

## Validação

```bash
pnpm biome check --write
pnpm build
node --experimental-strip-types scripts/verificar-status-loja.ts
```

O build requer as variáveis de ambiente configuradas. Os testes manuais com a conta real e o celular do dono estão descritos na documentação; consulte os checklists para as validações pendentes.

## Organização

- `app/`: rotas públicas e administrativas, layouts e Server Actions.
- `components/`: interface da loja, carrinho e formulários do painel.
- `lib/`: acesso a dados, autorização, validação e regras de negócio.
- `supabase/migrations/`: estrutura do banco, políticas de acesso e dados de demonstração.
- `scripts/`: verificação das regras de horário.

## Documentação

- [Planejamento e checklists](PLANEJAMENTO_V2.md)
- [Arquitetura](ARQUITETURA_V2.md)
- [Decisões técnicas](docs/decisions.md)
- [Guia do painel](docs/ADMIN.md)

A publicação do código no GitHub não inclui hospedagem da aplicação. O deploy em Cloudflare Workers é uma etapa futura.

## Licença

Este projeto está disponível sob a [licença MIT](LICENSE). Copyright (c) 2026 Lucas Montenegro.
