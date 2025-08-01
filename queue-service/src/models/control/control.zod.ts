import { z } from 'zod';

const updateStatusQueueSchema = z
  .object({
    pause: z.boolean({
      required_error: 'Pause status is required',
      invalid_type_error: 'Pause status must be a boolean',
    }),
  })
  .required();

type UpdateStatusQueueDto = z.infer<typeof updateStatusQueueSchema>;

// Export the schema
export { updateStatusQueueSchema };

// Export the type - DTO
export { UpdateStatusQueueDto };
