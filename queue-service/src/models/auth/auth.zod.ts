import { z } from 'zod';

const signInSchema = z
  .object({
    username: z.string({
      required_error: 'Username is required',
      invalid_type_error: 'Username must be a string',
    }),
    password: z.string({
      required_error: 'Password is required',
      invalid_type_error: 'Password must be a string',
    }),
  })
  .required();

type SignInDto = z.infer<typeof signInSchema>;

const signUpSchema = z
  .object({
    username: z
      .string({
        required_error: 'Username is required',
        invalid_type_error: 'Username must be a string',
      })
      .max(50, {
        message: 'Username must be at most 50 characters long',
      })
      .min(5, {
        message: 'Username must be at least 5 characters long',
      }),
    password: z
      .string({
        required_error: 'Password is required',
        invalid_type_error: 'Password must be a string',
      })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{5,}$/,
        {
          message:
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and be at least 5 characters long',
        },
      )
      .max(60, {
        message: 'Password must be at most 60 characters long',
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
  })
  .required();

type SignUpDto = z.infer<typeof signUpSchema>;

// Export the schema
export { signInSchema, signUpSchema };

// Export the type - DTO
export { SignInDto, SignUpDto };
