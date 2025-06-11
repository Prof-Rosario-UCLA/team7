import express from 'express';
import cors from 'cors';
import sequelize from './utils/connect.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes     from './routes/auth.js';
import carRoutes      from './routes/cars.js';
import driverRoutes   from './routes/drivers.js';
import citationRoutes from './routes/citations.js';
import userRoutes from './routes/users.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Disable caching for HTML files
app.use((req, res, next) => {
  if (req.url === '/' || req.url.endsWith('.html')) {
    res.set('Cache-Control', 'no-store');
  }
  next();
});

const allowedOrigins = [
  'http://localhost:5173',      // Development
  'http://localhost:4173',      // Production preview
  'http://127.0.0.1:4173',     // Alternative production preview
  'https://breakchekr.uc.r.appspot.com',  // GAE deployed frontend
  'https://breakchekr.uw.r.appspot.com',  // Alternative region
  'https://breakchekr.appspot.com'        // Base domain
];

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    console.log('🔎 Incoming Origin:', origin);
    
    // Allow requests with no origin (like mobile apps, curl requests, or same origin)
    if (!origin || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) === -1) {
      console.warn(`⚠️ Blocked request from unauthorized origin: ${origin}`);
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    
    return callback(null, origin);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(cookieParser());

// API routes
app.use('/api/auth',      authRoutes);
app.use('/api/cars',      carRoutes);
app.use('/api/drivers',   driverRoutes);
app.use('/api/citations', citationRoutes);
app.use('/api/users',     userRoutes);

// Serve frontend build
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientBuildPath = path.join(__dirname, 'client-build');

// Serve static files
app.use(express.static(clientBuildPath));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
});

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connection successful');

    await sequelize.sync({ alter: true });
    console.log('✅ DB synced');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1); // Exit if we can't start the server
  }
}

startServer();


