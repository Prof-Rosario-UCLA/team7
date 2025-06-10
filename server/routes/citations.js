import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from '../models/index.js';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware/auth.js';
import { Op, fn, col, literal } from 'sequelize';

const router = express.Router();
const { Citation, User, Car, sequelize } = db;

// CREATE a new citation → POST /citations
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('req.user:', req.user);
    console.log('car_id from body:', req.body.car_id);

    const {
      blob,
      car_id,
      timestamp,
      location,
      status,
      violation,
      notes
    } = req.body;

    const user_id = req.user.userId; // <-- get user id from the authenticated user

    // Validate FK existence:
    const user = await User.findByPk(user_id);
    const car  = await Car.findByPk(car_id);
    if (!user || !car) {
      return res.status(400).json({ error: 'Invalid user_id or car_id' });
    }

    console.log('user found:', user ? user.id : null);
    console.log('car found:', car ? car.id : null);

    const newCitation = await Citation.create({
      blob:       blob || null,
      user_id: user_id,
      car_id: car_id,
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

// GET citations closest to a certain location, formatted as "lat,lng" → GET /citations/:location
// GET /citations/34.022,-118.289?radius=500
router.get('/near/:location', async (req, res) => {
  try {
    const [latStr, lngStr] = req.params.location.split(',');
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    const radius = parseFloat(req.query.radius) || 1000; // in meters

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'Invalid location format. Use lat,lng' });
    }

    const results = await Citation.findAll({
      where: literal(`ST_DWithin(
        location,
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
        ${radius}
      )`),
      include: [
        { model: User, as: 'user', attributes: ['id', 'email', 'name'] },
        { model: Car,  as: 'car',  attributes: ['id', 'license_plate_num', 'car_color', 'car_model'] }
      ]
    });

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
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

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Set up multer disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const uniqueName = `${base}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
  fileFilter: (req, file, cb) => {
    const isValid =
      file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/');
    cb(null, isValid);
  }
});

// POST /citations/upload -> Upload file/image
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const url = `/uploads/${req.file.filename}`;
  res.status(200).json({ url });
});

export default router;
