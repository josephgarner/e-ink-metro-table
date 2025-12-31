#include <Arduino.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <WiFi.h>
#include <esp_task_wdt.h>
#include <time.h>

// Seeed GFX Library (automatically includes EPaper extension)
#include "TFT_eSPI.h"

// Board and display configuration
#include "config.h"

// 7.3" E-Ink Spectra 6 (6-color) Display for EE04 Board
// Using Seeed GFX library with BOARD_SCREEN_COMBO 509
#ifdef EPAPER_ENABLE
EPaper epaper;
#endif

// Function prototypes
void setupWiFi();
void syncTime();
bool isActivePeriod();
void triggerImageGeneration();
void downloadImage(const char* imageUrl);
void updateDisplay();
void enterDeepSleep(uint32_t durationSeconds);
void initDisplay();
void setupButtonWakeup();
int getWakeButtonPressed();
void displayTestPattern();

// Image buffer - stores downloaded image data
uint8_t* imageBuffer = nullptr;
size_t imageBufferSize = 0;

// Wake-up tracking
esp_sleep_wakeup_cause_t wakeup_reason;

void setup() {
    Serial.begin(115200);
    delay(1000);

    Serial.println("\n=================================");
    Serial.println("E-Ink Display System Starting...");
    Serial.println("=================================\n");

    // Check wake-up reason
    wakeup_reason = esp_sleep_get_wakeup_cause();
    int buttonPressed = getWakeButtonPressed();

    if (buttonPressed == METRO_BUTTON_PIN) {
        Serial.println("*** Woken by METRO BUTTON (Key 1) - Forcing metro update! ***");
    } else if (buttonPressed == SCREENSAVER_BUTTON_PIN) {
        Serial.println("*** Woken by SCREENSAVER BUTTON (Key 2) - Showing screensaver! ***");
    }

    // Initialize WiFi
    setupWiFi();

    // Synchronize time with NTP server
    syncTime();

    // Initialize display
    initDisplay();

    // Determine what to display based on wake source
    bool showMetro = false;
    uint32_t sleepDuration = INACTIVE_PERIOD_SLEEP_SECONDS;

    if (buttonPressed == METRO_BUTTON_PIN) {
        // Metro button pressed - force metro update
        Serial.println("Manual metro update requested");
        showMetro = true;
        sleepDuration = ACTIVE_PERIOD_SLEEP_SECONDS;
    } else if (buttonPressed == SCREENSAVER_BUTTON_PIN) {
        // Screensaver button pressed - show screensaver
        Serial.println("Manual screensaver display requested");
        showMetro = false;
        sleepDuration = INACTIVE_PERIOD_SLEEP_SECONDS;
    } else {
        // Timer wake - check if we're in active period
        if (isActivePeriod()) {
            Serial.println("Active period detected - updating metro display");
            showMetro = true;
            sleepDuration = ACTIVE_PERIOD_SLEEP_SECONDS;
        } else {
            Serial.println("Inactive period - showing screensaver");
            showMetro = false;
            sleepDuration = INACTIVE_PERIOD_SLEEP_SECONDS;
        }
    }

    if (showMetro) {
        // Trigger image generation
        triggerImageGeneration();

        // Download metro image
        downloadImage(METRO_IMAGE_URL);

        // Update display
        updateDisplay();
    } else {
        // Download screensaver image
        downloadImage(SCREENSAVER_IMAGE_URL);

        // Update display
        updateDisplay();
    }

    // Enter deep sleep
    enterDeepSleep(sleepDuration);
}

void loop() {
    // Main loop is not used since we use deep sleep
    // Device will restart after wake-up
}

/**
 * Connect to WiFi network
 */
