// Authentication middleware
const authMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  // In a real application, you would validate against a database
  const validApiKey = process.env.API_KEY || 'secret-key-123';
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key is required in x-api-key header'
    });
  }
  
  if (apiKey !== validApiKey) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid API key'
    });
  }
  
  next();
};

module.exports = authMiddleware;