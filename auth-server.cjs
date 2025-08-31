
const fetch = require('node-fetch');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;
const USERS_FILE = path.join(__dirname, 'users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const PLAYLISTS_FILE = path.join(__dirname, 'playlists.json');

app.use(cors());
app.use(express.json());

// Proxy Deezer search
app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query parameter' });
  try {
    const response = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(q)}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from Deezer' });
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


app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
});
