import slugify from "slugify";
import type { Categoria, Produto } from "@/types";

export const categoriasMock: Categoria[] = [
  { id: "1", nome: "Lanches", slug: "lanches", ordem: 1 },
  { id: "2", nome: "Bebidas", slug: "bebidas", ordem: 2 },
  { id: "3", nome: "Sobremesas", slug: "sobremesas", ordem: 3 },
  { id: "4", nome: "Combos", slug: "combos", ordem: 4 },
];

const produtosSemSlug: Omit<Produto, "slug">[] = [
  // ── Lanches ──────────────────────────────────────────────────────
  {
    id: "p1",
    nome: "X-Burguer Clássico",
    descricao:
      "Pão brioche, hambúrguer 150g, queijo cheddar, alface, tomate e maionese especial.",
    preco: 22.9,
    preco_promocional: null,
    imagem_url:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
    categoria: categoriasMock[0],
    disponivel: true,
    destaque: true,
    ordem: 1,
  },
  {
    id: "p2",
    nome: "X-Bacon Duplo",
    descricao:
      "Dois hambúrgueres 150g, bacon crocante, queijo prato, cebola caramelizada.",
    preco: 32.9,
    preco_promocional: 28.9,
    imagem_url:
      "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400",
    categoria: categoriasMock[0],
    disponivel: true,
    destaque: false,
    ordem: 2,
  },
  {
    id: "p3",
    nome: "Veggie Burger",
    descricao:
      "Hambúrguer de grão-de-bico, rúcula, tomate seco, homus e pão integral.",
    preco: 26.9,
    preco_promocional: null,
    imagem_url:
      "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400",
    categoria: categoriasMock[0],
    disponivel: true,
    destaque: false,
    ordem: 3,
  },
  // ── Bebidas ───────────────────────────────────────────────────────
  {
    id: "p4",
    nome: "Refrigerante Lata",
    descricao: "Coca-Cola, Guaraná ou Sprite — lata 350ml gelada.",
    preco: 6.0,
    preco_promocional: null,
    imagem_url:
      "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400",
    categoria: categoriasMock[1],
    disponivel: true,
    destaque: false,
    ordem: 1,
  },
  {
    id: "p5",
    nome: "Milkshake 500ml",
    descricao: "Chocolate, morango ou baunilha — cremoso e gelado.",
    preco: 18.0,
    preco_promocional: 15.0,
    imagem_url:
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400",
    categoria: categoriasMock[1],
    disponivel: true,
    destaque: true,
    ordem: 2,
  },
  {
    id: "p6",
    nome: "Suco Natural 300ml",
    descricao: "Laranja, limão ou maracujá — feito na hora.",
    preco: 10.0,
    preco_promocional: null,
    imagem_url:
      "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400",
    categoria: categoriasMock[1],
    disponivel: true,
    destaque: false,
    ordem: 3,
  },
  // ── Sobremesas ────────────────────────────────────────────────────
  {
    id: "p7",
    nome: "Brownie com Sorvete",
    descricao:
      "Brownie quentinho de chocolate com uma bola de sorvete de creme.",
    preco: 16.0,
    preco_promocional: null,
    imagem_url:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30ef07?w=400",
    categoria: categoriasMock[2],
    disponivel: true,
    destaque: true,
    ordem: 1,
  },
  {
    id: "p8",
    nome: "Petit Gâteau",
    descricao:
      "Bolinho de chocolate com interior cremoso e calda de chocolate quente.",
    preco: 19.9,
    preco_promocional: null,
    imagem_url:
      "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400",
    categoria: categoriasMock[2],
    disponivel: true,
    destaque: false,
    ordem: 2,
  },
  // ── Combos ────────────────────────────────────────────────────────
  {
    id: "p9",
    nome: "Combo Família",
    descricao:
      "2 X-Burguer Clássico + 2 refrigerantes lata + 2 sobremesas à escolha.",
    preco: 89.9,
    preco_promocional: 79.9,
    imagem_url:
      "https://images.unsplash.com/photo-1619881590738-a111d176d906?w=400",
    categoria: categoriasMock[3],
    disponivel: true,
    destaque: true,
    ordem: 1,
  },
  {
    id: "p10",
    nome: "Combo Solo",
    descricao: "1 lanche à escolha + 1 bebida lata + 1 sobremesa do dia.",
    preco: 42.0,
    preco_promocional: 36.0,
    imagem_url:
      "https://images.unsplash.com/photo-1594212699903-ec8a3eca368f?w=400",
    categoria: categoriasMock[3],
    disponivel: true,
    destaque: false,
    ordem: 2,
  },
];

export const produtosMock: Produto[] = produtosSemSlug.map((produto) => ({
  ...produto,
  slug: slugify(produto.nome, { lower: true, strict: true }),
}));
