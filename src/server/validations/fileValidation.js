import { z } from 'zod';

// File/Folder Creation Schema
export const fileCreationSchema = z.object({
  projectId: z
    .string()
    .min(1, "Project ID is required")
    .regex(/^[a-fA-F0-9]{24}$/, "Invalid project ID format"),
  
  parentId: z
    .string()
    .regex(/^[a-fA-F0-9]{24}$/, "Invalid parent ID format")
    .optional()
    .nullable(),
  
  name: z
    .string()
    .min(1, "File/folder name is required")
    .max(255, "File/folder name must not exceed 255 characters")
    .refine(
      (val) => !/[<>:"/\\|?*\x00-\x1f]/.test(val),
      "File/folder name contains invalid characters"
    )
    .refine(
      (val) => !['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'].includes(val.toUpperCase()),
      "File/folder name is a reserved system name"
    )
    .refine(
      (val) => !val.startsWith('.') || val.length > 1,
      "File/folder name cannot be just a dot"
    )
    .trim(),
  
  type: z.enum(['file', 'folder'], {
    required_error: "Type is required",
    invalid_type_error: "Type must be either 'file' or 'folder'"
  }),
  
  content: z
    .string()
    .optional()
    .default("")
}).refine(
  (data) => {
    if (data.type === 'folder' && data.content && data.content.trim() !== '') {
      return false;
    }
    return true;
  },
  {
    message: "Folders cannot have content",
    path: ["content"]
  }
);

// File Update Schema
export const fileUpdateSchema = z.object({
  name: z
    .string()
    .min(1, "File/folder name is required")
    .max(255, "File/folder name must not exceed 255 characters")
    .refine(
      (val) => !/[<>:"/\\|?*\x00-\x1f]/.test(val),
      "File/folder name contains invalid characters"
    )
    .refine(
      (val) => !['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'].includes(val.toUpperCase()),
      "File/folder name is a reserved system name"
    )
    .trim()
    .optional(),
  
  parentId: z
    .string()
    .regex(/^[a-fA-F0-9]{24}$/, "Invalid parent ID format")
    .optional()
    .nullable(),
  
  content: z
    .string()
    .optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  "At least one field must be provided for update"
);

// File ID Params Schema
export const fileParamsSchema = z.object({
  id: z
    .string()
    .min(1, "File ID is required")
    .regex(/^[a-fA-F0-9]{24}$/, "Invalid file ID format")
});

// File Query Schema (for listing files)
export const fileQuerySchema = z.object({
  projectId: z
    .string()
    .regex(/^[a-fA-F0-9]{24}$/, "Invalid project ID format")
    .optional(),
  
  parentId: z
    .string()
    .regex(/^[a-fA-F0-9]{24}$/, "Invalid parent ID format")
    .optional()
    .nullable(),
  
  type: z.enum(['file', 'folder']).optional(),
  
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 100, "Limit must be between 1 and 100")
    .optional()
    .default(50),
  
  offset: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 0, "Offset must be non-negative")
    .optional()
    .default(0)
});

export default {
  fileCreationSchema,
  fileUpdateSchema,
  fileParamsSchema,
  fileQuerySchema
};