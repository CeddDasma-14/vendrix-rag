/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      typography: {
        invert: {
          css: {
            "--tw-prose-body": "#cbd5e1",
            "--tw-prose-headings": "#f1f5f9",
            "--tw-prose-bold": "#f1f5f9",
            "--tw-prose-bullets": "#6366f1",
            "--tw-prose-hr": "#334155",
            "--tw-prose-code": "#a5b4fc",
          },
        },
      },
    },
  },
  plugins: [],
};
