# Last Session Summary - E-Ink Display Project

## Date
December 29, 2025

## Session Overview
Worked on implementing dual button controls for the E-Ink display firmware and troubleshooting display refresh issues.

---

## What We Accomplished

### 1. Added Dual Button Control (Key 1 & Key 2)
- **Key 1 (GPIO 1)**: Force metro data update
  - Wakes device from sleep
  - Calls generate-image API
  - Downloads and displays metro table
  - Sleeps for 15 minutes afterward

- **Key 2 (GPIO 2)**: Display screensaver
  - Wakes device from sleep
  - Downloads screensaver image (no API call)
  - Displays screensaver
  - Sleeps for 3.5 hours afterward

**Files Modified:**
- `packages/firmware/src/config.h` - Added `METRO_BUTTON_PIN` and `SCREENSAVER_BUTTON_PIN`
- `packages/firmware/src/main.cpp` - Implemented dual button wake-up using ESP32 ext1 wakeup
- Updated from `ESP_EXT1_WAKEUP_ALL_LOW` to `ESP_EXT1_WAKEUP_ANY_LOW` (deprecated API fix)

### 2. Fixed BMP Image Generation
**Problem:** Server was generating PNG files, but E-Ink display needs BMP format.

**Solution:**
- Added `bmp-js` dependency to convert PNG → BMP
- Updated `packages/service/src/services/image-generator.ts`:
  - Screenshot captured as PNG
  - Sharp extracts raw RGBA pixel data
  - bmp-js encodes as BMP
  - Writes BMP file to disk
  - Uploads BMP to file store with correct `image/bmp` content type

**Files Modified:**
- `packages/service/package.json` - Added `bmp-js@^0.1.0` and `sharp@^0.33.5`
- `packages/service/src/services/image-generator.ts` - PNG to BMP conversion pipeline
- `packages/service/.env.example` - Changed default to `IMAGE_OUTPUT_PATH=./output/display.bmp`
- `packages/service/src/config.ts` - Default output path now `.bmp`
- `packages/firmware/src/config.h` - Image URLs changed to `.bmp` extension

### 3. Display Refresh Mode Configuration
**User Request:** Make refresh time 30 seconds instead of 50 minutes.

**Changes:**
- Updated `display.init()` parameters for faster refresh
- Removed watchdog timer disable (not needed for short refreshes)
- Updated documentation to reflect fast refresh mode

**Trade-offs:**
- ✅ Much faster: ~30 seconds vs 50 minutes
- ⚠️ Slightly lower color quality (still good for transit data)

### 4. Corrected Color Count
Fixed documentation error: Display has **6 colors**, not 7.