void setupWiFi() {
    Serial.print("Connecting to WiFi: ");
    Serial.println(WIFI_SSID);

    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 30) {
        delay(500);
        Serial.print(".");
        attempts++;
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\nWiFi connected!");
        Serial.print("IP address: ");
        Serial.println(WiFi.localIP());
        Serial.print("Signal strength (RSSI): ");
        Serial.print(WiFi.RSSI());
        Serial.println(" dBm");
    } else {
        Serial.println("\nWiFi connection failed!");
        Serial.println("Entering deep sleep and will retry after wake-up...");
        enterDeepSleep(ACTIVE_PERIOD_SLEEP_SECONDS);
    }
}

/**
 * Synchronize time with NTP server
 */
void syncTime() {
    Serial.println("\n--- Synchronizing Time ---");
    Serial.print("NTP Server: ");
    Serial.println(NTP_SERVER);

    configTime(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC, NTP_SERVER);

    Serial.print("Waiting for time sync");
    int attempts = 0;
    while (time(nullptr) < 100000 && attempts < 30) {
        Serial.print(".");
        delay(500);
        attempts++;
    }
    Serial.println();

    time_t now = time(nullptr);
    if (now > 100000) {
        struct tm timeinfo;
        localtime_r(&now, &timeinfo);
        Serial.print("Current time: ");
        Serial.println(asctime(&timeinfo));
    } else {
        Serial.println("WARNING: Failed to sync time with NTP server");
        Serial.println("Proceeding with system time...");
    }
}

/**
 * Check if current time is within active periods
 * Active periods: 5:00 AM - 8:00 AM OR 3:00 PM - 7:00 PM
 */
bool isActivePeriod() {
    time_t now = time(nullptr);
    struct tm timeinfo;
    localtime_r(&now, &timeinfo);

    int currentHour = timeinfo.tm_hour;

    Serial.print("Current hour: ");
    Serial.println(currentHour);

    // Check morning period (5:00 AM - 8:00 AM)
    bool morningPeriod = (currentHour >= MORNING_START_HOUR && currentHour < MORNING_END_HOUR);

    // Check evening period (3:00 PM - 7:00 PM)
    bool eveningPeriod = (currentHour >= EVENING_START_HOUR && currentHour < EVENING_END_HOUR);

    return morningPeriod || eveningPeriod;
}

/**
 * Trigger image generation via service API
 */
void triggerImageGeneration() {
    Serial.println("\n--- Triggering Image Generation ---");
    Serial.print("API URL: ");
    Serial.println(SERVICE_API_URL);

    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("ERROR: WiFi not connected!");
        return;
    }

    HTTPClient http;
    http.begin(SERVICE_API_URL);
    http.setTimeout(30000);  // 30 second timeout for image generation

    int httpCode = http.POST("");

    if (httpCode == HTTP_CODE_OK) {
        String response = http.getString();
        Serial.println("Image generation triggered successfully");
        Serial.print("Response: ");
        Serial.println(response);

        // Wait a moment for image generation to complete
        Serial.println("Waiting for image generation to complete...");
        delay(5000);
    } else {
        Serial.print("API call failed, error: ");
        Serial.println(http.errorToString(httpCode).c_str());
        Serial.println("Proceeding with existing image...");
    }

    http.end();
}

/**
 * Download image from server
 */
