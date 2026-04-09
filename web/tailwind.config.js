/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', 'system-ui', 'sans-serif'],
            },
            colors: {
                /* Moonhem palette: dark neutrals + gold/amber (see index.css :root) */
                green: {
                    900: '#262626',
                    700: '#383838',
                    500: '#fab23d',
                },
                gold: '#ffc812',
                cream: '#fafafa',
                muted: '#5c5c5c',
            },
        },
    },
    plugins: [],
}