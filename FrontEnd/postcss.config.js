module.exports = {
  plugins: {
    'postcss-import': {},
    'tailwindcss/nesting': {},
    tailwindcss: { config: './src/theme/tailwind.config.js' },
    autoprefixer: {}
  }
};
