import { z } from 'zod';

// User Registration Schema
export const userRegistrationSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),

  lastName: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),

  email: z
    .email('Please provide a valid email address')
    .min(1, 'Email is required')
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters long')
    .max(100, 'Password must not exceed 100 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    ),

  mobile: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[+]?[\d\s\-()]{10,15}$/.test(val),
      'Please provide a valid mobile number'
    ),
});

// User Login Schema
export const userLoginSchema = z.object({
  email: z
    .min(1, 'Email is required')
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),

  password: z.string().min(1, 'Password is required'),
});

// User Update Schema (for future use)
export const userUpdateSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces')
    .optional(),

  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces')
    .optional(),

  mobile: z
    .string()
    .refine(
      (val) => !val || /^[+]?[\d\s\-()]{10,15}$/.test(val),
      'Please provide a valid mobile number'
    )
    .optional(),

  settings: z
    .object({
      theme: z.enum(['light', 'dark', 'system']).optional(),
    })
    .optional(),
});

export default {
  userRegistrationSchema,
  userLoginSchema,
  userUpdateSchema,
};
