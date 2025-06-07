import db from '../models/index.js';
import { expect } from 'chai';

const { User, Car, Driver, Citation, sequelize } = db;

describe('Model CRUD', function () {
  before(async function () {
    await sequelize.sync({ force: true });
  });

  it('Create and fetch User', async function () {
    const user = await User.create({ email: 'test@example.com', name: 'Test User', password: 'pass' });
    const found = await User.findByPk(user.id);
    expect(found.email).to.equal('test@example.com');
  });

  it('Create and fetch Car', async function () {
    const car = await Car.create({ license_plate_num: 'ABC123', car_color: 'Red', car_model: 'Toyota' });
    const found = await Car.findByPk(car.id);
    expect(found.license_plate_num).to.equal('ABC123');
  });

  it('Assign Driver (User-Car link)', async function () {
    const user = await User.create({ email: 'driver@example.com', name: 'Driver', password: 'pass' });
    const car = await Car.create({ license_plate_num: 'XYZ789', car_color: 'Blue', car_model: 'Honda' });
    const driver = await Driver.create({ user_id: user.id, car_id: car.id });
    expect(driver.user_id).to.equal(user.id);
    expect(driver.car_id).to.equal(car.id);
  });

  it('Create and fetch Citation', async function () {
    const user = await User.create({ email: 'cite@example.com', name: 'Citee', password: 'pass' });
    const car = await Car.create({ license_plate_num: 'CITE123', car_color: 'Green', car_model: 'Ford' });
    const citation = await Citation.create({
      user_id: user.id,
      car_id: car.id,
      location: { type: 'Point', coordinates: [-118.289, 34.022] },
      status: 'submitted',
      violation: 'parking',
      timestamp: new Date(),
    });
    const found = await Citation.findByPk(citation.id);
    expect(found.location.type).to.equal('Point');
    expect(found.location.coordinates[0]).to.equal(-118.289);
    expect(found.location.coordinates[1]).to.equal(34.022);
  });
}); 