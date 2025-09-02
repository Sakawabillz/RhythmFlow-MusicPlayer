
import fetch from 'node-fetch';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = 5000;
const USERS_FILE = path.join(__dirname, 'users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const PLAYLISTS_FILE = path.join(__dirname, 'playlists.json');

// Configure CORS
const corsOptions = {
  origin: [
    'http://localhost:3000',  // Local development
    'https://rhythmflow-musicplayer-3.onrender.com'  // Production frontend URL
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Middleware to log requests
app.use((req, res, next) => {
  const start = Date.now();
  const { method, url, headers, query, body } = req;
  
  console.log(`\n=== Incoming Request ===`);
  console.log(`${method} ${url}`);
  console.log('Headers:', JSON.stringify(headers, null, 2));
  if (Object.keys(query).length > 0) {
    console.log('Query:', JSON.stringify(query, null, 2));
  }
  if (body && Object.keys(body).length > 0) {
    console.log('Body:', JSON.stringify(body, null, 2));
  }
  
  // Log response finish
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    console.log(`\n=== Response (${duration}ms) ===`);
    console.log(`Status: ${res.statusCode}`);
    if (chunk) {
      try {
        const isJson = res.getHeader('content-type')?.includes('application/json');
        console.log('Body:', isJson ? JSON.stringify(JSON.parse(chunk.toString()), null, 2) : chunk.toString());
      } catch (e) {
        console.log('Body: [binary or unparsable data]');
      }
    }
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
});

// Proxy Deezer search
app.get('/api/search', async (req, res) => {
  console.log('Search request received:', req.query);
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query parameter' });
  try {
    const deezerUrl = `https://api.deezer.com/search?q=${encodeURIComponent(q)}`;
    console.log('Fetching from Deezer:', deezerUrl);
    const response = await fetch(deezerUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Deezer API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Failed to fetch from Deezer',
        status: response.status,
        details: errorText
      });
    }
    
    const data = await response.json();
    console.log('Deezer response:', { resultCount: data?.data?.length || 0 });
    res.json(data);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch from Deezer',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Proxy Deezer track details
app.get('/api/track/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await fetch(`https://api.deezer.com/track/${id}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch track from Deezer' });
  }
});

// Proxy Deezer album details
app.get('/api/album/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await fetch(`https://api.deezer.com/album/${id}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch album from Deezer' });
  }
});

// Helper: Load playlists from file
function loadPlaylists() {
  if (!fs.existsSync(PLAYLISTS_FILE)) return {};
  return JSON.parse(fs.readFileSync(PLAYLISTS_FILE, 'utf-8'));
}

// Helper: Save playlists to file
function savePlaylists(playlists) {
  fs.writeFileSync(PLAYLISTS_FILE, JSON.stringify(playlists, null, 2));
}

// Get user's playlists/favorites
app.get('/api/playlists', authenticateToken, (req, res) => {
  const playlists = loadPlaylists();
  const userEmail = req.user.email;
  res.json({ playlists: playlists[userEmail] || [] });
});

// Save/update user's playlists/favorites
app.post('/api/playlists', authenticateToken, (req, res) => {
  const playlists = loadPlaylists();
  const userEmail = req.user.email;
  const { playlists: newPlaylists } = req.body;
  if (!Array.isArray(newPlaylists)) {
    return res.status(400).json({ error: 'Playlists must be an array' });
  }
  playlists[userEmail] = newPlaylists;
  savePlaylists(playlists);
  res.json({ success: true });
});

// Helper: Load users from file
function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
}

// Helper: Save users to file
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Register endpoint
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const users = loadUsers();
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ error: 'User already exists' });
  }
  const hashed = await bcrypt.hash(password, 10);
  users.push({ email, password: hashed });
  saveUsers(users);
  res.json({ success: true });
});


// Login endpoint (returns JWT)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const users = loadUsers();
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });
  // Issue JWT
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ success: true, token });
});

// JWT middleware for protected routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}


// Server is now started from server.js
