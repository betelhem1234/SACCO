/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./web/src/**/*.{html,ts}",
        "./libs/**/*.{html,ts}"
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#1e3a5f',
                    dark: '#0f2744',
                    light: '#2d5282',
                },
                accent: {
                    DEFAULT: '#10b981',
                    dark: '#059669',
                    light: '#34d399',
                }
            }
        },
    },
    plugins: [],
}
