import { expect, use } from 'chai';
import chaiHttp, { request } from 'chai-http';
import express from 'express';
import db from '../models/index.js';
import authRoutes from '../routes/auth.js';
import carRoutes from '../routes/cars.js';
import driverRoutes from '../routes/drivers.js';
import citationRoutes from '../routes/citations.js';

use(chaiHttp);
const { sequelize } = db;

const makeApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/cars', carRoutes);
  app.use('/api/drivers', driverRoutes);
  app.use('/api/citations', citationRoutes);
  return app;
};

describe('API Routes', function () {
  let app;
  before(async function () {
    await sequelize.sync({ force: true });
    app = makeApp();
  });
  after(async function () {
    await sequelize.close();
  });

  describe('/api/auth', function () {
    it('Signup and login', async function () {
      const signup = await request.execute(app)
        .post('/api/auth/signup')
        .send({ email: 'apiuser@example.com', password: 'pass', name: 'Auth User' });
      expect(signup.status).to.equal(201);
      const login = await request.execute(app)
        .post('/api/auth/login')
        .send({ email: 'apiuser@example.com', password: 'pass', name: 'Auth User' });
      expect(login.status).to.equal(200);
    });
  });

  describe('/api/cars', function () {
    it('Create and get car', async function () {
      const res = await request.execute(app)
        .post('/api/cars')
        .send({ license_plate_num: 'ROUTE123', car_color: 'Yellow', car_model: 'Tesla' });
      expect(res.status).to.equal(201);
      const get = await request.execute(app).get('/api/cars');
      expect(get.body.length).to.be.greaterThan(0);
    });
  });

  describe('/api/drivers', function () {
    it('Assign driver and get assignments', async function () {
      // Create user and car first
      const user = await db.User.create({ email: 'driver2@example.com', name: 'Driver2', password: 'pass' });
      const car = await db.Car.create({ license_plate_num: 'DRV123', car_color: 'Black', car_model: 'BMW' });
      const assign = await request.execute(app)
        .post('/api/drivers')
        .send({ user_id: user.id, car_id: car.id });
      expect(assign.status).to.equal(201);
      const get = await request.execute(app).get('/api/drivers');
      expect(get.body.length).to.be.greaterThan(0);
    });
  });

  describe('/api/citations', function () {
    it('Create and get citation', async function () {
      // Create user and car first
      const user = await db.User.create({ email: 'cite2@example.com', name: 'Citee2', password: 'pass' });
      const car = await db.Car.create({ license_plate_num: 'CITE456', car_color: 'White', car_model: 'Audi' });
      const res = await request.execute(app)
        .post('/api/citations')
        .send({
          user_id: user.id,
          car_id: car.id,
          location: 'API Test',
          status: 'submitted',
          violation: 'speeding',
          timestamp: new Date(),
        });
      expect(res.status).to.equal(201);
      const get = await request.execute(app).get('/api/citations');
      expect(get.body.length).to.be.greaterThan(0);
    });
  });
}); 