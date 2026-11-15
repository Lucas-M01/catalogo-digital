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

export type Promocao = {
  id: string;
  produto_id: string;
  preco_promocional: number;
  inicio: string;
  fim: string | null;
};

export type StatusPromocao = "ativa" | "agendada" | "expirada";

export type ProdutoAdmin = Omit<Produto, "preco_promocional"> & {
  imagem_path: string | null;
  promocoes: Promocao[];
};

export type ImagemProduto = Pick<ProdutoAdmin, "imagem_url" | "imagem_path">;

export type EstadoForm = {
  ok: boolean;
  mensagem?: string;
  erros?: Record<string, string[] | undefined>;
};
