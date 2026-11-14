export const chaveTema = "catalogo-tema";

export const scriptInicialTema = `
  try {
    if (localStorage.getItem(${JSON.stringify(chaveTema)}) === "claro") {
      document.documentElement.dataset.tema = "claro";
    }
  } catch {}
`;
