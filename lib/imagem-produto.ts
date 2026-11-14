import type { Produto } from "@/types";

export function imagemProduto({ imagem_url, nome }: Produto) {
  return imagem_url
    ? { src: imagem_url, alt: nome }
    : { src: "/produto-sem-foto.png", alt: `Foto indisponível para ${nome}` };
}
