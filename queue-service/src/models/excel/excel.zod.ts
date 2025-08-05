import { z } from 'zod';

const excelSchema = z
  .object({
    referId: z.string(),
    code: z
      .string({
        required_error: 'Code is required',
        invalid_type_error: 'Code must be a string',
      })
      .nonempty({
        message: 'Code is required',
      }),
    data: z.array(z.array(z.record(z.any()))),
    webhook: z.string(),
  })
  .required();

type ExcelDto = z.infer<typeof excelSchema>;

// Export the schema
export { excelSchema };

// Export the type - DTO
export { ExcelDto };
