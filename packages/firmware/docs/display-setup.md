# E-Ink Display Setup Guide

## Hardware

**Display**: 7.3" E-Ink Spectra 6 (E6) Full Color Display
- Model: ACeP 730 (6-color display)
- Resolution: 800 x 480 pixels
- Colors: 6 colors (Black, White, Red, Yellow, Blue, Green)
- Interface: SPI

**Board**: XIAO ePaper Display Board EE04
- MCU: XIAO ESP32-S3 Plus
- Built-in display connector
- Pre-wired SPI connections

## Pin Configuration

The XIAO ePaper Display Board EE04 has the following pin mapping:

| Function | ESP32-S3 Pin | Display Board Pin |
|----------|--------------|-------------------|
| CS       | GPIO 41      | D8                |
| DC       | GPIO 38      | D5                |
| RST      | GPIO 40      | D7                |
| BUSY     | GPIO 39      | D6                |
| SCK      | GPIO 7       | Hardware SPI      |
| MOSI     | GPIO 9       | Hardware SPI      |

**Note**: The SPI pins (SCK, MOSI) are hardware-defined on the ESP32-S3 and cannot be changed.

## Library Setup

The firmware uses the **GxEPD2** library by Jean-Marc Zingg for driving the E-Ink display.

### Installation

The library is automatically installed via PlatformIO when you build the project.

```ini
lib_deps =
    zinggjm/GxEPD2@^1.5.9
    adafruit/Adafruit GFX Library@^1.11.9
```

### Display Model

The 7.3" Spectra 6 uses the `GxEPD2_730c_ACeP_730` driver class:

```cpp
GxEPD2_7C<GxEPD2_730c_ACeP_730, GxEPD2_730c_ACeP_730::HEIGHT> display(
    GxEPD2_730c_ACeP_730(EPD_CS_PIN, EPD_DC_PIN, EPD_RST_PIN, EPD_BUSY_PIN)
);
```

## Image Format

### Supported Formats

The current implementation supports:
- **BMP (Bitmap)**: Native support, recommended format
- **PNG**: Not currently supported (requires additional decoder library)

### Image Requirements

For best results:

1. **Resolution**: 800 x 480 pixels (exact match to display)
2. **Format**: BMP (24-bit or 8-bit)
3. **Color Mode**: RGB or Indexed Color
4. **File Size**: Keep under 500KB for faster downloads

### Color Mapping

The E-Ink Spectra 6 supports 6 colors. The display will approximate your image colors to:
- Black (#000000)
- White (#FFFFFF)
- Red (#FF0000)
- Yellow (#FFFF00)
- Blue (#0000FF)
- Green (#00FF00)

**Tip**: Pre-process your images to use only these exact colors for best results.

## Converting Images

### Using ImageMagick

```bash
# Resize to display dimensions
convert input.png -resize 800x480! output.png

# Convert to BMP with limited colors
convert input.png -resize 800x480! -colors 6 -type Palette output.bmp

# Optimize with specific palette
convert input.png -resize 800x480! \
  -define bmp:format=bmp3 \
  -depth 8 \
  output.bmp
```

### Using GIMP

1. Open your image in GIMP
2. **Image → Scale Image** → Set to 800 x 480 pixels
3. **Image → Mode → Indexed** → Use 6 colors
4. **File → Export As** → Choose BMP format
5. In BMP options: Select "24-bit" or "8-bit"

### Using Python (PIL/Pillow)

```python
from PIL import Image

# Open and resize image
img = Image.open('input.png')
img = img.resize((800, 480), Image.Resampling.LANCZOS)

# Reduce to 6 colors
img = img.convert('P', palette=Image.ADAPTIVE, colors=6)

# Save as BMP
img.save('output.bmp', 'BMP')
```

## Display Update Process

### Full Refresh Cycle

1. **Wake Display**: Display wakes from hibernate mode
2. **Initialize**: SPI communication established
3. **Clear Buffer**: Display buffer cleared to white
4. **Draw Image**: Image data written to buffer
5. **Refresh**: Physical E-Ink refresh (takes 15-30 seconds)
6. **Hibernate**: Display enters low-power mode

### Refresh Time

The firmware is configured for **fast refresh mode** (~30 seconds). For best color quality, the display can do a full refresh (50 minutes), but this is disabled by default for practical use.

**Fast Refresh Mode** (current):
- Refresh time: ~30 seconds
- Color quality: Good (optimized for speed)
- Best for: Regular updates, transit data

**Full Quality Mode** (optional):
- Refresh time: ~50 minutes
- Color quality: Excellent (full ACeP color accuracy)
- Best for: Static images, artwork

**Note**: During refresh, you'll see the display cycle through different colors. This is part of the E-Ink refresh process.

## Power Consumption

| Mode | Current Draw | Notes |
|------|--------------|-------|
| Hibernate | ~5µA | Display off, no power |
| Refreshing | ~40-50mA | During update cycle |
| Idle | ~20µA | Between updates |

The display consumes **zero power** when showing a static image (no refresh needed).

## Troubleshooting

### Display Not Responding

1. Check pin connections match `config.h`
2. Verify display cable is fully seated
3. Try resetting the board
4. Check BUSY pin is not stuck high

### Partial Image Display

1. Ensure image is exactly 800x480 pixels
2. Check image format is BMP
3. Verify sufficient memory for image buffer
4. Check download completed successfully

### Incorrect Colors

1. Use exact hex colors for E-Ink palette
2. Convert image to indexed color mode
3. Reduce to 6 colors maximum
4. Avoid gradients and transparency

### Slow Refresh

This is **normal** for 7-color E-Ink displays. The ACeP technology requires multiple passes to render all colors correctly. Refresh time: 15-30 seconds.

### Memory Issues

If you get memory allocation errors:

1. Reduce image file size
2. Use 8-bit BMP instead of 24-bit
3. Ensure no memory leaks (check `free()` calls)
4. Monitor heap usage via serial output

### Display Shows Previous Image

The E-Ink display retains the last image even without power. To clear:

```cpp
display.clearScreen();
display.refresh();
```

## Testing

### Test Pattern

Upload this simple test to verify display is working:

```cpp
display.setFullWindow();
display.firstPage();
do {
    display.fillScreen(GxEPD_WHITE);
    display.fillRect(0, 0, 200, 100, GxEPD_BLACK);
    display.fillRect(200, 0, 200, 100, GxEPD_RED);
    display.fillRect(400, 0, 200, 100, GxEPD_YELLOW);
    display.fillRect(0, 100, 200, 100, GxEPD_BLUE);
    display.fillRect(200, 100, 200, 100, GxEPD_GREEN);
} while (display.nextPage());
```

You should see colored rectangles on the display.

## Best Practices

1. **Always hibernate** after updating to save power
2. **Use exact dimensions** (800x480) for images
3. **Pre-process images** to use E-Ink color palette
4. **Limit updates** - E-Ink has limited refresh cycles (~10,000)
5. **Wait for BUSY** - Don't interrupt refresh cycle
6. **Test thoroughly** before battery deployment

## Additional Resources

- [GxEPD2 Library Documentation](https://github.com/ZinggJM/GxEPD2)
- [Waveshare E-Paper Wiki](https://www.waveshare.com/wiki/E-Paper)
- [XIAO ESP32-S3 Wiki](https://wiki.seeedstudio.com/xiao_esp32s3_getting_started/)
- [E-Ink Technology Overview](https://www.eink.com/acep.html)
