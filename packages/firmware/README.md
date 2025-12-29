# E-Ink Display Firmware

PlatformIO firmware for the XIAO ESP32-S3 Plus that downloads images from a network file store and updates a 7.3" E-Ink Spectra 6 display.

## Hardware Requirements

- **XIAO ePaper Display Board EE04**
- **XIAO ESP32-S3 Plus** (included with EE04 board)
- **7.3" E-Ink Spectra 6 (E6) Full Color Display** (800×480)
- USB-C cable for programming

## Display Specifications

- **Model**: 7.3" E-Ink Spectra 6 (E6)
- **Resolution**: 800 × 480 pixels
- **Colors**: 6 colors (Black, White, Red, Yellow, Blue, Green)
- **Interface**: SPI
- **Aspect Ratio**: 5:3
- **Refresh Mode**: Fast (~30 seconds)

## Features

- WiFi connectivity for image downloads
- NTP time synchronization
- Time-based content switching (metro data vs screensaver)
- **Dual manual button controls:**
  - **Key 1**: Force metro data update
  - **Key 2**: Display screensaver
- API integration to trigger image generation
- Deep sleep mode with variable duration for low power consumption
- Automatic wake-up and refresh on timer (or button press)
- HTTP/HTTPS image download support
- Error handling and retry logic

## Installation

### Prerequisites

