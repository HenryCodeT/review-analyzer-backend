// Main Entry Point

import 'dotenv/config';
import { DependencyContainer } from './infrastructure/container';
import { createApp } from './app';
import { disconnectPrisma } from './infrastructure/database/prisma';

const PORT = process.env.PORT || 3000;

function startServer() {
  try {
    console.log('🚀 Iniciando servidor...');

    const container = new DependencyContainer();
    const app = createApp(container);

    const server = app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log(`API Docs: http://localhost:${PORT}/api/docs`);
    });

    const gracefulShutdown = () => {
      console.log('\n🛑 Cerrando servidor...');

      server.close(() => {
        disconnectPrisma()
          .then(() => {
            console.log('✅ Conexiones cerradas');
            process.exit(0);
          })
          .catch(() => {
            process.exit(1);
          });
      });

      setTimeout(() => {
        console.error('❌ Forzando cierre del servidor');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();
