import { z } from 'zod';

const testSchema = z
  .object({
    code: z
      .string({
        required_error: 'Code is required',
        invalid_type_error: 'Code must be a string',
      })
      .nonempty({
        message: 'Code is required',
      }),
    data: z.array(z.record(z.any())),
  })
  .required();

type TestDto = z.infer<typeof testSchema>;

// Export the schema
export { testSchema };

// Export the type - DTO
export { TestDto };
