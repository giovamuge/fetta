import { z } from "zod";

export const packageRowSchema = z.object({
	weightKg: z.coerce
		.number()
		.positive("Il peso deve essere positivo"),
	availableCount: z.coerce
		.number()
		.int("Deve essere un intero")
		.positive("La quantità deve essere positiva"),
});

export const proportionRowSchema = z.object({
	alias: z.string().min(1, "Inserire un nome").max(50, "Nome troppo lungo"),
	weight: z.coerce
		.number()
		.positive("La proporzione deve essere positiva"),
});

export const fettaSchema = z.object({
	packages: z.array(packageRowSchema).min(1, "Aggiungi almeno un pacco"),
	proportions: z.array(proportionRowSchema).min(1, "Aggiungi almeno una proporzione"),
});

export type FettaFormValues = z.infer<typeof fettaSchema>;