void downloadImage(const char* imageUrl) {
    Serial.println("\n--- Downloading Image ---");
    Serial.print("Image URL: ");
    Serial.println(imageUrl);

    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("ERROR: WiFi not connected!");
        return;
    }

    HTTPClient http;
    http.begin(imageUrl);
    http.setTimeout(30000);  // 30 second timeout

    int httpCode = http.GET();

    if (httpCode == HTTP_CODE_OK) {
        int contentLength = http.getSize();
        Serial.print("Image size: ");
        Serial.print(contentLength);
        Serial.println(" bytes");

        // Allocate buffer for image data
        if (imageBuffer != nullptr) {
            free(imageBuffer);
        }

        imageBuffer = (uint8_t*)malloc(contentLength);
        if (imageBuffer == nullptr) {
            Serial.println("ERROR: Failed to allocate memory for image!");
            http.end();
            return;
        }

        imageBufferSize = contentLength;

        // Get the image data
        WiFiClient* stream = http.getStreamPtr();

        size_t bytesRead = 0;
        uint8_t buffer[512];

        Serial.print("Downloading: ");
        while (http.connected() && bytesRead < contentLength) {
            size_t available = stream->available();
            if (available) {
                size_t toRead = min(available, sizeof(buffer));
                toRead = min(toRead, contentLength - bytesRead);

                int read = stream->readBytes(buffer, toRead);
                if (read > 0) {
                    memcpy(imageBuffer + bytesRead, buffer, read);
                    bytesRead += read;

                    // Progress indicator
                    if (bytesRead % 10240 == 0) {
                        Serial.print(".");
                    }
                }
            }
            delay(1);
        }

        Serial.println();
        Serial.print("Downloaded ");
        Serial.print(bytesRead);
        Serial.print(" bytes (expected: ");
        Serial.print(contentLength);
        Serial.println(")");

        if (bytesRead == contentLength) {
            Serial.println("SUCCESS: All bytes downloaded");
        } else {
            Serial.println("WARNING: Downloaded bytes don't match expected size");
        }

    } else {
        Serial.print("HTTP GET failed, error code: ");
        Serial.print(httpCode);
        Serial.print(" - ");
        Serial.println(http.errorToString(httpCode).c_str());
    }

    http.end();
}

/**
 * Initialize E-Ink display
 */
void initDisplay() {
    Serial.println("\n--- Initializing Display ---");
    Serial.println("Using Seeed GFX library for XIAO EE04 board");
    Serial.println("Display: 7.3\" six-color ePaper (ED2208)");
    Serial.println("BOARD_SCREEN_COMBO: 509");

    // Initialize the Seeed ePaper display
    // The library reads driver.h and Setup509 automatically
    epaper.begin();

    Serial.println("Display initialized successfully");
    Serial.println("NOTE: 6-color E-Ink display ready");
}

/**
 * Update the E-Ink display with the downloaded image
 */
