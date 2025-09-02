import { createServer } from 'http';
import { fileURLToPath } from 'url';
import path from 'path';

// Get current file and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import with error handling
let app;
try {
  console.log('Attempting to import auth-server.mjs...');
  const { app: importedApp } = await import('./auth-server.mjs');
  app = importedApp;
  console.log('Successfully imported auth-server.mjs');
} catch (error) {
  console.error('Error importing auth-server.mjs:', error);
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

console.log('Creating HTTP server...');
const server = createServer(app);

// Add error handling for the server
server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
  } else {
    console.error('Unhandled server error:', error);
  }
  process.exit(1);
});

// Add request logging
server.on('request', (req, res) => {
  const start = Date.now();
  const { method, url } = req;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${method} ${url} - ${res.statusCode} - ${duration}ms`);
  });
});

// Start the server
console.log('Starting server...');
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Press Ctrl+C to stop the server');
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server has been stopped');
    process.exit(0);
  });
});
