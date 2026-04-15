import { z } from "zod";

export const workflowStepSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9_-]+$/),
  requiredCapability: z.string().min(3).optional(),
  guidance: z.string().min(10),
  notes: z.string().min(5).optional(),
  optional: z.boolean().optional()
});

export const workflowAdditionalContextSchema = z.object({
  key: z.string().min(1),
  path: z.string().min(1)
});

export const workflowSchema = z.object({
  name: z.string().regex(/^[a-z][A-Za-z0-9._-]+$/),
  title: z.string().min(3),
  description: z.string().min(10),
  objective: z.string().min(10),
  constraints: z.array(z.string()).optional(),
  additionalContext: z.array(workflowAdditionalContextSchema).optional(),
  context: z.record(z.string(), z.unknown()).optional(),
  steps: z.array(workflowStepSchema).min(1)
});

export type WorkflowSchemaType = z.infer<typeof workflowSchema>;
