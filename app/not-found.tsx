import { EstruturaLoja } from "@/components/layout/estrutura-loja";
import PaginaNaoEncontrada from "@/components/layout/pagina-nao-encontrada";
import { getDadosLoja } from "@/lib/loja";

export default async function NotFound() {
  const dados = await getDadosLoja();
  return (
    <EstruturaLoja {...dados}>
      <PaginaNaoEncontrada />
    </EstruturaLoja>
  );
}
