import { ZodType } from 'zod';
import { ApiError } from '../errors';

export * from './schema';

export const validateWithSchema = (
  schema: ZodType,
  data: any
): {
  [key: string]: any;
} => {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ApiError(
      422,
      `Validation Error: ${result.error.errors.map((e) => e.message)[0]}`
    );
  }
  return result.data;
};
