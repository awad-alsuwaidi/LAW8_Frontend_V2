/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: "",
  // mode: "jit",
  important: false,
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        "fade-in-down": {
          "0%": {
            opacity: "0",
            transform: "translateY(-10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-out-down": {
          from: {
            opacity: "1",
            transform: "translateY(0px)",
          },
          to: {
            opacity: "0",
            transform: "translateY(10px)",
          },
        },
        "fade-in-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-out-up": {
          from: {
            opacity: "1",
            transform: "translateY(0px)",
          },
          to: {
            opacity: "0",
            transform: "translateY(10px)",
          },
        },
      },
      animation: {
        wiggle: "wiggle 1s ease-in-out infinite",
        "fade-in-down": "fade-in-down 0.3s ease-out",
        "fade-out-down": "fade-out-down 0.3s ease-out",
        "fade-in-up": "fade-in-up 0.3s ease-out",
        "fade-out-up": "fade-out-up 0.3s ease-out",
      },
      boxShadow: {
          custom:'0px 2px 4px -1px rgba(0, 0, 0, 0.02)'
      },

      colors: {
        primary:'var(--primary)',
        yaleBlue:'var(--yale-blue)',
        borderPrimary:'var(--border-primary)',
        textSecondary:'var(--text-secondary)',
        textErrorPrimary:'var(--text-error-primary)',
        textErrorBase:'var(--text-error-base-500)',
        borderErrorSubtle:'var(--border-error_subtle)',
        textTertairy:'var(--text-tertairy)',
        textConfirmTitle:'var(--text-confirm-title)',
        dividerColor:'var(--divider-color)',
        bgColor:'var(--bg-color)',
        successBase500:'var(--success-base-500)',
        greyScale100:'var(--greyscale100)',
        greyScale300:'var(--grey-scale-300)',
        blue200:'var(--blue-200)',
        grey50:'var(--grey-50)',
        grey100:'var(--grey-100)',
        grey200:'var(--grey-200)',
        grey400:'var(--grey-400)',
        grey500:'var(--grey-500)',
        grey1000:'var(--grey-1000)',
        blue25:'var(--blue-25)',
        blue50:'var(--blue-50)',
        blue600:'var(--blue-600)',
        textSecondaryHover:'var(--text-secondary-hover)',
        colorsTextTextPrimary:'var(--colors-text-text-primary-900)',
        success50:'var(--success-50)',
        success600:'var(--success-600)',
        alert50:'var(--alert-50)',
        alert600:'var(--alert-600)',
        error50:'var(--error-50)',
        greyscale600:'var(--greyscale-600)',
        surfaceLevel2:'var(--surface-level-2)',
        blue700:'var(--blue-700)',
        success700:'var(--success-700)',
        success800:'var(--success-800)',
        success200:'var(--success-200)',
        alert500:'var(--alert-500)',
        alert300:'var(--alert-300)',
        success400:'var(--success-400)',
      },
      screens: {
        xs: "344px",
      },
      spacing: {
      },
      borderWidth: {
      },
      borderRadius: {
      },
      lineHeight: {
      },
      fontSize: {
      },
    },
    fontFamily: {
      poppins: ["Poppins", "system-ui", "sans-serif"],
      Kufi: ["Noto Kufi Arabic", "sans-serif"],
      STC: ["STC", "sans-serif"],
      sfProDisplay: ["SF Pro Display", "sans-serif"],
      Manrope: ["Manrope", "sans-serif"],
      iconFont: "icomoon",
    },
    container: {
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "4rem",
        xl: "5rem",
        "2xl": "6rem",
      },
    },
  },
  variants: {
    extend: {},
    scrollbar: ["dark", "rounded"],
  },
  plugins: [require("tailwind-scrollbar")],
};
