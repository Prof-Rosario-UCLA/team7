import express from 'express';
import db from '../models/index.js';

const router = express.Router();
const { Citation, User, Car } = db;

// CREATE a new citation → POST /citations
router.post('/', async (req, res) => {
  try {
    const {
      blob,
      user_id,
      car_id,
      timestamp,
      location,
      status,
      violation,
      notes
    } = req.body;

    // Validate FK existence:
    const user = await User.findByPk(user_id);
    const car  = await Car.findByPk(car_id);
    if (!user || !car) {
      return res.status(400).json({ error: 'Invalid user_id or car_id' });
    }

    const newCitation = await Citation.create({
      blob:       blob || null,
      user_id,
      car_id,
      timestamp:  timestamp ? new Date(timestamp) : new Date(),
      location,
      status,
      violation,
      notes:      notes || null
    });

    return res.status(201).json(newCitation);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET all citations → GET /citations
router.get('/', async (req, res) => {
  try {
    const all = await Citation.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'email', 'name'] },
        { model: Car,  as: 'car',  attributes: ['id', 'license_plate_num', 'car_color', 'car_model'] }
      ]
    });
    return res.json(all);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET one citation → GET /citations/:id
router.get('/:id', async (req, res) => {
  try {
    const citation = await Citation.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'email', 'name'] },
        { model: Car,  as: 'car',  attributes: ['id', 'license_plate_num', 'car_color', 'car_model'] }
      ]
    });
    if (!citation) return res.status(404).json({ error: 'Citation not found' });
    return res.json(citation);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// UPDATE a citation → PUT /citations/:id
router.put('/:id', async (req, res) => {
  try {
    const citation = await Citation.findByPk(req.params.id);
    if (!citation) return res.status(404).json({ error: 'Citation not found' });

    // Only update allowed fields:
    const fields = ['blob', 'timestamp', 'location', 'status', 'violation', 'notes'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        citation[field] =
          field === 'timestamp' ? new Date(req.body.timestamp) : req.body[field];
      }
    });

    await citation.save();
    return res.json(citation);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// DELETE a citation → DELETE /citations/:id
router.delete('/:id', async (req, res) => {
  try {
    const citation = await Citation.findByPk(req.params.id);
    if (!citation) return res.status(404).json({ error: 'Citation not found' });
    await citation.destroy();
    return res.json({ message: 'Citation deleted' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
