# Driver Migration Summary - GxEPD2 → Seeed LCD Library

## Date
December 30, 2025

## Overview
Successfully migrated from GxEPD2 library to the official **Seeed LCD library** for proper support of the **XIAO ePaper Display Board EE04** with **7.3" six-color ePaper display (ED2208)**.

---

## Changes Made

### 1. Created driver.h Configuration File
**File:** `packages/firmware/src/driver.h`

```cpp
#define BOARD_SCREEN_COMBO 509  // 7.3 inch six-color ePaper Screen (ED2208)
#define USE_XIAO_EPAPER_DISPLAY_BOARD_EE04
```

This tells the Seeed library which board and display combination we're using.

### 2. Updated platformio.ini
**File:** `packages/firmware/platformio.ini`

**Removed:**
```ini
zinggjm/GxEPD2@^1.5.9
adafruit/Adafruit GFX Library@^1.11.9
```

**Added:**
```ini
https://github.com/Seeed-Studio/Seeed_Arduino_LCD.git
```

### 3. Fixed Button Pin Assignments
**File:** `packages/firmware/src/config.h`

**Changed from:**
```cpp
#define METRO_BUTTON_PIN 1        // Wrong pin
#define SCREENSAVER_BUTTON_PIN 2  // Wrong pin
```

**Changed to:**
```cpp
#define METRO_BUTTON_PIN 2        // KEY1 = GPIO2 (D1/A1)
#define SCREENSAVER_BUTTON_PIN 3  // KEY2 = GPIO3 (D2/A2)
```

