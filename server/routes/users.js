import express from 'express';
import db from '../models/index.js';
const router = express.Router();
const { User } = db;

router.get('/', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

export default router;
