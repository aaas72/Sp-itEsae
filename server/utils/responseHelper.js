/**
 * Create standardized success response
 */
const createSuccessResponse = (data, message = 'Success') => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

/**
 * Create standardized error response
 */
const createErrorResponse = (code, message, details = null) => {
  const response = {
    success: false,
    error: {
      code,
      message
    },
    timestamp: new Date().toISOString()
  };
  
  if (details) {
    response.error.details = details;
  }
  
  return response;
};

module.exports = {
  createSuccessResponse,
  createErrorResponse
};