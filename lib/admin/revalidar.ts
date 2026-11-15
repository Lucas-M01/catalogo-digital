import "server-only";

import { revalidatePath } from "next/cache";

export function revalidarCatalogo() {
  revalidatePath("/", "layout");
}
