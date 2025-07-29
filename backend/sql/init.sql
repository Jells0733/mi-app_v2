-- backend/sql/init.sql

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'empleado')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS empleados (
  id SERIAL PRIMARY KEY,
  fecha_ingreso DATE,
  nombre VARCHAR(50) NOT NULL,
  salario NUMERIC,
  id_usuario INTEGER UNIQUE REFERENCES users(id)  -- <-- lo agregamos aquí
);

CREATE TABLE IF NOT EXISTS solicitudes (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50),
  descripcion VARCHAR(50),
  resumen VARCHAR(50),
  id_empleado INTEGER REFERENCES empleados(id) ON DELETE CASCADE
);
