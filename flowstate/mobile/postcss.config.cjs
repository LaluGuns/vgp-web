// Flow mobile CSS pipeline. Kept explicit so Android bootstrap validates the same Tailwind authority.
module.exports = {
  plugins: {
    tailwindcss: { config: "./mobile/tailwind.config.ts" },
    autoprefixer: {},
  },
};