void updateDisplay() {
    Serial.println("\n--- Updating Display ---");

    if (imageBuffer == nullptr || imageBufferSize == 0) {
        Serial.println("ERROR: No image data to display!");
        return;
    }

    Serial.print("Image buffer size: ");
    Serial.print(imageBufferSize);
    Serial.println(" bytes");

    // Print first 16 bytes for debugging
    Serial.print("First 16 bytes (hex): ");
    for (int i = 0; i < min(16, (int)imageBufferSize); i++) {
        if (imageBuffer[i] < 0x10) Serial.print("0");
        Serial.print(imageBuffer[i], HEX);
        Serial.print(" ");
    }
    Serial.println();

    // Check image format
    bool isPNG = (imageBufferSize > 8 && imageBuffer[0] == 0x89 && imageBuffer[1] == 'P' &&
                  imageBuffer[2] == 'N' && imageBuffer[3] == 'G');
    bool isBMP = (imageBufferSize > 54 && imageBuffer[0] == 'B' && imageBuffer[1] == 'M');

    Serial.print("Format detection - PNG: ");
    Serial.print(isPNG ? "YES" : "NO");
    Serial.print(", BMP: ");
    Serial.println(isBMP ? "YES" : "NO");

    if (isPNG) {
        Serial.println("Detected PNG image format");
        Serial.println("ERROR: PNG format not supported for 6-color display");
        Serial.println("Please configure the server to generate BMP images");
        Serial.println("Update IMAGE_OUTPUT_PATH to use .bmp extension");

        // Display error message
        epaper.fillScreen(TFT_WHITE);
        epaper.setTextSize(2);
        epaper.setTextColor(TFT_BLACK);
        epaper.setCursor(50, 200);
        epaper.print("ERROR: PNG not supported");
        epaper.setCursor(50, 230);
        epaper.print("Server must generate BMP");
        epaper.setCursor(50, 260);
        epaper.print("Check image-generator config");
        epaper.update();

        // Free image buffer
        if (imageBuffer != nullptr) {
            free(imageBuffer);
            imageBuffer = nullptr;
            imageBufferSize = 0;
        }
        return;
    }

    if (!isBMP) {
        Serial.println("ERROR: Unknown image format");
        Serial.println("Expected BMP format for 6-color display");

        // Free image buffer
        if (imageBuffer != nullptr) {
            free(imageBuffer);
            imageBuffer = nullptr;
            imageBufferSize = 0;
        }
        return;
    }

    Serial.println("Detected BMP image format - proceeding with display update");
    Serial.println("NOTE: Display refresh may take 30+ seconds");
    Serial.println("Device will appear unresponsive during refresh - this is normal");

    Serial.println("Starting display refresh...");
    unsigned long startTime = millis();

    // Parse BMP header
    if (imageBufferSize < 54) {
        Serial.println("ERROR: BMP file too small (header incomplete)");
        free(imageBuffer);
        imageBuffer = nullptr;
        imageBufferSize = 0;
        return;
    }

    // Read BMP header info
    uint32_t pixelDataOffset = imageBuffer[10] | (imageBuffer[11] << 8) | (imageBuffer[12] << 16) | (imageBuffer[13] << 24);
    uint32_t width = imageBuffer[18] | (imageBuffer[19] << 8) | (imageBuffer[20] << 16) | (imageBuffer[21] << 24);
    uint32_t height = imageBuffer[22] | (imageBuffer[23] << 8) | (imageBuffer[24] << 16) | (imageBuffer[25] << 24);
    uint16_t bitsPerPixel = imageBuffer[28] | (imageBuffer[29] << 8);

    Serial.print("BMP Info - Width: ");
    Serial.print(width);
    Serial.print(", Height: ");
    Serial.print(height);
    Serial.print(", BPP: ");
    Serial.println(bitsPerPixel);

    // Validate BMP dimensions
    if (width != DISPLAY_WIDTH || height != DISPLAY_HEIGHT) {
        Serial.print("WARNING: BMP dimensions (");
        Serial.print(width);
        Serial.print("x");
        Serial.print(height);
        Serial.print(") don't match display (");
        Serial.print(DISPLAY_WIDTH);
        Serial.print("x");
        Serial.print(DISPLAY_HEIGHT);
        Serial.println(")");
    }

    // Only support 24-bit BMP
    if (bitsPerPixel != 24) {
        Serial.print("ERROR: Only 24-bit BMP supported, got ");
        Serial.print(bitsPerPixel);
        Serial.println(" bits per pixel");
        free(imageBuffer);
        imageBuffer = nullptr;
        imageBufferSize = 0;
        return;
    }

    // Clear the display
    epaper.fillScreen(TFT_WHITE);

    // BMP rows are padded to 4-byte boundaries
    uint32_t rowSize = ((width * 3 + 3) / 4) * 4;

    Serial.println("Decoding BMP and drawing to display buffer...");

    // BMP pixels are stored bottom-to-top, so we read from bottom row first
    // Rotate 90 degrees clockwise: BMP(x,y) -> Display(height-1-y, x)
    for (int32_t y = 0; y < (int32_t)height; y++) {
        uint32_t rowOffset = pixelDataOffset + (height - 1 - y) * rowSize;

        for (int32_t x = 0; x < (int32_t)width; x++) {
            uint32_t pixelOffset = rowOffset + x * 3;

            if (pixelOffset + 2 >= imageBufferSize) {
                continue; // Skip if out of bounds
            }

            // BMP stores as BGR
            uint8_t b = imageBuffer[pixelOffset];
            uint8_t g = imageBuffer[pixelOffset + 1];
            uint8_t r = imageBuffer[pixelOffset + 2];

            // Map RGB to 6 colors (simple nearest-color algorithm)
            uint16_t color = TFT_WHITE; // Default to white

            // Determine dominant color component
            uint8_t maxVal = max(r, max(g, b));
            uint8_t minVal = min(r, min(g, b));

            if (maxVal < 64) {
                color = TFT_BLACK; // Dark colors -> black
            } else if (minVal > 192 && maxVal > 192) {
                color = TFT_WHITE; // Light colors -> white
            } else if (r > g && r > b) {
                if (g > 100) {
                    color = TFT_YELLOW; // Red + green -> yellow
                } else {
                    color = TFT_RED; // Mostly red
                }
            } else if (g > r && g > b) {
                color = TFT_GREEN; // Mostly green
            } else if (b > r && b > g) {
                color = TFT_BLUE; // Mostly blue
            } else if (r > 150 && g > 150) {
                color = TFT_YELLOW; // Yellow region
            }

            // Rotate 90 degrees clockwise when drawing
            int32_t displayX = height - 1 - y;
            int32_t displayY = x;
            epaper.drawPixel(displayX, displayY, color);
        }

        // Print progress every 50 rows
        if (y % 50 == 0) {
            Serial.print("Processing row ");
            Serial.print(y);
            Serial.print(" of ");
            Serial.println(height);
        }
    }

    Serial.println("BMP decoded, calling epaper.update() to refresh display...");
    epaper.update();

    unsigned long endTime = millis();
    Serial.print("Display refresh completed in ");
    Serial.print((endTime - startTime) / 1000);
    Serial.println(" seconds");

    Serial.println("Display update complete!");

    // Free image buffer
    if (imageBuffer != nullptr) {
        free(imageBuffer);
        imageBuffer = nullptr;
        imageBufferSize = 0;
    }
}

