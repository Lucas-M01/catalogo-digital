export type Categoria = {
  id: string;
  nome: string;
  slug: string;
  ordem: number;
};

export type Produto = {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  preco: number;
  preco_promocional: number | null;
  imagem_url: string | null;
  categoria: Categoria;
  disponivel: boolean;
  destaque: boolean;
  ordem: number;
};

export type ItemCarrinho = {
  produto: Produto;
  quantidade: number;
};
