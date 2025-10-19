import { NextResponse } from 'next/server';
import { config } from '@server/config';

/**
 * Standard API response helper that uses config values
 */
export function createResponse(data, options = {}) {
  const {
    statusCode = 200,
    message = 'Success',
    success = true,
    metadata = {}
  } = options;

  const response = {
    message,
    statusCode,
    success,
    data: success ? data : null,
    timestamp: new Date().toISOString(),
    ...(Object.keys(metadata).length > 0 && { metadata }),
    ...(config.NODE_ENV === 'development' && { 
      environment: config.NODE_ENV,
      version: config.VERSION 
    })
  };

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Error response helper
 */
export function createErrorResponse(error, statusCode = 500) {
  const message = error instanceof Error ? error.message : error;
  
  return createResponse(null, {
    statusCode,
    message,
    success: false,
    metadata: {
      ...(config.NODE_ENV === 'development' && error.stack && { 
        stack: error.stack 
      })
    }
  });
}

/**
 * Success response helper
 */
export function createSuccessResponse(data, message = 'Operation completed successfully') {
  return createResponse(data, {
    statusCode: 200,
    message,
    success: true
  });
}

/**
 * Created response helper
 */
export function createCreatedResponse(data, message = 'Resource created successfully') {
  return createResponse(data, {
    statusCode: 201,
    message,
    success: true
  });
}