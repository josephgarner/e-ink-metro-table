# E-Ink Service

API service for collecting PTV transport data and triggering image generation for E-Ink displays.

## Features

- Collects departure data from PTV API endpoints via scheduled cron jobs
- Stores departure and route information in PostgreSQL database
- Generates E-Ink display images using Puppeteer
- Screenshots the React app (image-generator package) to create images
- RESTful API endpoints for manual triggering
- Health check endpoint

## Prerequisites

- Node.js 22+
- PostgreSQL database
- PTV API credentials (Dev ID and API Key)

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:

- `PTV_DEV_ID` - Your PTV API developer ID
- `PTV_API_KEY` - Your PTV API key
- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `IMAGE_GENERATOR_APP_URL` - URL where the React app is running (default: http://localhost:3000)
- `IMAGE_OUTPUT_PATH` - Local path where generated images will be saved (default: ./output/display.png)
- `FILE_STORE_URL` - File store location to upload images to (optional). Supports:
  - Network paths: `//192.168.1.100/shared/eink`
  - Local paths: `C:/shared/eink`
  - HTTP endpoints: `https://storage.example.com/upload`
- `DISPLAY_WIDTH` - Display width in pixels (default: 800)
- `DISPLAY_HEIGHT` - Display height in pixels (default: 480)
- `COMPONENT` - Component to render (default: metro)

## Usage

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

### Docker

```bash
docker build -t eink-service .
docker run -p 3001:3001 --env-file .env eink-service
```

## API Endpoints

### Health Check
```
GET /health
```

### Manual Data Collection
```
POST /collect-data
```

Manually trigger PTV data collection.

### Manual Image Generation
```
POST /generate-image
```

Manually trigger image generation.

## Cron Jobs

The service runs two scheduled cron jobs with independent schedules:

1. **Data Collection** - Fetches departure data from PTV API and stores in database
   - Default: Every 5 minutes (`*/5 * * * *`)
   - Configure via `DATA_COLLECTION_CRON` environment variable

2. **Image Generation** - Triggers the image generator service
   - Default: Every 10 minutes (`*/10 * * * *`)
   - Configure via `IMAGE_GENERATION_CRON` environment variable

Both use standard cron format (minute hour day month weekday).

## Database Schema

### departures table

- `id` - Serial primary key
- `stop_id` - PTV stop identifier
- `route_id` - PTV route identifier
- `direction_id` - Direction identifier
- `scheduled_departure_utc` - Scheduled departure time
- `estimated_departure_utc` - Estimated departure time
- `platform_number` - Platform number
- `departure_sequence` - Sequence in departure list
- `fetched_at` - Timestamp when data was fetched
- `created_at` - Record creation timestamp

### routes table

- `id` - Serial primary key
- `route_id` - PTV route identifier
- `route_name` - Route name
- `route_number` - Route number
- `route_type` - Route type (0=train, 1=tram, etc.)
- `service_status_description` - Service status description
- `service_status_timestamp` - Service status timestamp
- `fetched_at` - Timestamp when data was fetched
- `created_at` - Record creation timestamp
