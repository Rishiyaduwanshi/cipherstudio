import { z } from 'zod';

// Project Creation Schema
export const projectCreationSchema = z.object({
  projectSlug: z
    .string()
    .min(1, "Project slug is required")
    .min(3, "Project slug must be at least 3 characters")
    .max(50, "Project slug must not exceed 50 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Project slug can only contain lowercase letters, numbers, and hyphens"
    )
    .refine(
      (val) => !val.startsWith('-') && !val.endsWith('-'),
      "Project slug cannot start or end with a hyphen"
    ),
  
  name: z
    .string()
    .min(1, "Project name is required")
    .min(3, "Project name must be at least 3 characters")
    .max(100, "Project name must not exceed 100 characters")
    .trim(),
  
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .trim()
    .optional()
    .default(""),
  
  settings: z.object({
    framework: z
      .enum(['vanilla', 'react', 'vue', 'angular', 'svelte', 'next', 'nuxt'])
      .default('vanilla'),
    autoSave: z.boolean().default(true),
    theme: z.enum(['light', 'dark']).optional(),
    language: z.enum(['javascript', 'typescript']).optional()
  }).optional().default({
    framework: 'vanilla',
    autoSave: true
  })
});

// Project Update Schema
export const projectUpdateSchema = z.object({
  name: z
    .string()
    .min(3, "Project name must be at least 3 characters")
    .max(100, "Project name must not exceed 100 characters")
    .trim()
    .optional(),
  
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .trim()
    .optional(),
  
  settings: z.object({
    framework: z
      .enum(['vanilla', 'react', 'vue', 'angular', 'svelte', 'next', 'nuxt'])
      .optional(),
    autoSave: z.boolean().optional(),
    theme: z.enum(['light', 'dark']).optional(),
    language: z.enum(['javascript', 'typescript']).optional()
  }).optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  "At least one field must be provided for update"
);

// Project ID Params Schema
export const projectParamsSchema = z.object({
  id: z
    .string()
    .min(1, "Project ID is required")
    .regex(/^[a-fA-F0-9]{24}$/, "Invalid project ID format")
});

export default {
  projectCreationSchema,
  projectUpdateSchema,
  projectParamsSchema
};