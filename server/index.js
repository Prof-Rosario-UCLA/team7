import express from 'express';
import cors from 'cors';
import sequelize from './utils/connect.js';
import authRoutes from './routes/auth.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connection successful');

    await sequelize.sync();
    console.log('✅ DB synced');

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
  }
}

startServer();


