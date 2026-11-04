import { z } from "zod";

// What the AI must return for one customer message.
export const OrderSchema = z.object({
  isOrder: z.boolean(),
  items: z.array(
    z.object({
      name: z.string().min(1),
      quantity: z.number().int().positive(),
    }),
  ),
  pickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  notes: z.string(),
  confidence: z.enum(["high", "low"]),
  draftReply: z.string(),
});

export type Order = z.infer<typeof OrderSchema>;
