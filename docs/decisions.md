# Decisões do projeto

## Fase 2

- As categorias usam âncoras na página inicial. Cada link leva à seção correspondente do cardápio. Os filtros e a rota de busca ficam para a Fase 3.
- O carrinho aparece como indicador estático com zero itens. A interação fica para a Fase 4.
- O grid segue o planejamento com uma, duas e três colunas. A imagem principal do detalhe usa `preload` porque o Next.js 16 marcou como obsoleta a opção `priority` usada no exemplo da arquitetura.
- A página 404 da raiz usa a mesma mensagem para produtos inexistentes e endereços desconhecidos. Ela herda o cabeçalho e o rodapé do layout compartilhado.
- Os slugs do mock são definidos no build. Slugs fora dessa lista recebem HTTP 404 antes de iniciar a renderização do skeleton.
- O Biome exclui `stitch-export/` para preservar os protótipos HTML exportados pelo Stitch.

## Fase 3

- A página inicial oferece um link para a busca e mantém as âncoras de categoria. A rota de busca usa um seletor nativo para combinar categoria e termo.
- A busca normaliza nome e descrição. Quando a URL repete um parâmetro, vale o primeiro valor.
- O planejamento cita Next.js 15. A implementação segue a versão instalada, 16.4.5, com `searchParams` assíncrono e valores repassados ao componente cliente. A referência de versão do planejamento deve acompanhar o `package.json` em uma atualização da documentação.
- O filtro “Apenas em promoção” usa `promocao=1` na URL e segue o mesmo critério dos cards. O produto tem promoção quando `preco_promocional` está preenchido.

## Fase 4

- O Sheet usa o Dialog do Radix já instalado e muda de posição pelo breakpoint `md`, mantendo um único diálogo e o mesmo foco ao redimensionar.
- O número público é validado no servidor antes de ser repassado ao botão. O preço unitário e o cálculo do total são compartilhados entre o carrinho e a mensagem, com a soma em centavos.

## Fase 5

- A revisão com o Stitch aplica tema escuro, verde de destaque e Inter via `next/font`. O Tailwind CSS 4 configura as variáveis em `app/globals.css` com `@theme inline`.
- O Next.js 16 usa `preload` no lugar de `priority` e recebe `themeColor` no export `viewport`. O nome provisório é “Cardápio Digital”. Defina `SITE_URL` com a origem pública em produção para gerar URLs de compartilhamento. O desenvolvimento local usa `http://localhost:3000` por padrão.
- Na home e na busca, os quatro primeiros cards da lista recebem preload.
- As fotos de Brownie com Sorvete e Combo Solo retornaram HTTP 404 no Unsplash. O mock registra essas imagens como ausentes para usar o fallback.
- Os cards retomam o formato original com imagem em 4:3 e grid de duas colunas no celular e no tablet e três no desktop. A home usa um grid único. Cada card exibe a categoria em maiúsculas e tom secundário.
- O detalhe usa a foto principal e a descrição do catálogo, e recomenda outros produtos da mesma categoria. Os botões dos cards e do detalhe adicionam ao carrinho, onde o pedido completo é enviado ao WhatsApp.
- O catálogo abre no tema escuro na primeira visita. O seletor do cabeçalho salva a escolha por navegador e a restaura antes da renderização visual da página.
- O cabeçalho acompanha a rolagem. Cards e detalhes mostram a quantidade do carrinho após adicionar o produto, com controles para ajustar ou remover a unidade restante.
- Os botões da home filtram o grid por `?categoria=slug`. A opção “Todas” limpa o filtro e a URL permite compartilhar a seleção.

## Fase 6A

- `lib/env.ts` já valida o WhatsApp e a origem da loja. O schema Zod do Supabase é avaliado ao inicializar o cliente público, para que o catálogo com mock funcione antes de configurar as duas variáveis do Supabase.
- `next.config.ts` só libera imagens do Supabase quando a URL do projeto está definida. Os exemplos do planejamento e da arquitetura devem usar `reactCompiler: true` no nível raiz, como exige o Next.js 16.4.5 instalado.
- A Data API do Supabase exige permissões explícitas nas tabelas novas. A migration de RLS concede leitura para `anon` e leitura e escrita para `authenticated` nas três tabelas do catálogo.
- Cada arquivo SQL usa uma transação para evitar aplicação parcial ao ser executado no SQL Editor.
- O seed usa UUIDs fixos também para os produtos para referenciar diretamente cada produto na sua promoção. Os campos e a ordem de cada registro vêm do mock.

## Fase 6B

- As listas mantêm a ordem original do mock por categoria e depois pela ordem do produto. A consulta traz apenas produtos disponíveis e pode restringir a categoria no PostgREST.
- A busca aplica a normalização existente de nome e descrição em memória. O `ilike` do exemplo da arquitetura diferencia acentos e trata caracteres como `%` como curingas. O filtro de promoções roda sobre os preços já mapeados em `paraProduto()`.
- As consultas usam `.overrideTypes<T, { merge: false }>()`, a alternativa a `.returns<T>()` recomendada pela versão instalada do PostgREST. `.maybeSingle()` preserva o retorno nulo para um slug inexistente.
- O keepalive retorna HTTP 503 quando a consulta falha, para o agendador detectar a indisponibilidade.
- A home continua dinâmica porque usa o filtro de categoria em `searchParams`. Os detalhes pré-renderizados revalidam a cada 300 segundos. Com `dynamicParams = false`, novos slugs entram na rota de detalhe no próximo build e slugs desconhecidos retornam HTTP 404.
