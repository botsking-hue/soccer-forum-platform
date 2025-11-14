// shared/cors.js
export function enableCors() {
  return {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
  };
}

export function withCors(handler) {
  return async (event, context) => {
    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: enableCors(),
        body: ''
      };
    }
    
    const response = await handler(event, context);
    
    return {
      ...response,
      headers: {
        ...enableCors(),
        ...response.headers
      }
    };
  };
}