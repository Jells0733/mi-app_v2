// backend/index.js
const app = require('./app');
const PORT = process.env.PORT || 4000;

if (!process.env.JWT_SECRET) {
  console.error('Falta JWT_SECRET en las variables de entorno');
  process.exit(1);
}

console.log(`Servidor en modo ${process.env.NODE_ENV || 'development'}`);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
