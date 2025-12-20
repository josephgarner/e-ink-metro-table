# Quick Reference Guide

## Common Commands

### Image Generator

```bash
# Navigate to image generator
cd packages/image-generator

# Install dependencies
npm install

# Start development server
npm run dev

# Generate image from current view
npm run generate

# Build for production
npm run build

# Type checking
npm run type-check
```

### Firmware

```bash
# Navigate to firmware
cd packages/firmware

# Build firmware
pio run

# Upload to board
pio run --target upload

# Monitor serial output
pio device monitor

# Clean build
pio run --target clean
```

### From Monorepo Root

```bash
# Install all dependencies
npm install

# Run image generator dev server
npm run dev

# Generate image
npm run generate

# Build image generator
npm run build

# Firmware commands
npm run firmware:build
npm run firmware:upload
npm run firmware:monitor
```

## File Locations

### Configuration Files

| File | Purpose |
|------|---------|
| `packages/image-generator/.env` | Image generator settings |
| `packages/firmware/src/config.h` | Firmware WiFi and server settings |
| `platformio.ini` | PlatformIO board configuration |
| `package.json` (root) | Monorepo scripts |

### Important Directories

| Directory | Purpose |
|-----------|---------|
| `packages/image-generator/src/components/` | Display components |
| `packages/image-generator/output/` | Generated images |
| `packages/firmware/src/` | Firmware source code |

## Display Specifications

- **Resolution**: 800 × 480 pixels
- **Aspect Ratio**: 5:3
- **Colors**: 6 (Black, White, Red, Yellow, Blue, Green)

## E-Ink Color Palette

```css
Black:  #000000
White:  #FFFFFF
Red:    #FF0000
Yellow: #FFFF00
Blue:   #0000FF
Green:  #00FF00
```

## Typical Workflow

### 1. Design Display Component

```typescript
// packages/image-generator/src/components/MyDisplay.tsx
function MyDisplay() {
  return (
    <div style={{ width: '100%', height: '100%', background: 'white' }}>
      <h1>Hello E-Ink!</h1>
    </div>
  )
}
```

### 2. Preview in Browser

```bash
npm run dev
```

### 3. Generate Image

```bash
npm run generate
```

### 4. Deploy to Network/Server

Copy `output/display.png` to your configured network location.

### 5. ESP32 Auto-Updates

The ESP32 will wake up, download, and display the image automatically.

## Environment Variables

### Image Generator (.env)

```env
DISPLAY_WIDTH=800
DISPLAY_HEIGHT=480
FILE_STORE_PATH=./output
OUTPUT_FILENAME=display.png
APP_URL=http://localhost:3000
```

### Firmware (config.h)

```cpp
#define WIFI_SSID "your-wifi-ssid"
#define WIFI_PASSWORD "your-wifi-password"
#define IMAGE_SERVER_URL "http://192.168.1.100/display.png"
#define SLEEP_DURATION_SECONDS 300
```

## Troubleshooting Quick Fixes

### Dev server won't start
```bash
rm -rf node_modules package-lock.json
npm install
```

### Firmware upload fails
- Hold BOOT button while connecting USB
- Try: `pio run --target upload --upload-port COM3` (adjust port)

### WiFi won't connect
- Check SSID/password in config.h
- Ensure 2.4GHz WiFi (not 5GHz)

### Image generation fails
- Ensure dev server is running first
- Check FILE_STORE_PATH exists
- Install Puppeteer: `npm install puppeteer`

## Serial Monitor Shortcuts

```bash
# Start monitor
pio device monitor

# Exit monitor
Ctrl+C

# Find COM port (Windows)
pio device list

# Custom baud rate
pio device monitor -b 115200
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Add changes
git add .

# Commit
git commit -m "feat: add weather display component"

# Push
git push origin feature/my-feature
```

## Power Consumption Reference

| Mode | Current | Duration |
|------|---------|----------|
| Deep Sleep | ~10-20µA | Most of the time |
| WiFi Active | ~80-150mA | ~10-30 seconds |
| Display Refresh | ~20-40mA | ~5-10 seconds |

**Battery Life Example** (2000mAh battery, 5-minute updates):
- ~2-4 weeks depending on usage pattern

## Useful Links

- [Main README](README.md)
- [Setup Guide](SETUP.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Image Generator Docs](packages/image-generator/README.md)
- [Firmware Docs](packages/firmware/README.md)

## Component Template

```typescript
import './MyComponent.css'

interface MyComponentProps {
  title?: string
}

function MyComponent({ title = 'Default Title' }: MyComponentProps) {
  return (
    <div className="my-component">
      <header>
        <h1>{title}</h1>
      </header>
      <main>
        {/* Content here */}
      </main>
    </div>
  )
}

export default MyComponent
```

## CSS Template

```css
.my-component {
  width: 100%;
  height: 100%;
  background: white;
  color: black;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.my-component header {
  border-bottom: 3px solid black;
  padding-bottom: 15px;
}

.my-component h1 {
  margin: 0;
  font-size: 48px;
}
```

## Need Help?

1. Check the [SETUP.md](SETUP.md) for detailed setup instructions
2. Review package-specific READMEs
3. Check serial monitor output for errors
4. Verify network connectivity
5. Test with simple examples first
