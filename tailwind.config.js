/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'gpt-dark': '#343541',
                'gpt-sidebar': '#202123',
                'gpt-user': '#343541',
                'gpt-ai': '#444654',
                'gpt-input': '#40414F',
            },
        },
    },
    plugins: [],
}
