begin;

-- Dados de lib/mock/produtos.ts.
insert into public.categorias (id, nome, slug, ordem) values
  ('00000000-0000-4000-8100-000000000001', 'Lanches', 'lanches', 1),
  ('00000000-0000-4000-8100-000000000002', 'Bebidas', 'bebidas', 2),
  ('00000000-0000-4000-8100-000000000003', 'Sobremesas', 'sobremesas', 3),
  ('00000000-0000-4000-8100-000000000004', 'Combos', 'combos', 4);

insert into public.produtos (
  id, nome, slug, descricao, preco, imagem_url, imagem_path, categoria_id,
  disponivel, destaque, ordem
) values
  ('00000000-0000-4000-8200-000000000001', 'X-Burguer Clássico', 'x-burguer-classico', 'Pão brioche, hambúrguer 150g, queijo cheddar, alface, tomate e maionese especial.', 22.90, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', null, '00000000-0000-4000-8100-000000000001', true, true, 1),
  ('00000000-0000-4000-8200-000000000002', 'X-Bacon Duplo', 'x-bacon-duplo', 'Dois hambúrgueres 150g, bacon crocante, queijo prato, cebola caramelizada.', 32.90, 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400', null, '00000000-0000-4000-8100-000000000001', true, false, 2),
  ('00000000-0000-4000-8200-000000000003', 'Veggie Burger', 'veggie-burger', 'Hambúrguer de grão-de-bico, rúcula, tomate seco, homus e pão integral.', 26.90, 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400', null, '00000000-0000-4000-8100-000000000001', true, false, 3),
  ('00000000-0000-4000-8200-000000000004', 'Refrigerante Lata', 'refrigerante-lata', 'Coca-Cola, Guaraná ou Sprite — lata 350ml gelada.', 6.00, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400', null, '00000000-0000-4000-8100-000000000002', true, false, 1),
  ('00000000-0000-4000-8200-000000000005', 'Milkshake 500ml', 'milkshake-500ml', 'Chocolate, morango ou baunilha — cremoso e gelado.', 18.00, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400', null, '00000000-0000-4000-8100-000000000002', true, true, 2),
  ('00000000-0000-4000-8200-000000000006', 'Suco Natural 300ml', 'suco-natural-300ml', 'Laranja, limão ou maracujá — feito na hora.', 10.00, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400', null, '00000000-0000-4000-8100-000000000002', true, false, 3),
  ('00000000-0000-4000-8200-000000000007', 'Brownie com Sorvete', 'brownie-com-sorvete', 'Brownie quentinho de chocolate com uma bola de sorvete de creme.', 16.00, null, null, '00000000-0000-4000-8100-000000000003', true, true, 1),
  ('00000000-0000-4000-8200-000000000008', 'Petit Gâteau', 'petit-gateau', 'Bolinho de chocolate com interior cremoso e calda de chocolate quente.', 19.90, 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400', null, '00000000-0000-4000-8100-000000000003', true, false, 2),
  ('00000000-0000-4000-8200-000000000009', 'Combo Família', 'combo-familia', '2 X-Burguer Clássico + 2 refrigerantes lata + 2 sobremesas à escolha.', 89.90, 'https://images.unsplash.com/photo-1619881590738-a111d176d906?w=400', null, '00000000-0000-4000-8100-000000000004', true, true, 1),
  ('00000000-0000-4000-8200-000000000010', 'Combo Solo', 'combo-solo', '1 lanche à escolha + 1 bebida lata + 1 sobremesa do dia.', 42.00, null, null, '00000000-0000-4000-8100-000000000004', true, false, 2);

insert into public.promocoes (produto_id, preco_promocional, inicio, fim) values
  ('00000000-0000-4000-8200-000000000002', 28.90, now(), null),
  ('00000000-0000-4000-8200-000000000005', 15.00, now(), null),
  ('00000000-0000-4000-8200-000000000009', 79.90, now(), null),
  ('00000000-0000-4000-8200-000000000010', 36.00, now(), null);

commit;