1. **PlatformIO**: Install PlatformIO Core or the VS Code extension
   - [PlatformIO Installation Guide](https://platformio.org/install)

2. **USB Driver**: Install the CH340 or CP2102 USB driver if needed
   - [Driver Download](https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers)

### Setup

1. Connect the XIAO ESP32-S3 to your computer via USB-C

2. Configure WiFi, server, and time settings in `src/config.h`:

```cpp
#define WIFI_SSID "your-wifi-ssid"
#define WIFI_PASSWORD "your-wifi-password"
#define SERVICE_API_URL "http://192.168.1.100:3001/generate-image"
#define METRO_IMAGE_URL "https://storage.hermes-lab.com/dev/eink/metroTable/display.png"
#define SCREENSAVER_IMAGE_URL "https://storage.hermes-lab.com/dev/eink/screensaver/display.png"

// Timezone (UTC+10 for Melbourne)
#define GMT_OFFSET_SEC 36000
#define DAYLIGHT_OFFSET_SEC 3600
```

3. Adjust other settings as needed:
   - Active time periods (morning/evening hours)
   - Sleep durations (15 min / 3.5 hours)
   - Pin configurations (if using custom wiring)

## Building and Uploading

### Using PlatformIO CLI

```bash
# Navigate to firmware directory
cd packages/firmware

# Build the project
pio run

# Upload to board
pio run --target upload

# Monitor serial output
pio device monitor
```

### Using VS Code

1. Open the `firmware` folder in VS Code
2. Click the PlatformIO icon in the sidebar
3. Click "Build" to compile
4. Click "Upload" to flash the firmware
5. Click "Monitor" to view serial output

### From Monorepo Root

```bash
# Build firmware
npm run firmware:build

# Upload firmware
npm run firmware:upload

# Monitor serial output
npm run firmware:monitor
```

## Configuration

### WiFi Settings

Edit `src/config.h`:

```cpp
#define WIFI_SSID "your-wifi-ssid"
#define WIFI_PASSWORD "your-wifi-password"
```

### Service API and Image URLs

Configure the service API endpoint and image storage URLs:

```cpp
// Service API to trigger image generation
#define SERVICE_API_URL "http://192.168.1.100:3001/generate-image"

// Metro table image URL
#define METRO_IMAGE_URL "https://storage.hermes-lab.com/dev/eink/metroTable/display.png"

// Screensaver image URL
#define SCREENSAVER_IMAGE_URL "https://storage.hermes-lab.com/dev/eink/screensaver/display.png"
```

### Active Time Periods

Configure when to show metro data vs screensaver:

```cpp
// Morning period: 5:00 AM - 8:00 AM
#define MORNING_START_HOUR 5
#define MORNING_END_HOUR 8

// Evening period: 3:00 PM - 7:00 PM
#define EVENING_START_HOUR 15
#define EVENING_END_HOUR 19
```

### Sleep Durations

Adjust sleep durations for active and inactive periods:

```cpp
#define ACTIVE_PERIOD_SLEEP_SECONDS 900      // 15 minutes
#define INACTIVE_PERIOD_SLEEP_SECONDS 12600  // 3.5 hours
```

### Timezone Configuration

Set your local timezone:

```cpp
#define NTP_SERVER "pool.ntp.org"
#define GMT_OFFSET_SEC 36000      // UTC+10 for Melbourne
#define DAYLIGHT_OFFSET_SEC 3600  // DST offset
```

Common timezones:
- UTC+10 (Melbourne/Sydney): 36000
- UTC+8 (Perth): 28800
- UTC-5 (Eastern US): -18000
- UTC+0 (London): 0

### Button Wake-up Configuration

Configure buttons for manual control:

```cpp
#define METRO_BUTTON_PIN 1          // Key 1: Force metro data update
#define SCREENSAVER_BUTTON_PIN 2    // Key 2: Display screensaver
#define BUTTON_ACTIVE_LOW true      // true if buttons connect to GND when pressed
```

**Key 1 (Metro Button)** - When pressed during sleep:
- Device wakes immediately
- Fetches fresh metro data (ignoring time-based rules)
- Updates display
- Returns to sleep for 15 minutes

**Key 2 (Screensaver Button)** - When pressed during sleep:
- Device wakes immediately
- Downloads and displays screensaver
- Returns to sleep for 3.5 hours

### Pin Configuration

The default pin configuration for XIAO ePaper Display Board EE04:

```cpp
#define EPD_BUSY_PIN 38
#define EPD_RST_PIN 39
#define EPD_DC_PIN 40
#define EPD_CS_PIN 41
#define EPD_SCK_PIN 42
#define EPD_MOSI_PIN 43
```

## Operation Flow

1. **Wake Up**: Device wakes from deep sleep (timer or button press)
2. **Check Wake Source**: Determines if woken by timer, Key 1, or Key 2
3. **WiFi Connect**: Connects to configured WiFi network
4. **Time Sync**: Synchronizes time with NTP server
5. **Determine Action**:

**If Key 1 (Metro Button) Pressed:**
6. **Trigger Generation**: Calls service API to generate fresh metro image
7. **Download Metro Image**: Downloads latest metro table image
8. **Update Display**: Renders metro image to E-Ink display
9. **Sleep 15 min**: Enters deep sleep for 15 minutes
   - Wake sources: Timer OR Key 1 OR Key 2

**If Key 2 (Screensaver Button) Pressed:**
6. **Download Screensaver**: Downloads screensaver image
7. **Update Display**: Renders screensaver to E-Ink display
8. **Sleep 3.5 hours**: Enters deep sleep for 3.5 hours
   - Wake sources: Timer OR Key 1 OR Key 2

**If Timer Wake (Active Period 5-8am or 3-7pm):**
6. **Trigger Generation**: Calls service API to generate fresh metro image
7. **Download Metro Image**: Downloads latest metro table image
8. **Update Display**: Renders metro image to E-Ink display
9. **Sleep 15 min**: Enters deep sleep for 15 minutes
   - Wake sources: Timer OR Key 1 OR Key 2

**If Timer Wake (Inactive Period):**
6. **Download Screensaver**: Downloads screensaver image
7. **Update Display**: Renders screensaver to E-Ink display
8. **Sleep 3.5 hours**: Enters deep sleep for 3.5 hours
   - Wake sources: Timer OR Key 1 OR Key 2

## Serial Monitor Output

Connect to the serial monitor to see debug information:

```
=================================
E-Ink Display System Starting...
=================================

Connecting to WiFi: MyNetwork
...........
WiFi connected!
IP address: 192.168.1.150
Signal strength (RSSI): -45 dBm

--- Downloading Image ---
Server URL: http://192.168.1.100/display.png
Image size: 45231 bytes
Downloaded 45231 bytes

--- Updating Display ---
Display update complete

--- Entering Deep Sleep ---
Will wake up in 300 seconds
Good night!
```

## E-Ink Display Integration

### Adding Display Library

The current code includes placeholders for E-Ink display integration. To complete the integration:

1. **Find or add the display library** for the 7.3" E-Ink Spectra 6

   Common E-Ink libraries:
   - [GxEPD2](https://github.com/ZinggJM/GxEPD2) - Generic E-Paper library
   - Vendor-specific library from display manufacturer

2. **Add to `platformio.ini`**:
   ```ini
   lib_deps =
       zinggjm/GxEPD2@^1.5.9
   ```

3. **Update `main.cpp`** with display-specific code:
   ```cpp
   #include <GxEPD2_BW.h>
   // Initialize display with your specific model
   ```

### Display Initialization Example

```cpp
// In main.cpp
#include <GxEPD2_3C.h>  // Three-color display library

// Create display instance (adjust for your specific display model)
GxEPD2_3C<GxEPD2_730c_GDEY073D46, GxEPD2_730c_GDEY073D46::HEIGHT> display(
    GxEPD2_730c_GDEY073D46(EPD_CS_PIN, EPD_DC_PIN, EPD_RST_PIN, EPD_BUSY_PIN)
);

void setup() {
    // Initialize display
    display.init(115200);
    display.setRotation(0);
}
```

## Power Consumption

The ESP32-S3 enters deep sleep between updates to conserve power:

- **Active mode** (WiFi + Download): ~80-150mA
- **Deep sleep mode**: ~10-20µA
- **E-Ink display** (refresh): ~20-40mA (brief)

For battery operation:
- A 2000mAh battery can last weeks/months depending on update frequency
- E-Ink displays consume no power when static

## Troubleshooting

### Upload Failed

- Ensure the correct COM port is selected
- Hold the BOOT button while connecting USB
- Try resetting the board

### WiFi Connection Failed

- Verify SSID and password in `config.h`
- Check 2.4GHz WiFi is available (ESP32 doesn't support 5GHz)
- Move closer to WiFi router

### Image Download Failed

- Verify server URL is accessible from your network
- Check firewall settings
- Ensure image file exists at the specified path
- Try accessing URL from browser on same network

### Display Not Updating

- Verify pin connections match `config.h`
- Check display library is properly installed
- Ensure display is compatible with library
- Check serial monitor for error messages

### Build Errors

- Update PlatformIO: `pio upgrade`
- Clean build: `pio run --target clean`
- Delete `.pio` folder and rebuild

## Development Tips

1. **Use Serial Monitor**: Always monitor serial output during development
2. **Reduce Sleep Time**: Set `SLEEP_DURATION_SECONDS` to 30 during testing
3. **Test WiFi First**: Ensure WiFi connects before adding display code
4. **Test Downloads**: Verify image downloads work before display integration
5. **Battery Testing**: Test power consumption with actual battery before deployment

## File Structure

```
firmware/
├── src/
│   ├── main.cpp           # Main application code
│   └── config.h           # Configuration settings
├── platformio.ini         # PlatformIO configuration
└── README.md             # This file
```

## Next Steps

1. Configure WiFi credentials in `config.h`
2. Set up your image server (see image-generator package)
3. Integrate the appropriate E-Ink display library
4. Test image downloads
5. Implement display update logic
6. Deploy and test in final location

## Additional Resources

- [XIAO ESP32-S3 Documentation](https://wiki.seeedstudio.com/xiao_esp32s3_getting_started/)
- [PlatformIO Documentation](https://docs.platformio.org/)
- [ESP32 Deep Sleep Guide](https://randomnerdtutorials.com/esp32-deep-sleep-arduino-ide-wake-up-sources/)
- [E-Ink Display Resources](https://www.waveshare.com/wiki/E-Paper)

## License

MIT
