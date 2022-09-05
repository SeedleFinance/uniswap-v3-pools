module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: "class",
  theme: {
    container: {
      screens: {
        sm: "600px",
        md: "728px",
        lg: "984px",
        xl: "1200px",
        "2xl": "1320px",
      },
    },
    extend: {
      /* default theme */
      textColor: {
        high: "var(--color-text-high)",
        medium: "var(--color-text-medium)",
        low: "var(--color-text-low)",
        inverted: "var(--color-text-inverted)",
        white: "var(--color-text-white)",
        black: "var(--color-text-black)",

        /* dark theme */
        dark: {
          high: "var(--color-text-high)",
          medium: "var(--color-text-medium)",
          low: "var(--color-text-low)",
          inverted: "var(--color-text-inverted)",
          white: "var(--color-text-white)",
          black: "var(--color-text-black)",
        },
      },

      /* default theme */
      backgroundColor: {
        "surface-0": "var(--color-surface-0)",
        "surface-05": "var(--color-surface-05)",
        "surface-10": "var(--color-surface-10)",
        "surface-20": "var(--color-surface-20)",
        "surface-30": "var(--color-surface-30)",
        "surface-40": "var(--color-surface-40)",
        "surface-50": "var(--color-surface-50)",
        "surface-60": "var(--color-surface-60)",
        "surface-70": "var(--color-surface-70)",
        "surface-80": "var(--color-surface-80)",
        "surface-90": "var(--color-surface-90)",

        "canvas-light": "var(--color-canvas-light)",

        "brand-primary": "var(--color-brand-primary)",
        "brand-light": "var(--color-brand-light)",

        /* dark theme */
        dark: {
          "surface-0": "var(--color-surface-0)",
          "surface-05": "var(--color-surface-05)",
          "surface-10": "var(--color-surface-10)",
          "surface-20": "var(--color-surface-20)",
          "surface-30": "var(--color-surface-30)",
          "surface-40": "var(--color-surface-40)",
          "surface-50": "var(--color-surface-50)",
          "surface-60": "var(--color-surface-60)",
          "surface-70": "var(--color-surface-70)",
          "surface-80": "var(--color-surface-80)",
          "surface-90": "var(--color-surface-90)",

          "canvas-light": "var(--color-canvas-light)",

          "brand-primary": "var(--color-brand-primary)",
          "brand-light": "var(--color-brand-light)",
        },
      },
      colors: {
        white: "var(--color-white)",
        black: "var(--color-black)",

        brand: {
          primary: "var(--color-brand-primary)",
          dark: "var(--color-brand-dark)",
          light: "var(--color-brand-light)",

          dark: {
            primary: "var(--color-brand-primary)",
            dark: "var(--color-brand-dark)",
            light: "var(--color-brand-light)",
          },
        },
        pink: {
          dark: "var(--color-pink-dark)",
          light: "var(--color-pink-light)",
        },
        purple: {
          dark: "var(--color-purple-dark)",
          light: "var(--color-purple-light)",
        },
        purple: {
          dark: "var(--color-purple-dark)",
          light: "var(--color-purple-light)",
        },
        blue: {
          primary: "var(--color-blue-primary)",
          light: "var(--color-blue-light)",

          dark: {
            primary: "var(--color-blue-primary)",
            light: "var(--color-blue-light)",
          },
        },
        surface: {
          0: "var(--color-surface-0)",
          5: "var(--color-surface-05)",
          10: "var(--color-surface-10)",
          20: "var(--color-surface-20)",
          30: "var(--color-surface-30)",
          40: "var(--color-surface-40)",
          50: "var(--color-surface-50)",
          60: "var(--color-surface-60)",
          70: "var(--color-surface-70)",
          80: "var(--color-surface-80)",
          90: "var(--color-surface-90)",
          dark: {
            0: "var(--color-surface-0)",
            5: "var(--color-surface-05)",
            10: "var(--color-surface-10)",
            20: "var(--color-surface-20)",
            30: "var(--color-surface-30)",
            40: "var(--color-surface-40)",
            50: "var(--color-surface-50)",
            60: "var(--color-surface-60)",
            70: "var(--color-surface-70)",
            80: "var(--color-surface-80)",
            90: "var(--color-surface-90)",
          },
        },

        element: {
          0: "var(--color-element-0)",
          10: "var(--color-element-10)",
          20: "var(--color-element-20)",
          30: "var(--color-element-30)",
          40: "var(--color-element-40)",
          50: "var(--color-element-50)",
          60: "var(--color-element-60)",
        },
      },
    },
    fontFamily: {
      sans: "Inter, system-ui, sans-serif",
      monospace: "Menlo, monospace",
    },
    fontSize: {
      0.5: "0.5rem", // 8px
      0.625: "0.625rem", // 10px
      0.6875: "0.6875rem", // 11px
      0.75: "0.75rem", // 12px
      0.8125: "0.8125rem", // 13px
      0.875: "0.875rem", // 14px
      0.9375: "0.9375rem", // 15px
      1: "1rem", // 16px
      1.125: "1.125rem", // 18px
      1.25: "1.25rem", // 20px
      1.5: "1.5rem", // 24px
      1.75: "1.75rem", // 28px
      2: "2rem", // 32px
      2.125: "2.125rem", // 34px
      2.25: "2.25rem", // 36px
      2.5: "2.5rem", // 40px
      2.75: "2.75rem", // 44px

      /* heading sizes */
      3: "3rem", // 48px
      3.375: "3.375rem", // 56px
      4.75: "4.5rem", // 72px
    },
    boxShadow: {
      lg: "0px 4px 8px rgba(0, 0, 0, 0.25)",
      md: "0px 2px 14px 0px rgba(60, 63, 66, 0.12)",
      sm: "0px 4px 44px rgba(60, 63, 66, 0.14)",
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
