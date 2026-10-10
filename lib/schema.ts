import { z } from "zod";

export const FraseSchema = z.object({
  palavra: z.string().min(1),
  dica: z.string().min(1),
  tema: z.string().min(1),
});

export const ConteudoSchema = z.object({
  titulo: z.string().min(1),
  frases: z.array(FraseSchema),
});

export type Conteudo = z.infer<typeof ConteudoSchema>;