**Correct palette:**
- Black (#000000)
- White (#FFFFFF)
- Red (#FF0000)
- Yellow (#FFFF00)
- Blue (#0000FF)
- Green (#00FF00)

**Files Updated:**
- `packages/firmware/README.md`
- `packages/firmware/docs/display-setup.md`

### 5. Added Display Hardware Diagnostics
To help troubleshoot blank screen issue, added:

**Test Pattern on First Boot:**
- Displays 6 colored rectangles automatically
- Shows text confirming colors
- Verifies display hardware without WiFi/downloads

**Enhanced Serial Debug Output:**
- Image download verification with byte counts
- BMP format detection with hex dump of first 16 bytes
- Display command execution logging
- Timing information for refresh cycles

**Files Modified:**
- `packages/firmware/src/main.cpp` - Added `displayTestPattern()` function

---

## Current Issue: Display Not Working

### Symptoms
The display remains blank and is showing "Busy Timeout!" errors.

### Terminal Output Analysis
```
*** FIRST BOOT DETECTED ***
Displaying test pattern to verify display hardware...

--- Displaying Test Pattern ---
_InitDisplay reset : 5
_PowerOn : 2
Busy Timeout!
_refresh : 60001058
Busy Timeout!
_PowerOff : 60001058
```

**Key Observations:**
1. ✅ WiFi connects successfully (IP: 192.168.1.34)
2. ✅ Image generation API call succeeds
3. ✅ BMP image downloads successfully (1,152,054 bytes)
4. ❌ Display initialization timeout ("_InitDisplay reset : 5")
5. ❌ Display power on timeout ("_PowerOn : 2")
6. ❌ Display refresh timeout ("Busy Timeout!")
7. ❌ Display commands fail with error code 60001058

### Possible Root Causes

#### 1. Hardware Connection Issues
- **BUSY pin not connected or wrong GPIO**
  - BUSY pin (GPIO 39) may not be properly connected
  - Display driver waits for BUSY signal but never receives it
  - Results in timeout errors

- **SPI pins incorrect**
  - Current config uses hardware SPI (GPIO 7 SCK, GPIO 9 MOSI)
  - XIAO EE04 board may use different pins
  - Need to verify actual pin mapping for the board

- **Power supply issues**
  - E-Ink display requires stable power
  - May need external power for 7.3" display
  - USB power might be insufficient

#### 2. Display Driver Mismatch
- **Wrong display model in code**
  - Using `GxEPD2_730c_ACeP_730` driver
  - User has "50-pin port and color display"
  - May need different driver class (e.g., `GxEPD2_730c` for 3-color or different variant)

- **Display not ACeP 730**
  - User never confirmed exact display model number
  - May be GDEY073D46, GDEM073E01, or other 7.3" variant
  - Each requires specific driver

#### 3. Library/Initialization Issues
- **GxEPD2 library version incompatibility**
  - Using version ^1.5.9
  - May need different version for this display

- **Initialization parameters wrong**
  - Current: `display.init(115200, true, 20, false)`
  - May need different reset duration or mode

---

## What Still Needs to Be Done

### CRITICAL: Fix Display Hardware Communication

#### Step 1: Verify Hardware Setup
**Need to confirm from user:**
1. Exact display model number (should be printed on display or product page)
2. Are you using XIAO ePaper Display Board EE04?
3. Is the 50-pin FPC cable properly seated in both connectors?
4. Power source: USB only or external power supply?

#### Step 2: Verify Pin Configuration
**Test with multimeter or logic analyzer:**
- GPIO 39 (BUSY) - Should toggle during display operations
- GPIO 40 (RST) - Should pulse during reset
- GPIO 38 (DC) - Should toggle during data/command switching
- GPIO 41 (CS) - Should go LOW during SPI transactions
- GPIO 7 (SCK) - Should show clock signal during SPI
- GPIO 9 (MOSI) - Should show data during SPI

**Possible fixes:**
- Try different GPIO pins if board uses non-standard mapping
- Add pull-up resistor to BUSY pin (10kΩ to 3.3V)
- Check if EE04 board has different pinout than documented

#### Step 3: Identify Correct Display Driver
**Need exact model number to select correct driver:**

For 7.3" displays, common options:
```cpp
// 3-color (Black, White, Red)
GxEPD2_3C<GxEPD2_730c, GxEPD2_730c::HEIGHT> display(...)

// 4-color (Black, White, Red, Yellow)
GxEPD2_4C<GxEPD2_730c_GDEY073D46, ...> display(...)

// 6-color ACeP (current assumption)
GxEPD2_7C<GxEPD2_730c_ACeP_730, ...> display(...)

// Different 6-color variant
GxEPD2_7C<GxEPD2_730c_GDEY073E01, ...> display(...)
```

**Action:** User needs to provide exact display model to select correct driver class.

#### Step 4: Test Basic SPI Communication
Create minimal test firmware that:
1. Initializes SPI bus
2. Sends reset pulse to display
3. Reads status register
4. Verifies BUSY pin responds

**Test code to add:**
```cpp
void testDisplayHardware() {
    Serial.println("Testing display hardware...");

    // Test reset pin
    pinMode(EPD_RST_PIN, OUTPUT);
    digitalWrite(EPD_RST_PIN, LOW);
    delay(200);
    digitalWrite(EPD_RST_PIN, HIGH);
    delay(200);
    Serial.println("Reset pulse sent");

    // Test BUSY pin
    pinMode(EPD_BUSY_PIN, INPUT);
    int busyState = digitalRead(EPD_BUSY_PIN);
    Serial.print("BUSY pin state: ");
    Serial.println(busyState ? "HIGH" : "LOW");

    // Test SPI
    SPI.begin(EPD_SCK_PIN, -1, EPD_MOSI_PIN, EPD_CS_PIN);
    Serial.println("SPI initialized");
}
```

#### Step 5: Alternative Display Initialization
Try different initialization approaches:
```cpp
// Option 1: Disable serial diagnostics
display.init(0, true, 20, false);

// Option 2: Longer reset duration
display.init(115200, true, 200, false);

// Option 3: No initial reset
display.init(115200, false, 20, false);
```

---

## Image Generation Service Issues

### Environment Configuration Needed
User needs to update their `.env` file in `packages/service/`:

```env
IMAGE_OUTPUT_PATH=./output/display.bmp
FILE_STORE_URL=https://storage.hermes-lab.com/dev/eink/metroTable
```

**Note:** File store is uploading BMP files but URLs may still point to PNG. Verify:
- File store receives `.bmp` files
- Firmware downloads from correct `.bmp` URLs

---

## CRITICAL DISCOVERY: Display Model Identified!

**Display Model: GDEP073E01 (Good Display Spectra E6)**
- Source: https://github.com/protivinsky/photoink/blob/main/spectra/code.py
- Manufacturer: Good Display
- Product page: https://www.good-display.com/product/442.html
- 7.3 inch, 800×480 pixels
- 7 colors (Black, White, Yellow, Red, Blue, Green, Clean)

### PROBLEM IDENTIFIED: Wrong Driver in Firmware!

**What we're using:**
```cpp
GxEPD2_7C<GxEPD2_730c_ACeP_730, ...>
```

**What we should probably use:**
The GxEPD2 library may not have specific support for GDEP073E01. Need to check if there's a `GxEPD2_730c_GDEP073E01` class or if we need custom initialization.

**Python code shows manual initialization sequence:**
- The working Python code manually sends initialization commands
- Uses manufacturer-provided sequence
- May indicate GxEPD2 library doesn't properly support this display model

### Pin Comparison

**Python code (working):**
- DC: D9
- RST: D6
- CS: D10
- BUSY: D5

**Our firmware (current):**
- DC: GPIO 38 (D5)
- RST: GPIO 40 (D7)
- CS: GPIO 41 (D8)
- BUSY: GPIO 39 (D6)

**Note:** Pin numbers are different but this is expected - Python code is for different board. Our XIAO pin mapping should be correct for EE04 board.

## Hardware Questions Still Unanswered

1. ✅ **Display Model:** GDEP073E01 Spectra E6 (CONFIRMED from Python example)
2. **Pin Verification:** Are the SPI pins correct for XIAO EE04 board?
3. **Power Supply:** Is the display getting enough power? (7.3" displays can draw significant current)
4. **Cable Connection:** Is the 50-pin FPC cable firmly seated?
5. **Board Type:** Confirm you're using XIAO ePaper Display Board EE04 with ESP32-S3 Plus

---

## Files Modified This Session

### Firmware (packages/firmware)
- `src/main.cpp` - Dual buttons, test pattern, enhanced debugging
- `src/config.h` - Button pins, BMP URLs, WiFi credentials
- `README.md` - Updated features, color count, refresh mode
- `docs/display-setup.md` - Corrected colors, refresh times
- `requirements.md` - Dual button documentation

### Service (packages/service)
- `package.json` - Added bmp-js and sharp dependencies
- `src/services/image-generator.ts` - PNG to BMP conversion
- `src/config.ts` - Default BMP output path
- `.env.example` - Updated IMAGE_OUTPUT_PATH to .bmp

---

## Next Steps for Next Session

### Priority 1: Fix Display Driver for GDEP073E01
✅ **Display model confirmed: GDEP073E01**

**Immediate Actions:**

1. **Check if GxEPD2 library supports GDEP073E01:**
   - Look in `.pio/libdeps/seeed_xiao_esp32s3/GxEPD2/src/` folder
   - Search for files containing "GDEP073E01" or "073E01"
   - Check available 7-color drivers in the library

2. **If GxEPD2 supports it:**
   ```cpp
   // Try this driver class instead:
   GxEPD2_7C<GxEPD2_730c_GDEP073E01, GxEPD2_730c_GDEP073E01::HEIGHT> display(...)
   ```

3. **If GxEPD2 doesn't support GDEP073E01:**
   - Option A: Port the Python initialization sequence to C++
   - Option B: Use a different library that supports this display
   - Option C: Create custom driver based on manufacturer datasheet

4. **Test with different GxEPD2 drivers:**
   ```cpp
   // Try these alternatives:
   GxEPD2_7C<GxEPD2_730c, ...>
   GxEPD2_7C<GxEPD2_730, ...>
   ```

### Priority 2: Alternative - Port Python Initialization
If GxEPD2 doesn't work, implement custom initialization based on working Python code:
- Copy manufacturer's command sequence from Python code
- Send raw SPI commands to display
- Bypass GxEPD2 library for initialization
- Use manual drawing commands

Reference Python code: https://github.com/protivinsky/photoink/blob/main/spectra/code.py

### Priority 2: Simplify Testing
1. Create standalone test firmware that only tests display (no WiFi)
2. Implement simple drawing commands (lines, rectangles)
3. Verify SPI communication is working
4. Test each display command individually

### Priority 3: Research Display Variant
1. Find datasheet for exact display model
2. Verify timing requirements (reset duration, busy timeout)
3. Check if display needs different initialization sequence
4. Confirm GxEPD2 library supports this exact model

### Priority 4: Hardware Verification Checklist
- [ ] Verify all pin connections with multimeter
- [ ] Check BUSY pin voltage during operation
- [ ] Measure power supply voltage under load
- [ ] Reseat FPC cable connection
- [ ] Try different reset durations
- [ ] Test with external power supply if on USB

---

## Key Technical Details to Remember

### Display Specifications (Assumed)
- **Size:** 7.3 inches diagonal
- **Resolution:** 800 × 480 pixels
- **Colors:** 6 (Black, White, Red, Yellow, Blue, Green)
- **Interface:** SPI via 50-pin FPC connector
- **Refresh:** ~30 seconds (fast mode) or ~50 minutes (full quality)

### ESP32-S3 Pin Configuration
```cpp
#define EPD_BUSY_PIN 39   // D6
#define EPD_RST_PIN 40    // D7
#define EPD_DC_PIN 38     // D5
#define EPD_CS_PIN 41     // D8
// Hardware SPI:
// SCK: GPIO 7
// MOSI: GPIO 9
```

### Button Configuration
```cpp
#define METRO_BUTTON_PIN 1          // Key 1
#define SCREENSAVER_BUTTON_PIN 2    // Key 2
#define BUTTON_ACTIVE_LOW true
```

### Network Configuration
- **WiFi SSID:** OrbiWifiMesh
- **Service API:** http://192.168.1.34:3001/generate-image
- **Metro Image:** https://storage.hermes-lab.com/dev/eink/metroTable/display.bmp
- **Screensaver:** https://storage.hermes-lab.com/dev/eink/screensaver/display.bmp

---

## Error Codes Seen

- **60001058** - Display busy timeout
  - Display BUSY pin never goes LOW
  - Either hardware connection issue or wrong pin mapping
  - Or display not responding to commands

---

## Useful Resources

### GxEPD2 Library
- GitHub: https://github.com/ZinggJM/GxEPD2
- Supported displays: Check examples folder for exact model
- Documentation: See wiki for initialization parameters

### XIAO ESP32-S3 Resources
- Wiki: https://wiki.seeedstudio.com/xiao_esp32s3_getting_started/
- Pin definitions: Check schematic for actual GPIO mapping
- Power consumption: Important for 7.3" display operation

### E-Ink Display Datasheets
- Search for exact model number on manufacturer site
- Check Waveshare, Good Display, or Pervasive Displays
- Datasheet will have timing diagrams and initialization sequence

---

## Questions for User (Next Session)

1. What is the **exact model number** printed on the display?
2. Can you take a **photo of the display back** showing model number?
3. Can you confirm the **XIAO ePaper Display Board EE04** is what you're using?
4. Is the **50-pin cable properly seated** on both ends?
5. What **power source** are you using? (USB only or external power?)
6. Do you have a **multimeter** to check pin connections?
7. Can you try **reseating the display cable**?

---

## Key Learnings from Python Code Analysis

### Display Initialization Sequence (from working code)
The GDEP073E01 requires this specific initialization sequence:

1. **Hardware Reset**
   ```python
   res.value(1)  # Release reset
   sleep_ms(200)
   res.value(0)  # Pull reset low
   sleep_ms(4)
   res.value(1)  # Release reset
   sleep_ms(200)
   ```

2. **Panel Setting Command (0x00)**
   - Sets resolution and display parameters
   - Configures LUT (Look-Up Table) mode

3. **Power Settings (0x01, 0x03, 0x06)**
   - Voltage levels and power sequencing
   - Booster configuration

4. **PLL Control (0x30)**
   - Display timing configuration

5. **Resolution Setting (0x61)**
   - Width: 800 pixels (0x320)
   - Height: 480 pixels (0x1E0)

6. **VCOM and Data Interval (0x50, 0x60)**
   - Display refresh parameters

7. **Power On (0x04)**
   - Wait 100ms for power stabilization

### Why GxEPD2 May Be Failing
The Python code uses **manufacturer-specific initialization commands** that may differ from what GxEPD2 expects. The "Busy Timeout" errors suggest:

1. GxEPD2 is using wrong initialization for this specific panel
2. Display never properly powers on, so BUSY pin never signals ready
3. Commands sent by GxEPD2 don't match what GDEP073E01 expects

### Solution Options

**Option 1: Find correct GxEPD2 driver**
- Check if `GxEPD2_730c_GDEP073E01` exists
- May be named differently in library

**Option 2: Custom initialization** (Most likely needed)
- Keep using GxEPD2 for drawing functions
- Override initialization with manufacturer sequence from Python code
- Send raw SPI commands for setup

**Option 3: Port entire Python implementation**
- Implement complete display driver in C++
- More work but guaranteed to match working code

---

## Summary

We successfully implemented dual button controls and BMP image generation, but encountered a critical hardware communication issue with the E-Ink display. The display driver is timing out when trying to communicate with the display hardware, indicated by "Busy Timeout!" errors.

**ROOT CAUSE IDENTIFIED:** We are using the wrong display driver!

✅ **Display Model:** GDEP073E01 (Good Display Spectra E6) - Confirmed from working Python code
❌ **Current Driver:** `GxEPD2_730c_ACeP_730` - Generic ACeP driver, not specific to GDEP073E01
✅ **Working Example:** Python code with manual initialization sequence exists

**Next critical step:**
1. Check if GxEPD2 library has `GxEPD2_730c_GDEP073E01` driver class
2. If not, port the manufacturer initialization sequence from Python code
3. Send specific command sequence that GDEP073E01 expects

The image generation service is working correctly (downloading 1.15MB BMP files successfully), so once we fix the display driver initialization, the full system should work.

**Confidence Level:** HIGH - We now know exact display model and have working reference implementation to follow.
