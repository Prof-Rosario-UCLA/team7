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

app.use(cors({
  origin: 'http://localhost:5173',
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


