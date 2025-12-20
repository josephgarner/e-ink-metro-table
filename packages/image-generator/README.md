# E-Ink Image Generator

A TypeScript/React application for generating 5:3 aspect ratio images optimized for the 7.3" E-Ink Spectra 6 display.

## Features

- **Live Preview**: Run a local development server to view and design components in real-time
- **React-based**: Build display layouts using React components
- **TypeScript**: Full type safety and IntelliSense support
- **Image Generation**: Convert React components to PNG images
- **Optimized for E-Ink**: Designed for 6-color E-Ink displays (Black, White, Red, Yellow, Blue, Green)

## Display Specifications

- **Resolution**: 800 × 480 pixels
- **Aspect Ratio**: 5:3
- **Colors**: 6 colors (Black, White, Red, Yellow, Blue, Green)
- **Display**: 7.3" E-Ink Spectra 6 (E6)

## Installation

```bash
npm install
```

## Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` to configure your settings:
```env
DISPLAY_WIDTH=800
DISPLAY_HEIGHT=480
FILE_STORE_PATH=//192.168.1.100/shared/eink  # Your network path
OUTPUT_FILENAME=display.png
```

## Usage

### Development Mode

Run the local development server to preview your components:

```bash
npm run dev
```

This will start a Vite dev server at `http://localhost:3000` where you can:
- Preview your display components in real-time
- Switch between different components using the selector
- Make changes and see them update instantly

### Building for Production

Build the optimized production version:

```bash
npm run build
```

### Generating Images

To generate a PNG image from your current display component:

1. Make sure the dev server is running (`npm run dev`)
2. In another terminal, run:
```bash
npm run generate
```

The image will be saved to the configured `FILE_STORE_PATH`.

**Note**: The generate script requires the dev server to be running, or you can set `APP_URL` in your `.env` to point to your built/deployed version.

## Creating Custom Components

1. Create a new component in `src/components/`:

```typescript
// src/components/MyCustomDisplay.tsx
import './MyCustomDisplay.css'

function MyCustomDisplay() {
  return (
    <div className="my-custom-display">
      <h1>My Custom Layout</h1>
      {/* Your content here */}
    </div>
  )
}

export default MyCustomDisplay
```

2. Add corresponding styles in `src/components/MyCustomDisplay.css`

3. Import and add to `App.tsx`:

```typescript
import MyCustomDisplay from './components/MyCustomDisplay'

// In the components object:
const components = {
  example: <ExampleDisplay />,
  custom: <MyCustomDisplay />,
}

// In the select element:
<option value="custom">My Custom Display</option>
```

## E-Ink Color Palette

Use these exact color values for best results on the E-Ink Spectra 6 display:

```css
Black:  #000000
White:  #FFFFFF
Red:    #FF0000
Yellow: #FFFF00
Blue:   #0000FF
Green:  #00FF00
```

## Best Practices

1. **Use Pure Colors**: Stick to the 6-color palette. Gradients and mixed colors won't render well on E-Ink displays.

2. **Bold Fonts**: E-Ink displays have lower contrast, so use bold, clear fonts.

3. **High Contrast**: Ensure good contrast between foreground and background colors.

4. **Static Content**: E-Ink displays are best for static content. Avoid animations in your final images.

5. **Simple Layouts**: Keep layouts clean and uncluttered for better readability.

6. **Test Dimensions**: Always preview at actual size (800×480) to ensure elements are appropriately sized.

## Project Structure

```
src/
├── components/
│   ├── DisplayPreview.tsx       # Preview container component
│   ├── DisplayPreview.css
│   ├── ExampleDisplay.tsx       # Example display layout
│   └── ExampleDisplay.css
├── App.tsx                      # Main application
├── App.css
├── main.tsx                     # Entry point
├── index.css
└── generate.ts                  # Image generation script
```

## Troubleshooting

### Image generation fails

- Ensure the dev server is running (`npm run dev`)
- Check that the `FILE_STORE_PATH` directory exists and is writable
- Verify network paths are accessible (if using network storage)

### Components not rendering correctly

- Check browser console for errors
- Verify all CSS files are imported
- Ensure dimensions fit within 800×480 viewport

### Network path issues (Windows)

For Windows network paths in `.env`, use forward slashes or escaped backslashes:
```env
FILE_STORE_PATH=//192.168.1.100/shared/eink
# or
FILE_STORE_PATH=C:/shared/eink
```

## Dependencies

- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Fast development server and build tool
- **Puppeteer**: Headless browser for image generation
- **html-to-image**: Alternative image generation (not currently used)

## License

MIT
