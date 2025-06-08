import express from 'express';
import db from '../models/index.js';

const router = express.Router();
const { Car } = db;

// CREATE a new car → POST /cars
router.post('/', async (req, res) => {
  try {
    console.log("Creating car:", req.body);
    const { license_plate_num, car_color, car_model } = req.body;

    // Check uniqueness
    const existing = await Car.findOne({ where: { license_plate_num } });
    if (existing) {
      return res.status(400).json({ error: 'License plate already registered' });
    }

    const newCar = await Car.create({ license_plate_num, car_color, car_model });
    return res.status(201).json(newCar);
  } catch (err) {
    console.error(err); 
    return res.status(500).json({ error: err.message });
  }
});

// GET all cars → GET /cars
router.get('/', async (req, res) => {
  try {
    const cars = await Car.findAll();
    return res.json(cars);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET one car → GET /cars/:id
router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ error: 'Car not found' });
    return res.json(car);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// UPDATE a car (only color/model) → PUT /cars/:id
router.put('/:id', async (req, res) => {
  try {
    const { car_color, car_model } = req.body;
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ error: 'Car not found' });

    if (car_color !== undefined) car.car_color = car_color;
    if (car_model !== undefined) car.car_model = car_model;

    await car.save();
    return res.json(car);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// DELETE a car → DELETE /cars/:id
router.delete('/:id', async (req, res) => {
  try {
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ error: 'Car not found' });
    await car.destroy();
    return res.json({ message: 'Car deleted' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