/**
 * Setup button wake-up configuration for multiple buttons
 */
void setupButtonWakeup() {
    // Configure both button pins as input with pull-up (if buttons are active LOW)
    if (BUTTON_ACTIVE_LOW) {
        pinMode(METRO_BUTTON_PIN, INPUT_PULLUP);
        pinMode(SCREENSAVER_BUTTON_PIN, INPUT_PULLUP);
    } else {
        pinMode(METRO_BUTTON_PIN, INPUT);
        pinMode(SCREENSAVER_BUTTON_PIN, INPUT);
    }

    // Create bitmask for ext1 wake-up (supports multiple pins)
    uint64_t buttonMask = (1ULL << METRO_BUTTON_PIN) | (1ULL << SCREENSAVER_BUTTON_PIN);

    // Enable ext1 wake-up
    // ESP_EXT1_WAKEUP_ANY_HIGH: wake if any pin is HIGH
    // ESP_EXT1_WAKEUP_ANY_LOW: wake if any pin is LOW
    if (BUTTON_ACTIVE_LOW) {
        // Wake when ANY button goes LOW (button pressed with pull-up)
        esp_sleep_enable_ext1_wakeup(buttonMask, ESP_EXT1_WAKEUP_ANY_LOW);
    } else {
        // Wake when ANY button goes HIGH (button pressed)
        esp_sleep_enable_ext1_wakeup(buttonMask, ESP_EXT1_WAKEUP_ANY_HIGH);
    }

    Serial.println("Button wake-up enabled:");
    Serial.print("  - Metro button (Key 1) on GPIO ");
    Serial.println(METRO_BUTTON_PIN);
    Serial.print("  - Screensaver button (Key 2) on GPIO ");
    Serial.println(SCREENSAVER_BUTTON_PIN);
}

/**
 * Detect which button was pressed to wake the device
 * Returns: METRO_BUTTON_PIN, SCREENSAVER_BUTTON_PIN, or 0 if not woken by button
 */
