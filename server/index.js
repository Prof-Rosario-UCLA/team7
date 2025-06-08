import express from 'express';
import cors from 'cors';
import sequelize from './utils/connect.js';
import cookieParser from 'cookie-parser';

import authRoutes     from './routes/auth.js';
import carRoutes      from './routes/cars.js';
import driverRoutes   from './routes/drivers.js';
import citationRoutes from './routes/citations.js';
import userRoutes from './routes/users.js';

const app = express();
const PORT = 3001;

const allowedOrigins = [
  'http://localhost:5173',  // Development
  'http://localhost:4173',  // Production preview
  'http://127.0.0.1:4173'  // Alternative production preview
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, origin);
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth',     authRoutes);
app.use('/api/cars',     carRoutes);
app.use('/api/drivers',  driverRoutes);
app.use('/api/citations', citationRoutes);
app.use('/api/users', userRoutes);

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connection successful');

    await sequelize.sync({alter: true});
    console.log('✅ DB synced');

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
  }
}

startServer();


