import dotenv from 'dotenv';

dotenv.config();

export const config = {
  ptv: {
    baseUrl: process.env.PTV_API_BASE_URL || 'https://timetableapi.ptv.vic.gov.au',
    devId: process.env.PTV_DEV_ID || '',
    apiKey: process.env.PTV_API_KEY || '',
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'eink',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },
  service: {
    port: parseInt(process.env.PORT || '3001'),
    dataCollectionCron: process.env.DATA_COLLECTION_CRON || '*/5 * * * *',
    imageGenerationCron: process.env.IMAGE_GENERATION_CRON || '*/10 * * * *',
    imageOutputPath: process.env.IMAGE_OUTPUT_PATH || '/app/images',
  },
  imageGenerator: {
    appUrl: process.env.IMAGE_GENERATOR_APP_URL || 'http://localhost:3000',
    outputPath: process.env.IMAGE_OUTPUT_PATH || './output/display.png',
    fileStoreUrl: process.env.FILE_STORE_URL || '',
    displayWidth: parseInt(process.env.DISPLAY_WIDTH || '800'),
    displayHeight: parseInt(process.env.DISPLAY_HEIGHT || '480'),
    component: process.env.COMPONENT || 'metro',
  },
};
