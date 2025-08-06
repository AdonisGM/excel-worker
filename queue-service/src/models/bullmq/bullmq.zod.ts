import { z } from 'zod';

/**
 * zod schema for pause add status update
 */
export const pauseAddSchema = z.object({
  isPaused: z.boolean(),
});

/**
 * DTO type for pause add status update
 */
export type PauseAddDto = z.infer<typeof pauseAddSchema>;

/**
 * zod schema for pausing/resuming queue processing
 */
export const pauseSchema = z.object({
  isPaused: z.boolean(),
});

/**
 * DTO type for pausing/resuming queue
 */
export type PauseDto = z.infer<typeof pauseSchema>;
