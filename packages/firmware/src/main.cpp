#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "config.h"

// Include E-Ink display library here when available
// #include "display_driver.h"

// Function prototypes
void setupWiFi();
void downloadImage();
void updateDisplay();
void enterDeepSleep();

void setup() {
    Serial.begin(115200);
    delay(1000);

    Serial.println("\n=================================");
    Serial.println("E-Ink Display System Starting...");
    Serial.println("=================================\n");

    // Initialize WiFi
    setupWiFi();

    // Initialize display
    Serial.println("Initializing display...");
    // TODO: Initialize E-Ink display driver
    // displayInit();

    // Download and display image
    downloadImage();
    updateDisplay();

    // Enter deep sleep to save power
    enterDeepSleep();
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
        enterDeepSleep();
    }
}

/**
 * Download image from server
 */
void downloadImage() {
    Serial.println("\n--- Downloading Image ---");
    Serial.print("Server URL: ");
    Serial.println(IMAGE_SERVER_URL);

    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("ERROR: WiFi not connected!");
        return;
    }

    HTTPClient http;
    http.begin(IMAGE_SERVER_URL);

    int httpCode = http.GET();

    if (httpCode == HTTP_CODE_OK) {
        int contentLength = http.getSize();
        Serial.print("Image size: ");
        Serial.print(contentLength);
        Serial.println(" bytes");

        // Get the image data
        WiFiClient* stream = http.getStreamPtr();

        // TODO: Process and store image data
        // For now, just read and discard to demonstrate download
        uint8_t buffer[128];
        int bytesRead = 0;

        while (http.connected() && (contentLength > 0 || contentLength == -1)) {
            size_t size = stream->available();
            if (size) {
                int c = stream->readBytes(buffer, min(size, sizeof(buffer)));
                bytesRead += c;
                if (contentLength > 0) {
                    contentLength -= c;
                }
            }
            delay(1);
        }

        Serial.print("Downloaded ");
        Serial.print(bytesRead);
        Serial.println(" bytes");

        // TODO: Save to SPIFFS/LittleFS or process for display

    } else {
        Serial.print("HTTP GET failed, error: ");
        Serial.println(http.errorToString(httpCode).c_str());
    }

    http.end();
}

/**
 * Update the E-Ink display with the downloaded image
 */
void updateDisplay() {
    Serial.println("\n--- Updating Display ---");

    // TODO: Implement display update logic
    // This will depend on the specific E-Ink display library

    /*
    Example pseudo-code:

    display.init();
    display.clear();

    // Load image data and render to display
    display.drawImage(imageBuffer, 0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);

    // Refresh the display
    display.refresh();

    // Put display to sleep to save power
    display.sleep();
    */

    Serial.println("Display update complete");
}

/**
 * Enter deep sleep mode to conserve battery
 */
void enterDeepSleep() {
    Serial.println("\n--- Entering Deep Sleep ---");
    Serial.print("Will wake up in ");
    Serial.print(SLEEP_DURATION_SECONDS);
    Serial.println(" seconds");

    // Disconnect WiFi to save power
    WiFi.disconnect(true);
    WiFi.mode(WIFI_OFF);

    // Configure wake-up timer
    esp_sleep_enable_timer_wakeup(SLEEP_DURATION_SECONDS * 1000000ULL);

    Serial.println("Good night!");
    Serial.flush();

    // Enter deep sleep
    esp_deep_sleep_start();
}
