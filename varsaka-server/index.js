require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const prisma = new PrismaClient();
const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'varsaka-super-secret-key';

// Security: Helmet
app.use(helmet());

// Security: Strict CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : ['http://localhost:5173'];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

// Middleware: Check Blocked IP
app.use(async (req, res, next) => {
  try {
    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
    if (!clientIp) return next();
    const ip = clientIp.split(',')[0].trim();
    
    // Quick check if IP is in BlockedIP table
    const isBlocked = await prisma.blockedIP.findUnique({ where: { ipAddress: ip } });
    if (isBlocked) {
      return res.status(403).send('Your IP address is blocked from accessing this server.');
    }
    next();
  } catch (err) {
    next();
  }
});

// Middleware to block offline apps before proxying
const checkAppStatus = (appName) => {
  return async (req, res, next) => {
    try {
      const appStatus = await prisma.appStatus.findUnique({ where: { id: appName } });
      if (appStatus && !appStatus.isOnline) {
        return res.status(503).send(`<h1>503 Service Unavailable</h1><p>The ${appName} application is currently down for maintenance.</p>`);
      }
      next();
    } catch (err) {
      next();
    }
  }
};

// Sub-path proxies removed in favor of subdomain routing.

// --- API ROUTES (Parse JSON for internal APIs) ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', gateway: 'Varsaka', timestamp: new Date().toISOString() });
});

// Security: API Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 auth requests per windowMs
  message: { error: 'Too many authentication attempts, please try again later.' }
});

// Auth APIs
app.use('/api/auth/', authLimiter);
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });
  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, apps: user.apps, isAdmin: user.isAdmin },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.json({ token, user: { id: user.id, username: user.username, apps: user.apps, isAdmin: user.isAdmin } });
});

app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) return res.status(400).json({ error: 'Username taken' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: { username, password: hashedPassword, apps: "react", isAdmin: false }
  });

  res.json({ success: true, user: { id: newUser.id, username: newUser.username } });
});

// Admin APIs (Protect these with a simple admin check middleware)
const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.isAdmin) throw new Error();
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Forbidden. Admin only.' });
  }
};

app.get('/api/admin/apps', adminAuth, async (req, res) => {
  const apps = await prisma.appStatus.findMany();
  res.json(apps);
});

app.post('/api/admin/apps/toggle', adminAuth, async (req, res) => {
  const { appName, isOnline } = req.body;
  const app = await prisma.appStatus.upsert({
    where: { id: appName },
    update: { isOnline },
    create: { id: appName, isOnline }
  });
  res.json(app);
});

app.get('/api/admin/ips', adminAuth, async (req, res) => {
  const ips = await prisma.blockedIP.findMany();
  res.json(ips);
});

app.post('/api/admin/ips/block', adminAuth, async (req, res) => {
  const { ipAddress, reason } = req.body;
  const blocked = await prisma.blockedIP.create({ data: { ipAddress, reason } });
  res.json(blocked);
});

app.post('/api/admin/ips/unblock', adminAuth, async (req, res) => {
  const { ipAddress } = req.body;
  await prisma.blockedIP.delete({ where: { ipAddress } });
  res.json({ success: true });
});

app.get('/api/admin/users', adminAuth, async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, username: true, apps: true, isAdmin: true, createdAt: true }
  });
  res.json(users);
});

app.post('/api/admin/users/permissions', adminAuth, async (req, res) => {
  const { userId, apps } = req.body;
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { apps }
  });
  res.json({ success: true, apps: updated.apps });
});

// --- MAIN SUBDOMAIN PROXY (Must be placed AFTER API routes so APIs aren't proxied) ---
app.use('/', (req, res, next) => {
  // Determine which app to check based on host
  const host = req.headers.host || req.hostname;
  if (host.startsWith('loginto.varsaka.com') || host.startsWith('loginto.localhost')) {
    checkAppStatus('admin')(req, res, next);
  } else if (host.startsWith('invoice.varsaka.com') || host.startsWith('invoice.localhost')) {
    checkAppStatus('invoice')(req, res, next);
  } else if (host.startsWith('blog.varsaka.com') || host.startsWith('blog.localhost')) {
    checkAppStatus('blogs')(req, res, next);
  } else {
    checkAppStatus('react')(req, res, next);
  }
}, createProxyMiddleware({
  target: 'http://127.0.0.1:5173', // Default: Main Website
  changeOrigin: true,
  ws: true,
  router: function(req) {
    const host = req.headers.host || '';
    if (host.startsWith('loginto.varsaka.com') || host.startsWith('loginto.localhost')) {
      return 'http://127.0.0.1:5174';
    }
    if (host.startsWith('invoice.varsaka.com') || host.startsWith('invoice.localhost')) {
      return 'http://127.0.0.1:3000';
    }
    if (host.startsWith('blog.varsaka.com') || host.startsWith('blog.localhost')) {
      return 'http://127.0.0.1:3001';
    }
    return 'http://127.0.0.1:5173';
  }
}));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`[Varsaka Gateway] Running on http://localhost:${PORT}`);
});
