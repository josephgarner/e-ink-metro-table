# Contributing to E-Ink Display System

Thank you for your interest in contributing to the E-Ink Display System!

## Project Structure

This is a monorepo containing two main packages:

```
Eink/
├── packages/
│   ├── image-generator/    # Node.js/TypeScript/React application
│   └── firmware/           # PlatformIO/C++ firmware for ESP32
├── README.md
├── SETUP.md
└── package.json
```

## Development Setup

1. **Fork and clone the repository**

2. **Install dependencies**:
```bash
npm install
```

3. **Set up the image generator**:
```bash
cd packages/image-generator
cp .env.example .env
npm run dev
```

4. **Set up the firmware**:
```bash
cd packages/firmware
# Edit src/config.h with your settings
pio run
```

## Making Changes

### Image Generator (Node.js/TypeScript)

1. **Create a new branch**:
```bash
git checkout -b feature/my-new-feature
```

2. **Make your changes**:
   - Add components in `packages/image-generator/src/components/`
   - Follow existing code style
   - Use TypeScript types

3. **Test your changes**:
```bash
npm run dev        # Preview in browser
npm run build      # Ensure it builds
npm run generate   # Test image generation
```

4. **Run type checking**:
```bash
npm run type-check
```

### Firmware (PlatformIO/C++)

1. **Make your changes** in `packages/firmware/src/`

2. **Test on hardware**:
```bash
pio run --target upload
pio device monitor
```

3. **Ensure clean build**:
```bash
pio run --target clean
pio run
```

## Code Style Guidelines

### TypeScript/React

- Use functional components with hooks
- Use TypeScript types (avoid `any`)
- Follow existing naming conventions
- Keep components focused and reusable
- Use CSS modules or separate CSS files

### C++/Arduino

- Follow Arduino coding style
- Use meaningful variable names
- Add comments for complex logic
- Keep functions focused
- Handle errors gracefully

## Creating Display Components

When creating new display components:

1. **Use the 6-color E-Ink palette**:
   - Black: `#000000`
   - White: `#FFFFFF`
   - Red: `#FF0000`
   - Yellow: `#FFFF00`
   - Blue: `#0000FF`
   - Green: `#00FF00`

2. **Keep layouts simple**: E-Ink displays work best with clear, high-contrast designs

3. **Test at actual size**: Always preview at 800×480 pixels

4. **Document your component**: Add comments explaining what it displays

## Pull Request Process

1. **Update documentation** if needed

2. **Test thoroughly**:
   - Image generator builds successfully
   - Components render correctly
   - Firmware compiles without errors
   - Hardware testing (if applicable)

3. **Create a pull request** with:
   - Clear description of changes
   - Screenshots (for UI changes)
   - Hardware testing results (for firmware changes)

4. **Address review feedback**

## Commit Message Guidelines

Use clear, descriptive commit messages:

```
feat: Add weather display component
fix: Resolve WiFi connection timeout issue
docs: Update setup instructions for Windows
refactor: Simplify image generation logic
```

Prefixes:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

## Adding New Features

### New Display Components

1. Create component in `packages/image-generator/src/components/`
2. Add to component selector in `App.tsx`
3. Document usage in component file
4. Add example screenshot to PR

### Firmware Features

1. Implement in `packages/firmware/src/`
2. Update `config.h` if new settings are needed
3. Test on actual hardware
4. Update firmware README with new features

## Testing

### Image Generator

- Visual testing in browser (`npm run dev`)
- Build testing (`npm run build`)
- Image generation testing (`npm run generate`)
- Cross-browser testing (Chrome, Firefox, Safari)

### Firmware

- Serial monitor output verification
- WiFi connection testing
- Image download testing
- Power consumption testing (for power-related changes)
- Display update testing

## Documentation

Update documentation when:
- Adding new features
- Changing configuration options
- Modifying setup process
- Adding dependencies

Files to update:
- `README.md` - High-level overview
- `SETUP.md` - Setup instructions
- Package-specific READMEs
- Code comments

## Questions?

- Check existing issues for similar questions
- Review the documentation
- Ask in the pull request or issue

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Thank You!

Your contributions help make this project better for everyone!
