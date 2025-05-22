import express from 'express';
import db from '../models/index.js';

const router = express.Router();
const { Driver, Car, User } = db;

// ASSIGN a driver (link user ↔ car) → POST /drivers
router.post('/', async (req, res) => {
  try {
    const { car_id, user_id } = req.body;

    // Ensure both exist:
    const car  = await Car.findByPk(car_id);
    const user = await User.findByPk(user_id);
    if (!car || !user) {
      return res.status(400).json({ error: 'Invalid car_id or user_id' });
    }

    // Check for duplicate assignment
    const existing = await Driver.findOne({ where: { car_id, user_id } });
    if (existing) {
      return res.status(400).json({ error: 'Driver already assigned to this car' });
    }

    const assignment = await Driver.create({ car_id, user_id });
    return res.status(201).json(assignment);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET all assignments → GET /drivers
router.get('/', async (req, res) => {
  try {
    // Eager‐load user & car
    const assignments = await Driver.findAll({
      include: [
        { model: Car,  as: 'Car' },
        { model: User, as: 'User' }
      ]
    });
    return res.json(assignments);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET all cars for a user → GET /drivers/user/:userId
router.get('/user/:userId', async (req, res) => {
  try {
    const list = await Driver.findAll({
      where: { user_id: req.params.userId },
      include: [{ model: Car, as: 'Car' }]
    });
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET all drivers for a car → GET /drivers/car/:carId
router.get('/car/:carId', async (req, res) => {
  try {
    const list = await Driver.findAll({
      where: { car_id: req.params.carId },
      include: [{ model: User, as: 'User' }]
    });
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE a driver assignment → DELETE /drivers/:id
router.delete('/:id', async (req, res) => {
  try {
    const assignment = await Driver.findByPk(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    await assignment.destroy();
    return res.json({ message: 'Driver assignment removed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
