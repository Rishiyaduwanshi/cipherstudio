import { z } from 'zod';

/**
 * Validation middleware that validates request data against a Zod schema
 * Returns formatted validation errors if validation fails
 * 
 * @param {z.ZodSchema} schema - The Zod schema to validate against
 * @param {'body' | 'params' | 'query'} source - Where to get the data from
 */
export function validateSchema(schema, source = 'body') {
  return async (request, params = null) => {
    try {
      let dataToValidate;
      
      switch (source) {
        case 'body':
          dataToValidate = await request.json();
          break;
        case 'params':
          dataToValidate = params;
          break;
        case 'query':
          const { searchParams } = new URL(request.url);
          dataToValidate = Object.fromEntries(searchParams);
          break;
        default:
          throw new Error('Invalid validation source');
      }
      
      const validatedData = schema.parse(dataToValidate);
      return { success: true, data: validatedData, errors: null };
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
          received: err.received
        }));
        
        return {
          success: false,
          data: null,
          errors,
          message: `Validation failed: ${errors.map(e => e.message).join(', ')}`
        };
      }
      
      return {
        success: false,
        data: null,
        errors: [{ field: 'unknown', message: error.message }],
        message: 'Validation error occurred'
      };
    }
  };
}

/**
 * Async validation helper for API routes
 * 
 * @param {z.ZodSchema} schema - The Zod schema to validate against
 * @param {any} data - The data to validate
 * @returns {Promise<{success: boolean, data?: any, errors?: any[], message?: string}>}
 */
export async function validateData(schema, data) {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData, errors: null };
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
        received: err.received
      }));
      
      return {
        success: false,
        data: null,
        errors,
        message: `Validation failed: ${errors.map(e => e.message).join(', ')}`
      };
    }
    
    return {
      success: false,
      data: null,
      errors: [{ field: 'unknown', message: error.message }],
      message: 'Validation error occurred'
    };
  }
}

/**
 * Create a validation error response
 */
export function createValidationErrorResponse(errors, message = 'Validation failed') {
  return {
    message,
    statusCode: 400,
    success: false,
    data: null,
    errors: Array.isArray(errors) ? errors : [errors],
    timestamp: new Date().toISOString()
  };
}

export default {
  validateSchema,
  validateData,
  createValidationErrorResponse
};