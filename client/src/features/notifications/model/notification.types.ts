import { z } from 'zod';

export const PushSubscriptionDtoSchema = z.object({
  endpoint: z.string(),
  expirationTime: z.number().nullable(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

export type PushSubscriptionDto = z.infer<typeof PushSubscriptionDtoSchema>;
