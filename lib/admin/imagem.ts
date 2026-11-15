import { criarClienteNavegador } from "@/lib/supabase/navegador";
import type { ImagemProduto } from "@/types";

const formatos = ["image/jpeg", "image/png", "image/webp"];
const maxOrigem = 8 * 1024 * 1024;
const maxWebp = 1024 * 1024;
const qualidades = [0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2];

class ErroImagem extends Error {}

async function validarArquivo(arquivo: File) {
  if (arquivo.size > maxOrigem) {
    throw new ErroImagem("A imagem deve ter até 8 MB.");
  }

  const cabecalho = new Uint8Array(await arquivo.slice(0, 12).arrayBuffer());
  const jpeg = [255, 216, 255].every((byte, i) => cabecalho[i] === byte);
  const png = [137, 80, 78, 71, 13, 10, 26, 10].every(
    (byte, i) => cabecalho[i] === byte,
  );
  const webp =
    String.fromCharCode(...cabecalho.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...cabecalho.slice(8, 12)) === "WEBP";

  if (
    (arquivo.type && !formatos.includes(arquivo.type)) ||
    !(jpeg || png || webp)
  ) {
    throw new ErroImagem("Escolha uma imagem JPEG, PNG ou WebP.");
  }
}

async function decodificar(arquivo: File) {
  if (typeof createImageBitmap === "function") {
    try {
      const imagem = await createImageBitmap(arquivo, {
        imageOrientation: "from-image",
      });
      return {
        imagem,
        largura: imagem.width,
        altura: imagem.height,
        liberar: () => imagem.close(),
      };
    } catch {
      // O elemento de imagem também aplica a orientação EXIF.
    }
  }

  const url = URL.createObjectURL(arquivo);
  const imagem = new Image();
  imagem.src = url;
  try {
    await imagem.decode();
    return {
      imagem,
      largura: imagem.naturalWidth,
      altura: imagem.naturalHeight,
      liberar: () => URL.revokeObjectURL(url),
    };
  } catch {
    URL.revokeObjectURL(url);
    throw new ErroImagem(
      "Não foi possível abrir a imagem. Escolha outro arquivo.",
    );
  }
}

export async function converterImagem(arquivo: File): Promise<Blob> {
  await validarArquivo(arquivo);
  const { imagem, largura, altura, liberar } = await decodificar(arquivo);
  try {
    const canvas = document.createElement("canvas");
    const contexto = canvas.getContext("2d");
    if (!contexto)
      throw new ErroImagem(
        "Não foi possível preparar a imagem neste navegador.",
      );

    let escala = Math.min(1, 1200 / Math.max(largura, altura));
    for (let tentativa = 0; tentativa < 3; tentativa++) {
      canvas.width = Math.max(1, Math.round(largura * escala));
      canvas.height = Math.max(1, Math.round(altura * escala));
      contexto.imageSmoothingQuality = "high";
      contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);

      for (const qualidade of qualidades) {
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/webp", qualidade),
        );
        if (blob?.type !== "image/webp") {
          throw new ErroImagem(
            "Não foi possível gerar uma imagem WebP neste navegador.",
          );
        }
        if (blob.size <= maxWebp) return blob;
      }
      escala *= 0.8;
    }
    throw new ErroImagem(
      "Não foi possível reduzir a imagem para 1 MB. Escolha outra foto.",
    );
  } finally {
    liberar();
  }
}

function gerarUuidImagem(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();

  // O acesso por IP da rede via HTTP ainda disponibiliza getRandomValues.
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join("-");
}

export async function enviarImagem(arquivo: File): Promise<ImagemProduto> {
  const imagem = await converterImagem(arquivo).catch((erro: unknown) => {
    if (erro instanceof ErroImagem) throw erro;
    throw new Error("Não foi possível preparar a imagem. Escolha outra foto.");
  });

  try {
    const caminho = `${gerarUuidImagem()}.webp`;
    const bucket = criarClienteNavegador().storage.from("produtos");
    const { error } = await bucket.upload(caminho, imagem, {
      contentType: "image/webp",
      upsert: false,
    });
    if (error) throw error;

    const { data } = bucket.getPublicUrl(caminho);
    return { imagem_url: data.publicUrl, imagem_path: caminho };
  } catch {
    throw new Error("Não foi possível enviar a imagem. Tente novamente.");
  }
}
