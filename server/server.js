import mongoose from 'mongoose';
import { config } from './config/index.js';
import app from './src/app.js';
import dayjs from 'dayjs';
import { getLogger } from './src/utils/errorLogger.js';
import './db/connect.js';

const serverLogger = getLogger('logs/server.log');

process.on('uncaughtException', (err) => {
  serverLogger.error(`UNCAUGHT EXCEPTION! Shutting down...`);
  serverLogger.error(`${err.name}: ${err.message}`);
  serverLogger.error(err.stack || err);
  process.exit(1);
});

const PORT = config.PORT;
const server = app.listen(PORT, () => {
  const now = dayjs().format('DD-MM-YYYY HH:mm:ss A');
  const startMsg = `✅ Server started at ${now} | Mode: ${config.NODE_ENV} | URL: ${config.APP_URL} | Port: ${PORT}`;
  serverLogger.info(startMsg);
  console.log(`${now} Running in ${config.NODE_ENV} mode at ${config.APP_URL} on PORT ${config.PORT}`)
});

process.on('unhandledRejection', (err) => {
  serverLogger.error(`UNHANDLED REJECTION: ${err.name} - ${err.message}`);
  serverLogger.error(err.stack || err);

  server.close(() => {
    const shutdownMsg = `Server closed due to unhandled promise rejection at ${dayjs().format('DD-MM-YYYY HH:mm:ss A')}`;
    serverLogger.warn(shutdownMsg);
    process.exit(1);
  });
});

async function gracefulShutdown(signal, reason = '') {
  const msg = `${signal} received at ${dayjs().format('DD-MM-YYYY HH:mm:ss A')}. Shutting down gracefully... ${reason}`;
  serverLogger.warn(msg);

  try {
    await mongoose.connection.close();
    serverLogger.info('MongoDB connection closed.');

    server.close(() => {
      const endMsg = `HTTP server closed successfully at ${dayjs().format('DD-MM-YYYY HH:mm:ss A')}`;
      serverLogger.info(endMsg);
      serverLogger.info('Process terminated cleanly.');
      process.exit(0);
    });
  } catch (err) {
    serverLogger.error(`Error during shutdown: ${err.message}`);
    process.exit(1);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT', 'Manual stop (Ctrl+C)'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM', 'System or hosting service shutdown'));