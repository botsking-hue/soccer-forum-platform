// Use CommonJS syntax
exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: "✅ Test function is working!",
      timestamp: new Date().toISOString(),
      path: event.path
    })
  };
}
