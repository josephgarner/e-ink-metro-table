#ifndef CONFIG_H
#define CONFIG_H

// ========================================
// WiFi Configuration
// ========================================
#define WIFI_SSID "your-wifi-ssid"
#define WIFI_PASSWORD "your-wifi-password"

// ========================================
// Server Configuration
// ========================================
// URL to download the image from
// Examples:
// - Local network: "http://192.168.1.100:8080/display.png"
// - Network share: "http://192.168.1.100/shared/eink/display.png"
#define IMAGE_SERVER_URL "http://192.168.1.100/display.png"

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
// Deep sleep duration in seconds
// Adjust based on how often you want the display to update
// Examples:
// - 300 = 5 minutes
// - 900 = 15 minutes
// - 1800 = 30 minutes
// - 3600 = 1 hour
#define SLEEP_DURATION_SECONDS 300

// ========================================
// SPI Configuration (XIAO ESP32-S3)
// ========================================
// These pins are for the XIAO ePaper Display Board EE04
// Adjust if using custom wiring
#define EPD_BUSY_PIN 38  // Busy signal from display
#define EPD_RST_PIN 39   // Reset pin
#define EPD_DC_PIN 40    // Data/Command selection
#define EPD_CS_PIN 41    // Chip select
#define EPD_SCK_PIN 42   // SPI Clock
#define EPD_MOSI_PIN 43  // SPI MOSI

// ========================================
// Debug Configuration
// ========================================
// Enable verbose debug output
#define DEBUG_MODE true

// ========================================
// HTTP Configuration
// ========================================
#define HTTP_TIMEOUT 10000  // HTTP timeout in milliseconds
#define MAX_IMAGE_SIZE (800 * 480 * 3)  // Maximum expected image size in bytes

#endif // CONFIG_H
