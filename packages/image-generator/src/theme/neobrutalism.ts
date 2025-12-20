import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        // Neobrutalism color palette optimized for 6-color E-Ink
        brutal: {
          black: { value: "#000000" },
          white: { value: "#FFFFFF" },
          red: { value: "#FF0000" },
          yellow: { value: "#FFFF00" },
          blue: { value: "#0000FF" },
          green: { value: "#00FF00" },
          // Additional bright colors for accents
          pink: { value: "#FF69B4" },
          orange: { value: "#FF6B00" },
          purple: { value: "#8B00FF" },
          cyan: { value: "#00FFFF" },
        },
      },
      fonts: {
        heading: { value: "'Inter', -apple-system, system-ui, sans-serif" },
        body: { value: "'Inter', -apple-system, system-ui, sans-serif" },
      },
      shadows: {
        // Hard shadows with no blur - core neobrutalism feature
        brutal: {
          sm: { value: "3px 3px 0px 0px rgba(0, 0, 0, 1)" },
          md: { value: "5px 5px 0px 0px rgba(0, 0, 0, 1)" },
          lg: { value: "8px 8px 0px 0px rgba(0, 0, 0, 1)" },
          xl: { value: "12px 12px 0px 0px rgba(0, 0, 0, 1)" },
        },
      },
      radii: {
        // Minimal border radius for sharp, brutal aesthetic
        brutal: { value: "0px" },
      },
      borders: {
        // Thick borders
        brutal: { value: "4px solid black" },
        brutalThick: { value: "6px solid black" },
      },
    },
    semanticTokens: {
      colors: {
        // Semantic color mappings
        bg: {
          DEFAULT: { value: "{colors.brutal.white}" },
          emphasis: { value: "{colors.brutal.yellow}" },
          subtle: { value: "{colors.brutal.white}" },
        },
        fg: {
          DEFAULT: { value: "{colors.brutal.black}" },
          emphasis: { value: "{colors.brutal.black}" },
        },
        border: {
          DEFAULT: { value: "{colors.brutal.black}" },
          emphasis: { value: "{colors.brutal.black}" },
        },
      },
    },
    recipes: {
      button: {
        base: {
          fontWeight: "bold",
          textTransform: "uppercase",
          border: "4px solid black",
          borderRadius: "0",
          transition: "all 0.1s",
          _hover: {
            transform: "translate(-2px, -2px)",
            boxShadow: "{shadows.brutal.md}",
          },
          _active: {
            transform: "translate(2px, 2px)",
            boxShadow: "none",
          },
        },
        variants: {
          solid: {
            bg: "{colors.brutal.yellow}",
            color: "{colors.brutal.black}",
            boxShadow: "{shadows.brutal.sm}",
          },
          red: {
            bg: "{colors.brutal.red}",
            color: "{colors.brutal.white}",
            boxShadow: "{shadows.brutal.sm}",
          },
          blue: {
            bg: "{colors.brutal.blue}",
            color: "{colors.brutal.white}",
            boxShadow: "{shadows.brutal.sm}",
          },
          green: {
            bg: "{colors.brutal.green}",
            color: "{colors.brutal.black}",
            boxShadow: "{shadows.brutal.sm}",
          },
          outline: {
            bg: "{colors.brutal.white}",
            color: "{colors.brutal.black}",
            borderColor: "{colors.brutal.black}",
            boxShadow: "{shadows.brutal.sm}",
          },
        },
        defaultVariants: {
          variant: "solid",
        },
      },
      card: {
        base: {
          border: "{borders.brutal}",
          borderRadius: "0",
          boxShadow: "{shadows.brutal.lg}",
          bg: "{colors.brutal.white}",
        },
        variants: {
          elevated: {
            boxShadow: "{shadows.brutal.xl}",
            border: "{borders.brutalThick}",
          },
          outline: {
            boxShadow: "{shadows.brutal.md}",
          },
          colored: {
            bg: "{colors.brutal.yellow}",
            boxShadow: "{shadows.brutal.lg}",
          },
        },
        defaultVariants: {
          variant: "outline",
        },
      },
      input: {
        base: {
          border: "{borders.brutal}",
          borderRadius: "0",
          fontWeight: "medium",
          _focus: {
            outline: "none",
            boxShadow: "{shadows.brutal.sm}",
            transform: "translate(-2px, -2px)",
          },
        },
      },
      select: {
        base: {
          border: "{borders.brutal}",
          borderRadius: "0",
          fontWeight: "bold",
          bg: "{colors.brutal.white}",
          _focus: {
            outline: "none",
            boxShadow: "{shadows.brutal.sm}",
          },
        },
      },
      heading: {
        base: {
          fontWeight: "black",
          textTransform: "uppercase",
          letterSpacing: "tight",
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
