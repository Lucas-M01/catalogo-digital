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

## Fase 7A

- A branch `feat/fase-7a` partiu da `main` e avançou até a Fase 6 validada, que ainda estava na branch `feat/fase-6`.
- O layout da loja compartilha a estrutura visual com a página 404 da raiz. O grupo da loja tem seu próprio limite de erro para manter o cabeçalho e o rodapé em caso de falha de uma rota pública.
- O proxy verifica a sessão com `getUser()` e reaplica os cookies e os cabeçalhos retornados por `setAll` ao redirecionar. As páginas protegidas e a ação de sair fazem sua própria verificação. A ação encerra a sessão atual.
- O resumo conta registros no PostgREST, incluindo produtos indisponíveis e promoções com `inicio <= agora` e `fim > agora` ou sem fim. Se uma consulta falhar, o resumo indica que a contagem correspondente está indisponível.
- Os clientes usam a variável pública configurada na Fase 6. A documentação atual do Supabase recomenda a chave publicável. A troca pode ser feita em uma etapa de configuração que atualize a variável para `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e valide o catálogo e a sessão do dono. [Guia de chaves do Supabase](https://supabase.com/docs/guides/getting-started/api-keys)

## Fase 7B

- A edição usa uma ação para salvar o nome ou a ordem separadamente. Cada gravação altera apenas o campo enviado, e o slug é definido na criação.
- Quando nomes produzem o mesmo slug, a criação usa o primeiro sufixo livre a partir de `-2`. Se duas gravações escolherem o mesmo slug, a restrição de unicidade dispara uma nova consulta antes da próxima tentativa. Nomes cujo slug fica vazio usam a base `item`.
- A lista conta todos os produtos vinculados, inclusive os ocultos. A exclusão usa a chave estrangeira como verificação no momento da gravação e mantém o diálogo aberto com a mensagem quando o banco bloqueia a operação.

## Fase 7C

- O preço é validado em centavos. O campo aceita vírgula decimal e ponto decimal com uma ou duas casas. Um ponto seguido de três dígitos é tratado como separador de milhar quando o agrupamento é válido.
- A busca administrativa filtra os resultados paginados por nome, ignorando acentos e diferenças entre maiúsculas e minúsculas.
- A edição envia os campos ocultos de imagem, e a gravação deixa as colunas de imagem fora do payload. A exclusão usa o caminho retornado pela linha excluída. Se o Storage falhar, o catálogo é revalidado e a lista informa que a limpeza do arquivo ficou pendente.
- A rota pública de detalhe aceita slugs sob demanda. Os detalhes mantêm ISR de 300 segundos e são revalidados após as mutações do painel. Isso permite abrir produtos novos e reativados sem um novo build.

## Fase 7D

- O canvas recebe a imagem com a orientação EXIF aplicada. A conversão começa em WebP com qualidade 0,8, reduz a qualidade em etapas e reduz as dimensões se necessário para respeitar 1 MiB.
- O servidor valida o par de URL e caminho. Uma imagem legada só é aceita se os dois valores coincidirem com o registro atual. Quando a foto é alterada, a gravação confere o par anterior para evitar que edições concorrentes apaguem a imagem de outra gravação.
- A remoção do objeto anterior ocorre depois da gravação no Postgres. Falhas de limpeza são registradas no servidor. Arquivos enviados sem salvar o produto podem ficar no bucket para limpeza manual.
- O upload gera UUID v4 com `crypto.randomUUID()` quando disponível, e usa os bytes de `crypto.getRandomValues()` ao acessar o painel por IP da rede via HTTP.

## Fase 7E

- A conversão do formulário considera o deslocamento fixo de Brasília (`-03:00`). O painel formata os instantes com `America/Fortaleza` no servidor, inclusive os valores iniciais da edição.
- A sobreposição usa períodos com início inclusivo e fim exclusivo, com fim nulo representando duração indefinida. As Server Actions serializam criações e edições do mesmo produto dentro de cada processo. O esquema atual permite que processos distintos gravem ao mesmo tempo.
- O resumo continua contando promoções pelo período de vigência. A home e a busca refletem a vigência na leitura. Após a correção da expiração, o detalhe também é renderizado a cada acesso: o ISR de 300 segundos podia servir o preço promocional depois do fim. O cliente público continua sem cookies, e o layout, a página e seus metadados compartilham a consulta ao produto dentro da mesma requisição.
- O skeleton da home fica no grupo `(inicio)`. No detalhe, o layout verifica se o produto existe antes de renderizar o skeleton da página, preservando o HTTP 404 de produtos ausentes.

## Fase 7F

- A opção e o par de campos de imagem passam pelo Zod na edição. Omitir o par preserva a foto atual. Enviar os dois valores vazios solicita a remoção.
- Os formulários movem o foco ao primeiro campo inválido após a resposta. Quando uma ação redireciona após gravar, a página de destino resolve um código conhecido para uma confirmação em português. A exclusão de produto conserva o filtro por nome.
- O Next.js 16 retirou o First Load JS da saída da build. A comparação com a Fase 6 usa a soma dos tamanhos em gzip dos arquivos JavaScript referenciados pelos scripts no HTML de cada rota. Os manifestos de referências dos componentes cliente permitem conferir quais módulos entram nas rotas públicas.
- O fluxo automatizado usa a build de produção com Supabase simulado. A aprovação do fluxo no aparelho do dono e a conferência do cadastro e das políticas no projeto Supabase ficam no checklist de entrega.

## Fase 8A

- O cálculo recebe o instante como argumento e extrai o dia e a hora em `America/Fortaleza`. Cada dia admite até dois intervalos com início inclusivo e fim exclusivo. Intervalos sobrepostos ou contíguos prolongam o período aberto até a primeira lacuna. A busca da próxima abertura inclui o mesmo dia da semana seguinte quando necessário.
- O fechamento manual termina no próprio instante de `reabre_em`. Enquanto durar, a data informada ao visitante indica o fim da pausa. Quando a loja abre sem fechamento programado, `fechaAs` é uma string vazia e `minutosParaFechar` é infinito.
- A leitura converte os horários do Postgres de `HH:mm:ss` para `HH:mm` e valida o limite de dois intervalos por dia. O painel validará o limite também ao gravar, na Fase 8B. `getDadosLoja()` usa a configuração padrão de loja aberta se qualquer consulta falhar. Uma lista vazia lida com sucesso representa uma semana sem intervalos quando `usar_horarios` está ativo.
- A migration 0005 mantém a transação usada nos arquivos anteriores e concede permissões explícitas à Data API além da RLS, como na 0002. [Documentação da Data API](https://supabase.com/docs/guides/api/securing-your-api)
- O script de verificação importa a função com a extensão `.ts` para rodar com o suporte nativo do Node. O TypeScript aceita esse import com `allowImportingTsExtensions` e `noEmit`.

## Fase 8B

- A grade dos sete dias é enviada junta à RPC. A preferência de usar a grade e a pausa têm salvamentos próprios, cada um atualizando somente as colunas da sua seção.
- A validação aceita intervalos adjacentes. Para comparar dois intervalos do mesmo dia, considera até a meia-noite quando o fechamento cai no dia seguinte.
- A barra inferior reserva mais largura para os rótulos “Categorias” e “Promoções”. Os formulários preservam a edição após o envio, interceptando o reset nativo que levaria os interruptores do Radix aos valores iniciais.
- A migration 0006 faz a RPC adquirir um bloqueio de escrita antes de substituir os horários. Envios simultâneos passam em sequência e as leituras podem continuar durante a gravação. [Documentação de LOCK do PostgreSQL](https://www.postgresql.org/docs/current/sql-lock.html)

## Fase 8C

- A home segue dinâmica pelos filtros da URL e o detalhe mantém `revalidate = 0` para respeitar a vigência das promoções, conforme confirmado para esta fase. A leitura de horários usa o cliente público e a revalidação já disparada pelo painel.
- A faixa fica oculta enquanto o relógio ainda está desconhecido, quando a grade está desativada sem pausa e quando faltam mais de 30 minutos para fechar. O rodapé agrupa os dias consecutivos de segunda a domingo e inclui os dias fechados.
