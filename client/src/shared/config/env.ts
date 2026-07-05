import { z } from 'zod';

const EnvSchema = z.object({
  VITE_API_BASE_URL: z.string().min(1, 'API ADDRESS IS NOT SET.'),
});

const parsed = EnvSchema.safeParse(import.meta.env);

if (!parsed.success) {
  const error = new Error('ENV VALIDATION_ERROR');

  const summary = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n');
  console.error(`ENVIRONMENT VARIABLES ARE NOT SET PROPERLY.\n${summary}`);

  console.table(parsed.error.issues, ['path', 'message']);

  throw error;
}

export const env = parsed.data;