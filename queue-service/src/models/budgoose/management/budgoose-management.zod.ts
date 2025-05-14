import { z } from 'zod';

const ItemLoanObject = z.object({
  holderId: z
    .string({
      required_error: 'Holder ID is required',
      invalid_type_error: 'Holder ID must be a string',
    })
    .nonempty({
      message: 'Holder ID is required',
    })
    .max(50, {
      message: 'Holder ID must be at most 50 characters long',
    }),
  cash: z
    .number({
      required_error: 'Cash is required',
      invalid_type_error: 'Cash must be a number',
    })
    .min(0, {
      message: 'Cash must be at least 0',
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
});

const createBudgooseManagementSchema = z
  .object({
    date: z
      .string({
        required_error: 'Date is required',
        invalid_type_error: 'Date must be a string',
      })
      .datetime('Date must be a valid date'),
    businessType: z
      .enum(['cash_in', 'cash_out', 'transfer'])
      .refine((val) => ['cash_in', 'cash_out', 'transfer'].includes(val), {
        message: 'Business type must be one of: cash_in, cash_out, transfer',
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
    cash: z
      .number({
        required_error: 'Cash is required',
        invalid_type_error: 'Cash must be a number',
      })
      .min(0, {
        message: 'Cash must be at least 0',
      }),
    budgooseWalletId: z
      .string({
        required_error: 'Budgoose wallet ID is required',
        invalid_type_error: 'Budgoose wallet ID must be a string',
      })
      .nonempty({
        message: 'Budgoose wallet ID is required',
      })
      .max(50, {
        message: 'Budgoose wallet ID must be at most 50 characters long',
      }),
    budgooseWalletTargetId: z
      .string({
        required_error: 'Budgoose wallet target ID is required',
        invalid_type_error: 'Budgoose wallet target ID must be a string',
      })
      .max(50, {
        message: 'Budgoose wallet target ID must be at most 50 characters long',
      })
      .optional()
      .nullish(),
    listItemLoan: z
      .array(ItemLoanObject)
      .refine(
        (items) => {
          const ids = items.map((item) => item.holderId);
          return new Set(ids).size === ids.length; // Check for unique IDs
        },
        {
          message: 'Holder IDs must be unique',
        },
      )
      .optional()
      .nullish(),
  })
  .required();

type CreateBudgooseManagementDto = z.infer<
  typeof createBudgooseManagementSchema
>;

// Export the schema
export { createBudgooseManagementSchema };

// Export the type - DTO
export { CreateBudgooseManagementDto };
