import z, { ZodType } from 'zod';
import { ApiError } from '../errors';

export * from './schema';

export const validateWithSchema = <ZSchema extends ZodType>(
  schema: ZSchema,
  data: any
) => {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ApiError(
      422,
      `Validation Error: ${result.error.errors.map((e) => e.message)[0]}`
    );
  }

  return result.data as z.infer<ZSchema>;
};
