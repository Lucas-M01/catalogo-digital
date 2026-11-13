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
