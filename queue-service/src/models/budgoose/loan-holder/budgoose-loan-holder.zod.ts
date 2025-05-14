import { z } from 'zod';

const createBudgooseHolderSchema = z
  .object({
    name: z
      .string({
        required_error: 'Name is required',
        invalid_type_error: 'Name must be a string',
      })
      .nonempty({
        message: 'Name is required',
      })
      .max(200, {
        message: 'Name must be at most 200 characters long',
      }),
    note: z
      .string({
        required_error: 'Note is required',
        invalid_type_error: 'Note must be a string',
      })
      .max(2000, {
        message: 'Note must be at most 2000 characters long',
      })
      .optional()
      .nullish(),
  })
  .required();

type CreateBudgooseHolderDto = z.infer<typeof createBudgooseHolderSchema>;

// Export the schema
export { createBudgooseHolderSchema };

// Export the type - DTO
export { CreateBudgooseHolderDto };
