# Prueba Técnica Full Stack - Node.js & React

Aplicación web full stack para gestión de empleados y solicitudes con autenticación por roles.

## Nota Importante sobre Credenciales

**Por motivos de esta prueba técnica, se han incluido archivos con credenciales expuestas (como .env) para facilitar la evaluación del proyecto. En un entorno de producción, esto NO sería una buena práctica de seguridad.**

## Tecnologías

- **Backend**: Node.js + Express + PostgreSQL
- **Frontend**: React + Context API
- **Autenticación**: JWT
- **Testing**: Jest (94% cobertura)
- **Docker**: Containerización completa

## Inicio Rápido

```bash
# Clonar y ejecutar
git clone <repo-url>
cd mi-app
docker compose up -d

# Acceder a la aplicación
# Frontend: http://localhost:3000
# Backend: http://localhost:4000
# pgAdmin: http://localhost:5050
```

## Características

- Autenticación JWT con roles (admin/empleado)
- CRUD completo de empleados
- CRUD completo de solicitudes
- Frontend React responsive
- API REST documentada
- 111 tests (100% éxito)
- Dockerizado completo

## Usuarios de Prueba

- **Admin**: Acceso completo
- **Empleado**: Acceso limitado

## Ejecutar Pruebas

```bash
docker compose run --rm test-runner
```

## Estructura

```
mi-app/
├── backend/          # API Node.js + Express
├── frontend/         # React App
├── docker-compose.yml
└── README.md
```

## Estado del Proyecto

- Backend completo con autenticación
- API REST funcional
- Base de datos PostgreSQL
- Pruebas unitarias e integración
- Frontend React básico
- Dockerización completa

---

