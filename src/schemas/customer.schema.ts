import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional()
});

export const updateCustomerSchema = createCustomerSchema.partial();