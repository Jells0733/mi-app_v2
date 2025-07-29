# MI-APP - Sistema de Gestión de Empleados y Solicitudes

## Descripción Técnica

Sistema full-stack con:
- **Backend**: Node.js + Express + PostgreSQL
- **Frontend**: React + Webpack
- **Base de Datos**: PostgreSQL
- **Autenticación**: JWT
- **Contenedores**: Docker + Docker Compose

## Estructura de Base de Datos

### Tabla: users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'empleado')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: empleados
```sql
CREATE TABLE empleados (
  id SERIAL PRIMARY KEY,
  fecha_ingreso DATE,
  nombre VARCHAR(50) NOT NULL,
  salario NUMERIC,
  id_usuario INTEGER UNIQUE REFERENCES users(id)
);
```

### Tabla: solicitudes
```sql
CREATE TABLE solicitudes (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50),
  descripcion VARCHAR(50),
  resumen VARCHAR(50),
  id_empleado INTEGER REFERENCES empleados(id) ON DELETE CASCADE
);
```

## Queries Básicas del Sistema

### Usuarios
```sql
-- Crear usuario
INSERT INTO users (username, email, password, role) 
VALUES ($1, $2, $3, $4) RETURNING *;

-- Obtener usuario por email
SELECT * FROM users WHERE email = $1;
```

### Empleados
```sql
-- Obtener todos los empleados
SELECT * FROM empleados ORDER BY id;

-- Crear empleado
INSERT INTO empleados (nombre, fecha_ingreso, salario, id_usuario)
VALUES ($1, $2, $3, $4) RETURNING *;

-- Obtener empleado por ID
SELECT * FROM empleados WHERE id = $1;

-- Obtener empleado por id_usuario
SELECT * FROM empleados WHERE id_usuario = $1;

-- Actualizar empleado
UPDATE empleados 
SET nombre = $1, fecha_ingreso = $2, salario = $3
WHERE id = $4 RETURNING *;

-- Eliminar empleado
DELETE FROM empleados WHERE id = $1 RETURNING *;
```

### Solicitudes
```sql
-- Obtener todas las solicitudes con datos del empleado
SELECT 
  s.id, s.codigo, s.descripcion, s.resumen, s.id_empleado,
  e.nombre AS empleado_nombre
FROM solicitudes s
LEFT JOIN empleados e ON s.id_empleado = e.id
ORDER BY s.id;

-- Crear solicitud
INSERT INTO solicitudes (codigo, descripcion, resumen, id_empleado)
VALUES ($1, $2, $3, $4) RETURNING *;

-- Obtener solicitudes por empleado
SELECT * FROM solicitudes WHERE id_empleado = $1 ORDER BY id;

-- Actualizar solicitud
UPDATE solicitudes
SET codigo = $1, descripcion = $2, resumen = $3, id_empleado = $4
WHERE id = $5 RETURNING *;

-- Eliminar solicitud
DELETE FROM solicitudes WHERE id = $1;
```

## Comandos de Arranque

### Opción 1: Docker Compose (Recomendado)
```bash
# Arrancar todo el sistema
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener sistema
docker-compose down

# Reconstruir contenedores
docker-compose up --build -d
```

### Opción 2: Desarrollo Local

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Base de Datos
```bash
# PostgreSQL debe estar corriendo en puerto 5432
# Usuario: postgres
# Password: Ntc0394**
# Base de datos: miapp
```

## Puertos del Sistema

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Base de Datos**: localhost:5432
- **PgAdmin**: http://localhost:5050

## Endpoints API

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión

### Empleados
- `GET /api/empleados` - Obtener todos los empleados
- `POST /api/empleados` - Crear empleado
- `GET /api/empleados/:id` - Obtener empleado por ID
- `PUT /api/empleados/:id` - Actualizar empleado
- `DELETE /api/empleados/:id` - Eliminar empleado

### Solicitudes
- `GET /api/solicitudes` - Obtener todas las solicitudes
- `POST /api/solicitudes` - Crear solicitud
- `GET /api/solicitudes/:id` - Obtener solicitud por ID
- `PUT /api/solicitudes/:id` - Actualizar solicitud
- `DELETE /api/solicitudes/:id` - Eliminar solicitud

## Testing

### Backend Tests
```bash
cd backend
npm test                    # Ejecutar todos los tests
npm run test:unit          # Solo tests unitarios
npm run test:integration   # Solo tests de integración
npm run test:coverage      # Tests con cobertura
```

### Docker Tests
```bash
# Tests en contenedor
docker-compose run --rm test-runner

# Tests unitarios en contenedor
docker-compose run --rm test-runner npm run test:unit

# Tests de integración en contenedor
docker-compose run --rm test-runner npm run test:integration
```

## Variables de Entorno

### Backend (.env)
```
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=Ntc0394**
DB_NAME=miapp
JWT_SECRET=tu_jwt_secret_aqui
```

## Funcionalidades del Sistema

### Roles de Usuario
- **admin**: Acceso completo al sistema
- **empleado**: Acceso limitado a sus propias solicitudes

### Módulos Principales
1. **Autenticación**: Login/Registro con JWT
2. **Gestión de Empleados**: CRUD completo
3. **Gestión de Solicitudes**: CRUD con asignación a empleados
4. **Panel de Administración**: Vista completa para admins
5. **Panel de Empleado**: Vista limitada para empleados

### Características Técnicas
- Autenticación JWT
- Middleware de autorización
- Validación de datos
- Manejo de errores
- Tests unitarios e integración
- Contenedores Docker
- Base de datos PostgreSQL
- API RESTful
- Frontend React con routing

