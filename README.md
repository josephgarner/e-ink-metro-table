# E-Ink Display System Monorepo

A monorepo project for generating and displaying full-color images on a 7.3" E-Ink Spectra 6 display.

## Project Structure

```
Eink/
├── packages/
│   ├── service/             # API service for PTV data collection
│   ├── image-generator/     # Node.js/TypeScript React-to-Image application
│   └── firmware/            # PlatformIO firmware for XIAO ESP32-S3
├── docker-compose.yml       # Docker orchestration
├── README.md
└── package.json
```

## Components

### 1. Service (Node.js/TypeScript)

API service that collects public transport data from PTV API and triggers image generation.

**Features:**
- Scheduled cron jobs for data collection
- PostgreSQL database storage
- RESTful API endpoints
- Route service status tracking
- Triggers image generation

**Technology Stack:**
- Node.js 22
- TypeScript
- Express
- PostgreSQL
- node-cron

[View Service Documentation](./packages/service/README.md)

### 2. Image Generator (React/TypeScript)

A React-based application that displays PTV transit data in 5:3 aspect ratio layouts optimized for E-Ink displays.

**Features:**
- TypeScript for type safety
- React components for UI design
- Live preview server for development
- Displays real-time transit data from database
- Multiple display components (metro, etc.)

**Technology Stack:**
- React
- TypeScript
- Vite (for development server)
- Chakra UI (for styling)

**Note:** This is just the React app. Image generation (screenshotting) is handled by the service package using Puppeteer.

[View Image Generator Documentation](./packages/image-generator/README.md)

### 3. Firmware (PlatformIO/C++)

Firmware for the XIAO ESP32-S3 Plus that downloads images and updates the 7.3" E-Ink Spectra 6 display.

**Features:**
- WiFi connectivity
- Image download from network file store
- E-Ink display driver integration
- Low-power operation modes

**Hardware:**
- XIAO ePaper Display Board EE04
- XIAO ESP32-S3 Plus
- 7.3" E-Ink Spectra 6 (E6) Full Color Display

## Getting Started

### Prerequisites

- Node.js 22+
- npm or yarn
- PostgreSQL (or use Docker)
- PTV API credentials
- PlatformIO Core or PlatformIO IDE (VS Code extension)
- XIAO ESP32-S3 Plus board
- 7.3" E-Ink Spectra 6 display

### Quick Start with Docker

1. Configure environment:
```bash
cp .env.example .env
# Edit .env with your PTV API credentials
```

2. Start all services:
```bash
docker-compose up -d
```

This starts PostgreSQL, the service, and image generator.

### Local Development

#### 1. Service

```bash
cd packages/service
cp .env.example .env
# Edit .env with your credentials
npm install
npm run dev
```

#### 2. Image Generator (React App)

```bash
cd packages/image-generator
cp .env.example .env
# Edit .env with your PTV credentials and DB settings
npm install
npm run dev
```

#### 3. Firmware

Build and upload to the XIAO ESP32-S3:
```bash
cd packages/firmware
pio run --target upload
```

Monitor serial output:
```bash
pio device monitor
```

## API Endpoints

### Service (port 3001)
- `GET /health` - Health check
- `POST /collect-data` - Manually trigger PTV data collection
- `POST /generate-image` - Manually trigger image generation

### Image Generator (port 3000)
- React app - No API endpoints, just displays the UI

## Configuration

### Service

Configure PTV API, database, and file store in `packages/service/.env`:
```env
PTV_DEV_ID=your_dev_id
PTV_API_KEY=your_api_key
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eink
DB_USER=postgres
DB_PASSWORD=your_password

# Optional: Upload images to file store
FILE_STORE_URL=//192.168.1.100/shared/eink
```

### Image Generator

Configure PTV API and database in `packages/image-generator/.env`:
```env
PTV_DEV_ID=your_dev_id
PTV_API_KEY=your_api_key
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eink
DB_USER=postgres
DB_PASSWORD=your_password
```

**Note**: Image generation settings (dimensions, output path, component) are configured in the service package.

### Firmware

Configure WiFi and server details in `packages/firmware/src/config.h`:
```cpp
#define WIFI_SSID "your-ssid"
#define WIFI_PASSWORD "your-password"
#define IMAGE_SERVER_URL "http://your-server/image.bin"
```

## Display Specifications

**7.3" E-Ink Spectra 6 (E6)**
- Resolution: 800 x 480 pixels
- Aspect Ratio: 5:3
- Colors: 6 colors (Black, White, Red, Yellow, Blue, Green)
- Interface: SPI

## Contributing

Please read the documentation in each package for specific contribution guidelines.

## License

MIT

## Support

For issues and questions, please refer to the individual package READMEs:
- [Service Documentation](./packages/service/README.md)
- [Image Generator Documentation](./packages/image-generator/README.md)
- [Firmware Documentation](./packages/firmware/README.md)
