import express from 'express';
import { config } from './config';
import { PtvApiService } from './services/ptv-api';
import { DatabaseService } from './services/database';
import { ImageGeneratorService } from './services/image-generator';
import { Scheduler } from './scheduler';

const app = express();
app.use(express.json());

const ptvApi = new PtvApiService();
const database = new DatabaseService();
const imageGenerator = new ImageGeneratorService();
const scheduler = new Scheduler(ptvApi, database, imageGenerator);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/collect-data', async (req, res) => {
  try {
    await scheduler.collectPtvData();
    res.json({ success: true, message: 'Data collection completed' });
  } catch (error) {
    console.error('Error in manual data collection:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.post('/generate-image', async (req, res) => {
  try {
    await scheduler.generateImage();
    res.json({ success: true, message: 'Image generation triggered' });
  } catch (error) {
    console.error('Error in manual image generation:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

async function start() {
  try {
    console.log('Initializing database...');
    await database.initialize();

    console.log('Starting cron jobs...');
    scheduler.startDataCollectionCron();
    scheduler.startImageGenerationCron();

    app.listen(config.service.port, () => {
      console.log(`Service running on port ${config.service.port}`);
      console.log(`Health check: http://localhost:${config.service.port}/health`);
    });
  } catch (error) {
    console.error('Failed to start service:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await database.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await database.close();
  process.exit(0);
});

start();
