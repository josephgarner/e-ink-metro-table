import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        // Game Boy-inspired pixel art palette (perfect for 6-color E-Ink)
        pixel: {
          // Core Game Boy greens
          darkest: { value: '#0F380F' }, // Darkest shade - black equivalent
          dark: { value: '#306230' }, // Dark green - shadows
          light: { value: '#8BAC0F' }, // Light green - main color
          lightest: { value: '#9BBC0F' }, // Lightest green - highlights
          background: { value: '#E0F8CF' }, // Off-white background

          // Additional retro colors for accents (optimized for E-Ink)
          blue: { value: '#5B6EE1' }, // Retro blue
          red: { value: '#AC3232' }, // Muted red
          yellow: { value: '#D9A066' }, // Retro yellow
          purple: { value: '#847E87' }, // Muted purple
          cyan: { value: '#63C74D' }, // Retro cyan
        },
      },
      fonts: {
        heading: { value: "'Jersey 10', 'Press Start 2P', 'Courier New', monospace" },
        body: { value: "'Jersey 10', 'Press Start 2P', 'Courier New', monospace" },
      },
      fontSizes: {
        // Smaller sizes for pixel font readability
        '2xs': { value: '0.625rem' }, // 10px
        xs: { value: '0.75rem' }, // 12px
        sm: { value: '0.875rem' }, // 14px
        md: { value: '1rem' }, // 16px
        lg: { value: '1.125rem' }, // 18px
        xl: { value: '1.25rem' }, // 20px
        '2xl': { value: '1.5rem' }, // 24px
      },
      shadows: {
        // Inset shadows for 3D button effect (retro game UI style)
        pixel: {
          inset: { value: 'inset -2px -2px 0px 0px #306230, inset 2px 2px 0px 0px #9BBC0F' },
          insetDark: { value: 'inset -2px -2px 0px 0px #0F380F, inset 2px 2px 0px 0px #306230' },
          insetLight: { value: 'inset -2px -2px 0px 0px #306230, inset 2px 2px 0px 0px #E0F8CF' },
          // Small drop shadows for depth
          drop: { value: '2px 2px 0px 0px #0F380F' },
          dropLarge: { value: '4px 4px 0px 0px #0F380F' },
        },
      },
      radii: {
        // No border radius for pixel-perfect edges
        pixel: { value: '0px' },
      },
      borders: {
        // Thinner borders for pixel art (2px instead of 4px)
        pixel: { value: '2px solid #0F380F' },
        pixelThick: { value: '3px solid #0F380F' },
      },
      spacing: {
        // Tighter spacing for compact pixel UI
        pixel: {
          xs: { value: '0.25rem' }, // 4px
          sm: { value: '0.5rem' }, // 8px
          md: { value: '0.75rem' }, // 12px
          lg: { value: '1rem' }, // 16px
          xl: { value: '1.5rem' }, // 24px
        },
      },
    },
    semanticTokens: {
      colors: {
        // Semantic color mappings for pixel theme
        bg: {
          DEFAULT: { value: '{colors.pixel.background}' },
          emphasis: { value: '{colors.pixel.light}' },
          subtle: { value: '{colors.pixel.lightest}' },
          dark: { value: '{colors.pixel.dark}' },
        },
        fg: {
          DEFAULT: { value: '{colors.pixel.darkest}' },
          emphasis: { value: '{colors.pixel.dark}' },
          muted: { value: '{colors.pixel.light}' },
          light: { value: '{colors.pixel.lightest}' },
        },
        border: {
          DEFAULT: { value: '{colors.pixel.darkest}' },
          emphasis: { value: '{colors.pixel.dark}' },
        },
      },
    },
    recipes: {
      button: {
        base: {
          fontWeight: 'normal',
          textTransform: 'uppercase',
          border: '{borders.pixel}',
          borderRadius: '0',
          fontSize: 'xs',
          transition: 'none',
          imageRendering: 'pixelated',
          _hover: {
            transform: 'translate(1px, 1px)',
            boxShadow: '{shadows.pixel.drop}',
          },
          _active: {
            transform: 'translate(2px, 2px)',
            boxShadow: 'none',
          },
        },
        variants: {
          solid: {
            bg: '{colors.pixel.light}',
            color: '{colors.pixel.darkest}',
            boxShadow: '{shadows.pixel.inset}',
          },
          dark: {
            bg: '{colors.pixel.dark}',
            color: '{colors.pixel.lightest}',
            boxShadow: '{shadows.pixel.insetDark}',
          },
          light: {
            bg: '{colors.pixel.lightest}',
            color: '{colors.pixel.darkest}',
            boxShadow: '{shadows.pixel.insetLight}',
          },
          outline: {
            bg: '{colors.pixel.background}',
            color: '{colors.pixel.darkest}',
            borderColor: '{colors.pixel.darkest}',
          },
        },
        defaultVariants: {
          variant: 'solid',
        },
      },
      card: {
        base: {
          border: '{borders.pixel}',
          borderRadius: '0',
          boxShadow: '{shadows.pixel.inset}',
          bg: '{colors.pixel.light}',
          imageRendering: 'pixelated',
        },
        variants: {
          elevated: {
            boxShadow: '{shadows.pixel.dropLarge}',
            border: '{borders.pixelThick}',
          },
          inset: {
            boxShadow: '{shadows.pixel.inset}',
          },
          dark: {
            bg: '{colors.pixel.dark}',
            color: '{colors.pixel.lightest}',
            boxShadow: '{shadows.pixel.insetDark}',
          },
        },
        defaultVariants: {
          variant: 'inset',
        },
      },
      input: {
        base: {
          border: '{borders.pixel}',
          borderRadius: '0',
          fontWeight: 'normal',
          fontSize: 'xs',
          imageRendering: 'pixelated',
          _focus: {
            outline: 'none',
            boxShadow: '{shadows.pixel.insetDark}',
          },
        },
      },
      select: {
        base: {
          border: '{borders.pixel}',
          borderRadius: '0',
          fontWeight: 'normal',
          fontSize: 'xs',
          bg: '{colors.pixel.background}',
          imageRendering: 'pixelated',
          _focus: {
            outline: 'none',
            boxShadow: '{shadows.pixel.drop}',
          },
        },
      },
      heading: {
        base: {
          fontWeight: 'normal',
          textTransform: 'uppercase',
          letterSpacing: 'normal',
          imageRendering: 'pixelated',
        },
      },
      text: {
        base: {
          imageRendering: 'pixelated',
          fontWeight: 'normal',
        },
      },
    },
    globalCss: {
      '*': {
        imageRendering: 'pixelated',
        WebkitFontSmoothing: 'none',
        MozOsxFontSmoothing: 'grayscale',
      },
      'html, body': {
        fontFamily: '{fonts.body}',
        bg: '{colors.pixel.background}',
        color: '{colors.pixel.darkest}',
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
