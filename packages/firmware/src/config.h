#ifndef CONFIG_H
#define CONFIG_H

// ========================================
// WiFi Configuration
// ========================================
#define WIFI_SSID "OrbiWifiMesh"
#define WIFI_PASSWORD "97e977fb"

// ========================================
// Server Configuration
// ========================================
// Service API endpoint to trigger image generation
#define SERVICE_API_URL "http://192.168.1.34:3001/generate-image"

// Image URLs (must be BMP format for 7-color E-Ink display)
#define METRO_IMAGE_URL "https://storage.hermes-lab.com/dev/eink/metroTable/display.bmp"
#define SCREENSAVER_IMAGE_URL "https://storage.hermes-lab.com/dev/eink/screensaver/display.bmp"

// ========================================
// Display Configuration
// ========================================
// 7.3" E-Ink Spectra 6 Display Specifications
#define DISPLAY_WIDTH 800
#define DISPLAY_HEIGHT 480

// Display colors (E-Ink Spectra 6 supports 6 colors)
#define COLOR_BLACK 0x0
#define COLOR_WHITE 0x1
#define COLOR_RED 0x2
#define COLOR_YELLOW 0x3
#define COLOR_BLUE 0x4
#define COLOR_GREEN 0x5

// ========================================
// Power Management
// ========================================
// Deep sleep durations in seconds
#define ACTIVE_PERIOD_SLEEP_SECONDS 900      // 15 minutes during active periods
#define INACTIVE_PERIOD_SLEEP_SECONDS 12600  // 3.5 hours during inactive periods

// ========================================
// Time Configuration
// ========================================
// NTP Server for time synchronization
#define NTP_SERVER "pool.ntp.org"
#define GMT_OFFSET_SEC 36000      // UTC+10 (adjust for your timezone)
#define DAYLIGHT_OFFSET_SEC 3600  // DST offset (adjust as needed)

// Active time periods (24-hour format)
// Morning period: 5:00 AM - 8:00 AM
#define MORNING_START_HOUR 5
#define MORNING_END_HOUR 8

// Evening period: 3:00 PM - 7:00 PM
#define EVENING_START_HOUR 15
#define EVENING_END_HOUR 19

// ========================================
// SPI Configuration (XIAO ePaper Display Board EE04)
// ========================================
// Pin configuration for XIAO ePaper Display Board EE04 with XIAO ESP32-S3 Plus
// These are the default pins for the EE04 board - do not change unless using custom wiring
#define EPD_BUSY_PIN 39  // Busy signal from display (D6)
#define EPD_RST_PIN 40   // Reset pin (D7)
#define EPD_DC_PIN 38    // Data/Command selection (D5)
#define EPD_CS_PIN 41    // Chip select (D8)
// SPI pins are hardware-defined on ESP32-S3:
// EPD_SCK_PIN  -> GPIO7 (SPI SCK)
// EPD_MOSI_PIN -> GPIO9 (SPI MOSI)

// ========================================
// Button Configuration
// ========================================
// Buttons for manual wake and control
// XIAO ePaper Display Board EE04 button mapping (from Seeed Wiki)
#define METRO_BUTTON_PIN 2        // KEY1 = GPIO2 (D1/A1): Force metro data update
#define SCREENSAVER_BUTTON_PIN 3  // KEY2 = GPIO3 (D2/A2): Display screensaver
#define BUTTON_ACTIVE_LOW true    // Buttons are active-low (LOW when pressed)

// ========================================
// Debug Configuration
// ========================================
// Enable verbose debug output
#define DEBUG_MODE true

// ========================================
// HTTP Configuration
// ========================================
#define HTTP_TIMEOUT 10000              // HTTP timeout in milliseconds
#define MAX_IMAGE_SIZE (800 * 480 * 3)  // Maximum expected image size in bytes

#endif  // CONFIG_H
