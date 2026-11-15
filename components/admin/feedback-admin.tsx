export function FeedbackAdmin({ mensagem }: { mensagem?: string }) {
  if (!mensagem) return null;

  return (
    <output className="block rounded-lg border border-border bg-card p-3 text-sm">
      {mensagem}
    </output>
  );
}
