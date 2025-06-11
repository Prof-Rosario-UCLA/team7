# brakechekr
To run frontend:
- cd client  
- npm run dev

To run backend:
- node index.js

To set up local db:
- docker-compose up -d --build 

To halt local db: 
- docker-compose down  

To deploy (or wait for GHA):
- sh ./deploy.sh

# API endpoints

## Auth endpoints:

| Method | Endpoint         | Description                         | Auth Required |
|--------|------------------|-------------------------------------|---------------|
| POST   | `/auth/signup`   | Register a new user                 | ❌            |
| POST   | `/auth/login`    | Login and receive JWT               | ❌            |
| POST   | `/auth/logout`   | Logout by clearing token cookie     | ✅            |
| GET    | `/auth/protected`| Access protected test route         | ✅            |
| GET    | `/auth/me`       | Get current user profile info       | ✅            |

## Car endpoints:

| Method | Endpoint       | Description                          | Auth Required |
|--------|----------------|--------------------------------------|---------------|
| POST   | `/cars`        | Create a new car                     | ❌            |
| GET    | `/cars`        | Get all cars                         | ❌            |
| GET    | `/cars/:id`    | Get a single car by ID               | ❌            |
| PUT    | `/cars/:id`    | Update color/model of a car          | ❌            |
| DELETE | `/cars/:id`    | Delete a car                         | ❌            |

## Citation endpoints:

| Method | Endpoint                         | Description                                    | Auth Required |
|--------|----------------------------------|------------------------------------------------|---------------|
| POST   | `/citations`                     | Create a citation with optional media upload   | ✅            |
| GET    | `/citations`                     | Get all citations                              | ❌            |
| GET    | `/citations/:id`                 | Get a specific citation by ID                  | ❌            |
| GET    | `/citations/:id/media`           | Get the media file associated with a citation  | ❌            |
| GET    | `/citations/near/:location`      | Get citations near a given lat,lng             | ❌            |
| PUT    | `/citations/:id`                 | Update a citation                              | ❌            |
| DELETE | `/citations/:id`                 | Delete a citation                              | ❌            |

## Driver endpoints:

| Method | Endpoint                    | Description                              | Auth Required |
|--------|-----------------------------|------------------------------------------|---------------|
| POST   | `/drivers`                  | Assign a user to a car                   | ❌            |
| GET    | `/drivers`                  | Get all driver-car assignments           | ❌            |
| GET    | `/drivers/user/:userId`     | Get all cars assigned to a specific user | ❌            |
| GET    | `/drivers/car/:carId`       | Get all users assigned to a specific car | ❌            |
| DELETE | `/drivers/:id`              | Delete a specific driver assignment      | ❌            |

## User endpoints:

| Method | Endpoint    | Description            | Auth Required |
|--------|-------------|------------------------|---------------|
| GET    | `/users`    | Get all users          | ❌            |