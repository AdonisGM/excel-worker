import { z } from 'zod';

const updateUserSchema = z
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
    email: z
      .string({
        required_error: 'Email is required',
        invalid_type_error: 'Email must be a string',
      })
      .email({
        message: 'Email must be a valid email address',
      })
      .nonempty({
        message: 'Email is required',
      }),
    birthdate: z
      .string({
        required_error: 'Birth date is required',
        invalid_type_error: 'Birth date must be a string',
      })
      .date('Birth date must be a valid date')
      .optional()
      .nullish(),
  })
  .required();

type UpdateUserDto = z.infer<typeof updateUserSchema>;

// Export the schema
export { updateUserSchema };

// Export the type - DTO
export { UpdateUserDto };