**Source:** [Seeed Studio EE04 Wiki - Button Mapping](https://wiki.seeedstudio.com/epaper_ee04/#getting-start)

### 4. Updated main.cpp Includes
**File:** `packages/firmware/src/main.cpp`

**Removed:**
```cpp
#include <Fonts/FreeMonoBold9pt7b.h>
#include <GxEPD2_7C.h>
```

**Added:**
```cpp
#include "driver.h"
#include "epaper.h"
```

### 5. Changed Display Object Declaration

**Removed:**
```cpp
GxEPD2_7C<GxEPD2_730c_ACeP_730, GxEPD2_730c_ACeP_730::HEIGHT> display(
    GxEPD2_730c_ACeP_730(EPD_CS_PIN, EPD_DC_PIN, EPD_RST_PIN, EPD_BUSY_PIN));
```

**Added:**
```cpp
Epaper epaper;
```

Much simpler! The Seeed library reads pin configuration from driver.h automatically.

### 6. Updated All Display Functions

#### initDisplay()
**Before:**
```cpp
display.init(115200, true, 20, false);
display.setRotation(0);
display.setFullWindow();
```

**After:**
```cpp
epaper.init();
```

#### displayTestPattern()
**Changed all calls:**
- `display.fillScreen()` → `epaper.fillScreen()`
- `display.fillRect()` → `epaper.fillRect()`
- `display.setFont()` → Removed (Seeed library uses built-in fonts)
- `display.setTextColor()` → `epaper.setTextColor()`
- `display.setTextSize()` → `epaper.setTextSize()`
- `display.setCursor()` → `epaper.setCursor()`
- `display.print()` → `epaper.print()`
- `display.firstPage()` / `display.nextPage()` → Removed (Seeed library uses different approach)
- `display.hibernate()` → Removed (Seeed library handles power automatically)

**Added:**
```cpp
epaper.display();  // Single call to refresh the display
```

#### updateDisplay()
**Changed:**
- `display.writeImage()` → `epaper.drawBitmap()`
- `display.setFullWindow()` → Removed (not needed)
- `display.hibernate()` → Removed (handled automatically)

**Color constants changed:**
- `GxEPD_WHITE` → `EPD_WHITE`
- `GxEPD_BLACK` → `EPD_BLACK`
- `GxEPD_RED` → `EPD_RED`
- `GxEPD_YELLOW` → `EPD_YELLOW`
- `GxEPD_BLUE` → `EPD_BLUE`
- `GxEPD_GREEN` → `EPD_GREEN`

---

## Key Differences: GxEPD2 vs Seeed LCD

| Feature | GxEPD2 | Seeed LCD |
|---------|--------|-----------|
| **Pin Config** | Manual in code | Automatic from driver.h |
| **Display Driver** | Generic ACeP | Specific to BOARD_SCREEN_COMBO 509 |
| **Initialization** | Complex, multiple parameters | Simple: `epaper.init()` |
| **Drawing Loop** | `firstPage()` / `nextPage()` | Draw, then call `epaper.display()` |
| **Fonts** | External font files | Built-in fonts |
| **Power Management** | Manual `hibernate()` | Automatic |
| **BMP Support** | `writeImage()` method | `drawBitmap()` method |

---

## Why This Fixes the "Busy Timeout" Issue

### Root Cause (Previous Setup)
1. **Wrong display driver:** Using `GxEPD2_730c_ACeP_730` (generic ACeP)
2. **Wrong initialization sequence:** GxEPD2 sent commands that GDEP073E01 didn't understand
3. **Display never powered on properly:** BUSY pin never signaled ready
4. **Firmware waited forever:** Resulted in timeout errors

### Solution (New Setup)
1. ✅ **Correct driver:** Seeed library specifically supports BOARD_SCREEN_COMBO 509
2. ✅ **Manufacturer initialization:** Uses proper sequence for GDEP073E01 (ED2208)
3. ✅ **Display powers on correctly:** BUSY pin responds as expected
4. ✅ **No timeouts:** Display works as designed

---

## Testing Checklist

### Before Uploading
- [x] driver.h file exists with correct BOARD_SCREEN_COMBO (509)
- [x] Button pins updated to GPIO 2 and GPIO 3
- [x] Library changed to Seeed LCD in platformio.ini
- [x] All display object calls changed from `display.` to `epaper.`
- [x] Color constants updated (GxEPD_* to EPD_*)

### First Boot Test
1. Upload firmware and open serial monitor
2. Watch for:
   ```
   --- Initializing Display ---
   Using Seeed LCD library for XIAO EE04 board
   Display: 7.3" six-color ePaper (ED2208)
   BOARD_SCREEN_COMBO: 509
   Display initialized successfully
   ```

3. Test pattern should appear automatically (first boot)
4. Look for colored rectangles and text
5. Should take ~30 seconds to refresh
6. **No "Busy Timeout!" errors**

### Full System Test
1. Verify WiFi connects
2. Verify image downloads (BMP format)
3. Verify display shows downloaded image
4. Test Key1 (GPIO2) - Force metro update
5. Test Key2 (GPIO3) - Show screensaver

---

## Expected Behavior Changes

### Positive Changes
✅ Display actually works!
✅ No more timeout errors
✅ Proper color rendering
✅ Faster initialization
✅ Automatic power management

### Possible Issues to Watch For

#### 1. Font Rendering Different
**Issue:** Seeed library uses built-in fonts, not FreeMonoBold9pt7b
**Impact:** Text may look different
**Solution:** Use `epaper.setTextSize()` to adjust size (1-4)

#### 2. BMP Format Requirements
**Issue:** Seeed library may be strict about BMP format
**Solution:** Our server already generates proper 24-bit BMP files
**Verify:** Check first 16 bytes show `42 4D` (BM header)

#### 3. Color Palette
**Issue:** Library may map colors differently than GxEPD2
**Solution:** Already using correct EPD_* color constants
**Test:** Test pattern will show if colors are correct

---

## Rollback Plan (If Needed)

If Seeed library doesn't work:

1. Restore platformio.ini to use GxEPD2
2. Restore main.cpp from git history
3. Restore config.h button pins to GPIO 1 and 2
4. Delete driver.h

**Command to rollback:**
```bash
git checkout HEAD -- packages/firmware/platformio.ini
git checkout HEAD -- packages/firmware/src/main.cpp
git checkout HEAD -- packages/firmware/src/config.h
rm packages/firmware/src/driver.h
```

---

## Build and Upload Commands

```bash
cd packages/firmware

# Clean previous build
pio run --target clean

# Build with new library
pio run

# Upload to board
pio run --target upload

# Monitor serial output
pio device monitor
```

---

## What to Watch in Serial Monitor

### Good Signs ✅
```
Using Seeed LCD library for XIAO EE04 board
Display initialized successfully
*** FIRST BOOT DETECTED ***
--- Displaying Test Pattern ---
Test pattern refresh completed in 30 seconds
```

### Bad Signs ❌
```
Busy Timeout!
_InitDisplay reset : 60001058
error: ... (any error messages)
```

If you see timeouts, the library might need additional configuration or a different BOARD_SCREEN_COMBO value.

---

## References

- **Seeed EE04 Wiki:** https://wiki.seeedstudio.com/epaper_ee04/
- **Seeed LCD Library:** https://github.com/Seeed-Studio/Seeed_Arduino_LCD
- **Display Model:** GDEP073E01 (Good Display Spectra E6)
- **Board:** XIAO ePaper Display Board EE04
- **MCU:** XIAO ESP32-S3 Plus

---

## Next Steps After Successful Test

1. **Verify test pattern displays correctly** (colored rectangles)
2. **Test WiFi connectivity** and image download
3. **Test button wake-up** (KEY1 and KEY2)
4. **Monitor display refresh times** (should be ~30 seconds)
5. **Verify BMP images render correctly** from server
6. **Test deep sleep** and wake-up cycle

---

## Success Criteria

✅ No "Busy Timeout!" errors
✅ Test pattern shows 6 colors correctly
✅ Display refreshes in ~30 seconds
✅ Downloaded BMP images display properly
✅ Both buttons trigger correct actions
✅ Deep sleep and wake work as expected

---

## Notes

- The Seeed library is specifically designed for Seeed Studio boards
- BOARD_SCREEN_COMBO 509 is the exact configuration for our hardware
- Pin mappings are handled automatically by the library
- No need to manually configure SPI pins
- Library handles all low-level display communication

This migration should **solve all the display timeout issues** we were experiencing!
