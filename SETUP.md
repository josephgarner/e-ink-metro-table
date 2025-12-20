# E-Ink Display System - Setup Guide

Complete setup guide for the E-Ink Display System monorepo.

## Quick Start

### Prerequisites

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **PlatformIO** ([Installation Guide](https://platformio.org/install))
- XIAO ESP32-S3 Plus board with E-Ink display
- USB-C cable

### Initial Setup

1. **Clone/Navigate to the repository**:
```bash
cd Eink
```

2. **Install Node.js dependencies**:
```bash
npm install
```

This will install dependencies for all packages in the monorepo.

## Part 1: Image Generator Setup

### Step 1: Navigate to the image generator

```bash
cd packages/image-generator
```

### Step 2: Configure environment

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` with your settings:

```env
DISPLAY_WIDTH=800
DISPLAY_HEIGHT=480

# Local output for testing
FILE_STORE_PATH=./output

# Or network path for production
# FILE_STORE_PATH=//192.168.1.100/shared/eink

OUTPUT_FILENAME=display.png
```

### Step 3: Start the development server

```bash
npm run dev
```

This will:
- Start a local server at `http://localhost:3000`
- Open your browser automatically
- Enable hot-reload for instant updates

### Step 4: Preview your components

You should see:
- The E-Ink Display Generator interface
- A preview of the ExampleDisplay component
- A dropdown to select different display components
- The exact 800×480 display dimensions

### Step 5: Generate an image

With the dev server running, open a new terminal:

```bash
cd packages/image-generator
npm run generate
```

The generated image will be saved to your configured `FILE_STORE_PATH`.

## Part 2: Firmware Setup

### Step 1: Navigate to firmware directory

```bash
cd packages/firmware
```

### Step 2: Configure WiFi and server

Edit `src/config.h`:

```cpp
// WiFi Configuration
#define WIFI_SSID "YourWiFiName"
#define WIFI_PASSWORD "YourWiFiPassword"

// Server Configuration
#define IMAGE_SERVER_URL "http://192.168.1.100/display.png"

// Update interval (in seconds)
#define SLEEP_DURATION_SECONDS 300  // 5 minutes
```

### Step 3: Connect hardware

1. Connect XIAO ESP32-S3 to your computer via USB-C
2. Ensure the E-Ink display is properly connected to the ePaper board

### Step 4: Build and upload firmware

**Using PlatformIO CLI:**

```bash
# Build
pio run

# Upload to board
pio run --target upload

# Monitor serial output
pio device monitor
```

**Using VS Code:**

1. Open the `firmware` folder in VS Code
2. Install the PlatformIO IDE extension
3. Click the checkmark icon (Build)
4. Click the arrow icon (Upload)
5. Click the plug icon (Monitor)

**From monorepo root:**

```bash
npm run firmware:build    # Build
npm run firmware:upload   # Upload
npm run firmware:monitor  # Monitor
```

### Step 5: Verify operation

In the serial monitor, you should see:

```
=================================
E-Ink Display System Starting...
=================================

Connecting to WiFi: YourWiFiName
...
WiFi connected!
IP address: 192.168.1.150

--- Downloading Image ---
Server URL: http://192.168.1.100/display.png
Downloaded 45231 bytes

--- Updating Display ---
Display update complete

--- Entering Deep Sleep ---
Will wake up in 300 seconds
```

## Network Configuration

### Setting Up Image Server

You need to make your generated images accessible to the ESP32. Here are common approaches:

#### Option 1: Local HTTP Server (Simple Testing)

```bash
cd packages/image-generator/output
python -m http.server 8080
```

Then in `config.h`:
```cpp
#define IMAGE_SERVER_URL "http://192.168.1.XXX:8080/display.png"
```

#### Option 2: Network Share (Windows)

1. Share a folder on your network
2. Place images in the shared folder
3. Access via HTTP or configure a simple web server

#### Option 3: Dedicated Server

Set up a web server (nginx, Apache, or Node.js) to serve the images.

## Development Workflow

### Creating New Display Components

1. **Create component file**:
```bash
cd packages/image-generator/src/components
```

Create `MyDisplay.tsx`:
```typescript
import './MyDisplay.css'

function MyDisplay() {
  return (
    <div className="my-display">
      <h1>Hello E-Ink!</h1>
    </div>
  )
}

export default MyDisplay
```

2. **Add styles** in `MyDisplay.css`

3. **Register in App.tsx**:
```typescript
import MyDisplay from './components/MyDisplay'

const components = {
  example: <ExampleDisplay />,
  myDisplay: <MyDisplay />,
}
```

4. **Preview in browser** (dev server auto-reloads)

5. **Generate image**:
```bash
npm run generate
```

### Testing the Complete System

1. **Start dev server**:
```bash
cd packages/image-generator
npm run dev
```

2. **Generate image**:
```bash
npm run generate
```

3. **Upload to server/share**: Copy the generated image to your network location

4. **Reset ESP32**: The device will wake up, download, and display the image

## Common Tasks

### Update display content frequently

During development, reduce sleep time:

```cpp
// In config.h
#define SLEEP_DURATION_SECONDS 30  // 30 seconds for testing
```

### Check image dimensions

Generated images should be exactly 800×480 pixels. Verify with:
```bash
file output/display.png
# Should show: PNG image data, 800 x 480
```

### Monitor ESP32 continuously

```bash
pio device monitor
```

Press `Ctrl+C` to exit.

### Force ESP32 reset

Press the reset button on the XIAO board, or:
```bash
pio device monitor --echo --filter send_on_enter
# Type: reset
```

## Troubleshooting

### Image Generator Issues

**Dev server won't start:**
- Check Node.js version: `node --version` (should be v18+)
- Delete `node_modules` and run `npm install` again
- Check port 3000 isn't already in use

**Image generation fails:**
- Ensure dev server is running
- Check `FILE_STORE_PATH` exists and is writable
- Install Puppeteer dependencies if needed

### Firmware Issues

**Upload fails:**
- Hold BOOT button while connecting USB
- Try different USB cable/port
- Check drivers are installed

**WiFi won't connect:**
- Verify SSID/password
- Ensure 2.4GHz WiFi (ESP32 doesn't support 5GHz)
- Check WiFi signal strength

**Image download fails:**
- Verify URL is accessible from network
- Test URL in browser from different device
- Check firewall settings

**Display not updating:**
- Verify pin connections
- Check display library integration
- Review serial monitor for errors

## Next Steps

1. ✅ Set up both packages
2. ✅ Verify image generation works
3. ✅ Test firmware WiFi connection
4. 🔲 Integrate E-Ink display library (see firmware/README.md)
5. 🔲 Create custom display components
6. 🔲 Deploy to production location
7. 🔲 Optimize power consumption
8. 🔲 Set up automated image generation

## Additional Resources

- [Main README](./README.md)
- [Image Generator Documentation](./packages/image-generator/README.md)
- [Firmware Documentation](./packages/firmware/README.md)
- [PlatformIO Docs](https://docs.platformio.org/)
- [ESP32 Deep Sleep](https://randomnerdtutorials.com/esp32-deep-sleep-arduino-ide-wake-up-sources/)

## Support

For issues:
1. Check the README files in each package
2. Review serial monitor output
3. Verify network connectivity
4. Check hardware connections

Happy coding!
