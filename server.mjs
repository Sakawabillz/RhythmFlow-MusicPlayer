import { createServer } from 'http';
import { app } from './auth-server.mjs';

const PORT = process.env.PORT || 5000;

const server = createServer(app);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
