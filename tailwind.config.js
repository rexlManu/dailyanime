module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html", "./src/App.js"],
  darkMode: false, // or 'media' or 'class'
  mode: "jit",
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [require("tailwind-scrollbar")],
};
