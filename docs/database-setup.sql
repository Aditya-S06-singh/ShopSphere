-- ShopSphere Database Setup Script for PostgreSQL 18
-- Run this script using psql or pgAdmin connected as a superuser (e.g. postgres)

-- 1. Create the application database user with a secure password
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'shopsphere_user') THEN

      CREATE ROLE shopsphere_user WITH LOGIN PASSWORD 'shopsphere_pass';
   END IF;
END
$do$;

-- 2. Create the database owned by shopsphere_user
SELECT 'CREATE DATABASE shopsphere_db OWNER shopsphere_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'shopsphere_db')\gexec

-- 3. Grant schema permissions
\connect shopsphere_db

GRANT ALL ON SCHEMA public TO shopsphere_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO shopsphere_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO shopsphere_user;

