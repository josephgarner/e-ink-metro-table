# E-Ink Display System Monorepo

A monorepo project for generating and displaying full-color images on a 7.3" E-Ink Spectra 6 display.

## Project Structure

```
Eink/
├── packages/
│   ├── image-generator/     # Node.js/TypeScript React-to-Image application
│   └── firmware/            # PlatformIO firmware for XIAO ESP32-S3
├── README.md
└── package.json
```

## Components

### 1. Image Generator (Node.js/TypeScript)

A React-based application that generates 5:3 aspect ratio images and saves them to a local network file store.

**Features:**
- TypeScript for type safety
- React components for UI design
- Live preview server for development
- React-to-image conversion
- Network file storage integration

**Technology Stack:**
- Node.js
- TypeScript
- React
- Vite (for development server)
- html-to-image or puppeteer (for image generation)

### 2. Firmware (PlatformIO/C++)

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

- Node.js (v18 or higher)
- npm or yarn
- PlatformIO Core or PlatformIO IDE (VS Code extension)
- XIAO ESP32-S3 Plus board
- 7.3" E-Ink Spectra 6 display

### Installation

1. Clone the repository:
```bash
cd Eink
```

2. Install image generator dependencies:
```bash
cd packages/image-generator
npm install
```

3. Set up the firmware project:
```bash
cd packages/firmware
pio lib install
```

### Development

#### Image Generator

Run the development server to preview components:
```bash
cd packages/image-generator
npm run dev
```

Generate images:
```bash
npm run generate
```

#### Firmware

Build and upload to the XIAO ESP32-S3:
```bash
cd packages/firmware
pio run --target upload
```

Monitor serial output:
```bash
pio device monitor
```

## Configuration

### Image Generator

Configure the network file store path and display dimensions in `packages/image-generator/.env`:
```
DISPLAY_WIDTH=800
DISPLAY_HEIGHT=480
FILE_STORE_PATH=//network-path/images
```

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
- [Image Generator Documentation](./packages/image-generator/README.md)
- [Firmware Documentation](./packages/firmware/README.md)
