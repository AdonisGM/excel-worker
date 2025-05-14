import { z } from 'zod';

const createBudgooseWalletSchema = z
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
    description: z
      .string({
        required_error: 'Description is required',
        invalid_type_error: 'Description must be a string',
      })
      .max(2000, {
        message: 'Description must be at most 2000 characters long',
      })
      .optional()
      .nullish(),
  })
  .required();

type CreateBudgooseWalletDto = z.infer<typeof createBudgooseWalletSchema>;

// Export the schema
export { createBudgooseWalletSchema };

// Export the type - DTO
export { CreateBudgooseWalletDto };
