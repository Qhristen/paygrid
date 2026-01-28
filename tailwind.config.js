/** @type {import('tailwindcss').Config} */
module.exports = {
  // Use a prefix to avoid name collisions with the host app
  // prefix: 'pg-',
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    // Disable preflight to prevent affecting global host app styles (h1, p, etc.)
    preflight: false,
  }
}
