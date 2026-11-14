"use client";

import { Button } from "@/components/ui/button";

export default function Erro({ retry }: { retry: () => void }) {
  return (
    <div className="mx-auto max-w-md space-y-4 py-12 text-center md:py-20">
      <h1 className="text-3xl font-semibold tracking-tight">Algo deu errado</h1>
      <p className="text-muted-foreground">
        Houve um problema ao carregar esta página. Tente novamente.
      </p>
      <Button type="button" className="min-h-12 px-5" onClick={retry}>
        Tentar novamente
      </Button>
    </div>
  );
}
