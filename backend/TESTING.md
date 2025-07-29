# 🧪 Guía de Pruebas Unitarias

Esta guía describe cómo ejecutar y mantener las pruebas unitarias del proyecto.

## 📋 Resumen de Cobertura

- **Cobertura Total**: 82.04%
- **Pruebas Unitarias**: 48 tests
- **Pruebas de Integración**: 9 tests
- **Total de Tests**: 57 tests

### Cobertura por Módulo

| Módulo | Statements | Branches | Functions | Lines |
|--------|------------|----------|-----------|-------|
| **Controllers** | 78.83% | 84.33% | 100% | 78.19% |
| **Middlewares** | 100% | 100% | 100% | 100% |
| **Models** | 96% | 61.53% | 92.3% | 95.83% |
| **Routes** | 65.78% | 0% | 0% | 65.78% |

## 🚀 Comandos de Pruebas

### Usando Make (Recomendado)

```bash
# Ejecutar todas las pruebas
make test

# Solo pruebas unitarias
make test-unit

# Solo pruebas de integración
make test-integration

# Pruebas con cobertura
make test-coverage

# Pruebas en modo watch (desarrollo)
make test-watch

# Pruebas con debug
make test-debug

# Pruebas con verbose
make test-verbose

# Limpiar contenedores
make clean

# Mostrar ayuda
make help
```

### Usando Docker directamente

```bash
# Ejecutar todas las pruebas
docker-compose run --rm test-runner npm test

# Solo pruebas unitarias
docker-compose run --rm test-runner npm run test:unit

# Solo pruebas de integración
docker-compose run --rm test-runner npm run test:integration

# Pruebas con cobertura
docker-compose run --rm test-runner npm run test:coverage

# Pruebas en modo watch
docker-compose run --rm test-runner npm run test:watch
```

### Usando npm directamente (requiere base de datos local)

```bash
# Instalar dependencias
npm install

# Ejecutar todas las pruebas
npm test

# Solo pruebas unitarias
npm run test:unit

# Solo pruebas de integración
npm run test:integration

# Pruebas con cobertura
npm run test:coverage
```

## 📁 Estructura de Pruebas

```
tests/
├── setup.js                 # Configuración global de pruebas
├── unit/                    # Pruebas unitarias
│   ├── auth.controller.test.js
│   ├── auth.middleware.test.js
│   ├── empleados.controller.test.js
│   ├── empleadoModel.test.js
│   ├── solicitudes.controller.test.js
│   └── solicitudModel.test.js
├── integration/             # Pruebas de integración
│   ├── auth.routes.test.js
│   ├── empleados.routes.test.js
│   └── solicitudes.routes.test.js
└── utils/                   # Utilidades para pruebas
    └── testHelpers.js
```

## 🔧 Configuración

### Variables de Entorno

Las pruebas utilizan las siguientes variables de entorno:

```env
NODE_ENV=test
DB_HOST=test-db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=Ntc0394**
DB_NAME=miapp_test
JWT_SECRET=test_secret_key_for_testing_only
```

### Base de Datos de Pruebas

- **Puerto**: 5434 (para evitar conflictos)
- **Base de datos**: miapp_test
- **Usuario**: postgres
- **Contraseña**: Ntc0394**

## 📝 Tipos de Pruebas

### Pruebas Unitarias

Prueban funciones individuales de forma aislada:

- **Controllers**: Lógica de negocio y manejo de requests/responses
- **Models**: Operaciones de base de datos
- **Middlewares**: Autenticación y autorización

### Pruebas de Integración

Prueban la interacción entre componentes:

- **Routes**: Endpoints completos con autenticación
- **API**: Flujos completos de la aplicación

## 🎯 Convenciones de Naming

### Archivos de Prueba
- `*.test.js` - Archivos de prueba
- `*.spec.js` - Archivos de especificación (alternativo)

### Descripción de Tests
- ✅ Casos exitosos: "debería [acción]"
- ❌ Casos de error: "debería fallar al [acción]"
- ⚠️ Casos edge: "debería manejar [situación]"

### Emojis para Organización
- 🔐 Autenticación
- 👷 Empleados
- 📦 Solicitudes
- 🧪 Modelos
- 📄 Lectura
- 📥 Creación
- 📝 Actualización
- ❌ Eliminación

## 🐛 Debugging

### Modo Debug
```bash
make test-debug
```

### Logs Detallados
```bash
make test-verbose
```

### Modo Watch (Desarrollo)
```bash
make test-watch
```

## 📊 Cobertura de Código

### Generar Reporte HTML
```bash
make test-coverage
```

El reporte se genera en `backend/coverage/index.html`

### Líneas No Cubiertas

#### Controllers
- `auth.controller.js`: Líneas 12, 40-44, 52, 71, 76, 95-96
- `empleados.controller.js`: Líneas 33-34, 50-51, 68-69
- `solicitudes.controller.js`: Líneas 30-31, 52-56, 68-69, 78, 85-86, 105-106

#### Models
- `empleadoModel.js`: Líneas 21-25
- `solicitudModel.js`: Líneas 22-52

## 🔄 CI/CD

### GitHub Actions (Recomendado)
```yaml
- name: Run Tests
  run: |
    docker-compose run --rm test-runner npm test
```

### Pipeline Local
```bash
# 1. Limpiar
make clean

# 2. Construir
make test-build

# 3. Ejecutar pruebas
make test

# 4. Verificar cobertura
make test-coverage
```

## 🚨 Troubleshooting

### Error: Puerto ya en uso
```bash
# Cambiar puerto en docker-compose.yml
ports:
  - "5435:5432"  # Cambiar 5434 por 5435
```

### Error: JWT_SECRET no definido
```bash
# Verificar variables de entorno
echo $JWT_SECRET
```

### Error: Base de datos no disponible
```bash
# Verificar estado de contenedores
docker-compose ps

# Reiniciar servicios
docker-compose restart test-db
```

## 📈 Métricas de Calidad

- **Tiempo de ejecución**: ~3 segundos
- **Tests por segundo**: ~19 tests/segundo
- **Cobertura objetivo**: >80%
- **Tests fallando**: 0

## 🤝 Contribución

### Agregar Nuevas Pruebas

1. Crear archivo `tests/unit/[modulo].test.js`
2. Seguir convenciones de naming
3. Incluir casos positivos y negativos
4. Agregar emojis descriptivos
5. Ejecutar `make test` para verificar

### Ejemplo de Test
```javascript
describe('🔐 auth.controller', () => {
  it('✅ debería iniciar sesión con credenciales válidas', async () => {
    // Test implementation
  });

  it('❌ debería fallar con credenciales inválidas', async () => {
    // Test implementation
  });
});
```

## 📚 Recursos Adicionales

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Docker Testing Best Practices](https://docs.docker.com/develop/dev-best-practices/) 