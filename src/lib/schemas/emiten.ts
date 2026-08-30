import { z } from "zod";

export const emitenSchema = z.object({
  symbol: z.string().min(1).max(10).transform((val) => val.toUpperCase()),
  name: z.string().min(1),
  is_active: z.boolean().default(true),
});

export const updateEmitenSchema = emitenSchema.partial();

export type Emiten = {
  id: string;
  symbol: string;
  name: string;
  is_active: boolean;
  created_at: string;
};
