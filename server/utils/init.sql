-- Database initialization script
-- Add your table creation and other initialization SQL here
CREATE EXTENSION IF NOT EXISTS postgis;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS citations CASCADE;
DROP TABLE IF EXISTS cars CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS enum_citations_status CASCADE;
DROP TYPE IF EXISTS enum_citations_violation CASCADE;

-- Create ENUM types
CREATE TYPE enum_citations_status AS ENUM ('submitted', 'rejected', 'accepted');
CREATE TYPE enum_citations_violation AS ENUM ('speeding', 'parking', 'signal', 'other');

-- Create tables with proper types
CREATE TABLE IF NOT EXISTS citations (
  id SERIAL PRIMARY KEY,
  blob BYTEA,
  media_type VARCHAR(255),
  media_filename VARCHAR(255),
  user_id INTEGER,
  car_id INTEGER,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  status enum_citations_status NOT NULL DEFAULT 'submitted',
  violation enum_citations_violation NOT NULL,
  notes TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);