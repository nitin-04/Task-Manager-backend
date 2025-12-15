import { z } from 'zod';

export const CreateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    status: z.enum(['To Do', 'In Progress', 'Completed']).optional(),

    priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).optional(),
    dueDate: z.string().optional(),
  }),
});