int getWakeButtonPressed() {
    if (wakeup_reason == ESP_SLEEP_WAKEUP_EXT1) {
        Serial.println("Wake-up caused by button press");

        // Check which button is currently pressed
        // Note: This checks the current state, not which button triggered the wake
        // In practice, the button should still be pressed when we check
        if (BUTTON_ACTIVE_LOW) {
            // For active-low buttons, check which pin is LOW
            if (digitalRead(METRO_BUTTON_PIN) == LOW) {
                return METRO_BUTTON_PIN;
            } else if (digitalRead(SCREENSAVER_BUTTON_PIN) == LOW) {
                return SCREENSAVER_BUTTON_PIN;
            }
        } else {
            // For active-high buttons, check which pin is HIGH
            if (digitalRead(METRO_BUTTON_PIN) == HIGH) {
                return METRO_BUTTON_PIN;
            } else if (digitalRead(SCREENSAVER_BUTTON_PIN) == HIGH) {
                return SCREENSAVER_BUTTON_PIN;
            }
        }

        // If no button is currently pressed, default to metro button
        Serial.println("WARNING: Button released before detection, defaulting to metro");
        return METRO_BUTTON_PIN;

    } else if (wakeup_reason == ESP_SLEEP_WAKEUP_TIMER) {
        Serial.println("Wake-up caused by timer");
        return 0;
    } else {
        Serial.println("Wake-up not caused by deep sleep (first boot or reset)");
        return 0;
    }
}

/**
 * Display a test pattern to verify display is working
 */
void displayTestPattern() {
    Serial.println("\n--- Displaying Test Pattern ---");
    Serial.println("This will show colored rectangles to verify display hardware");

    unsigned long startTime = millis();

    // Clear display to white
    epaper.fillScreen(TFT_WHITE);

    // Draw colored rectangles (6 colors of Spectra 6)
    // Top row - color blocks
    epaper.fillRect(0, 0, 133, 160, TFT_BLACK);
    epaper.fillRect(133, 0, 133, 160, TFT_WHITE);
    epaper.fillRect(266, 0, 134, 160, TFT_RED);
    epaper.fillRect(400, 0, 133, 160, TFT_YELLOW);
    epaper.fillRect(533, 0, 133, 160, TFT_BLUE);
    epaper.fillRect(666, 0, 134, 160, TFT_GREEN);

    // Bottom - text
    epaper.setTextSize(2);
    epaper.setTextColor(TFT_BLACK);
    epaper.setCursor(50, 240);
    epaper.print("E-Ink Display Test");
    epaper.setCursor(50, 270);
    epaper.print("6 Colors: B W R Y B G");
    epaper.setCursor(50, 300);
    epaper.print("If you see colors,");
    epaper.setCursor(50, 330);
    epaper.print("display is working!");

    // Refresh the display
    Serial.println("Calling epaper.update() to refresh...");
    epaper.update();

    unsigned long endTime = millis();
    Serial.print("Test pattern refresh completed in ");
    Serial.print((endTime - startTime) / 1000);
    Serial.println(" seconds");

    Serial.println("Test pattern sent to display");
    Serial.println("NOTE: Display refresh may take 30+ seconds");
    Serial.println("Watch the display for color changes...");
}

/**
 * Enter deep sleep mode to conserve battery
 */
void enterDeepSleep(uint32_t durationSeconds) {
    Serial.println("\n--- Entering Deep Sleep ---");
    Serial.print("Will wake up in ");
    Serial.print(durationSeconds);
    Serial.print(" seconds (");
    Serial.print(durationSeconds / 60);
    Serial.println(" minutes)");

    // Setup button wake-up
    setupButtonWakeup();

    // Disconnect WiFi to save power
    WiFi.disconnect(true);
    WiFi.mode(WIFI_OFF);

    // Configure wake-up timer
    esp_sleep_enable_timer_wakeup(durationSeconds * 1000000ULL);

    Serial.println("Sleep wake sources:");
    Serial.println("  - Timer (scheduled update)");
    Serial.print("  - Metro button (Key 1) on GPIO ");
    Serial.println(METRO_BUTTON_PIN);
    Serial.print("  - Screensaver button (Key 2) on GPIO ");
    Serial.println(SCREENSAVER_BUTTON_PIN);
    Serial.println("Good night!");
    Serial.flush();

    // Enter deep sleep
    esp_deep_sleep_start();
}
