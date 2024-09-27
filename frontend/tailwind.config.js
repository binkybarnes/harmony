/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          50: "#383a40",
          100: "#313338",
          200: "#2b2d31",
          300: "#232428",
          400: "#1e1f22",
        },
        content: {
          header: "#f2f3f5",
          normal: "#dbdee1",
          muted: {
            50: "#c4c5c7",
            100: "#949ba4",
          },
        },
        primary: "#f2a358",
        button: "#b5bac1",
        error: "#f23f42",
      },
    },
    fontFamily: {
      sans: ['"gg sans"'],
    },
  },
  // eslint-disable-next-line no-undef
  // plugins: [require("daisyui")],
  // daisyui: {
  //   themes: ["dark"],
  // },
};
