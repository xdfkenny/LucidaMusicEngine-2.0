import type { Config } from "tailwindcss";

export default {
    content: [
        "./components/**/*.{js,vue,ts}",
        "./layouts/**/*.vue",
        "./pages/**/*.vue",
        "./plugins/**/*.{js,ts}",
        "./app.vue",
    ],
    theme: {
        extend: {
            colors: {
                base: "#0B1220",
                panel: "#121C2F",
                surface: "#0f1a2e",
                "surface-2": "#0a1020",
                line: "rgba(199,210,254,0.10)",
                accent: "#4F7CFF",
                "accent-2": "#67E8F9",
                glow: "#c7d2fe",
                muted: "#7a92bc",
                text: "#e6edf9",
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                mono: ["JetBrains Mono", "Fira Code", "monospace"],
            },
            keyframes: {
                fadeSlideUp: {
                    "0%": { opacity: "0", transform: "translateY(10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                slideInRight: {
                    "0%": { opacity: "0", transform: "translateX(32px)" },
                    "100%": { opacity: "1", transform: "translateX(0)" },
                },
                slideInLog: {
                    "0%": { opacity: "0", transform: "translateX(-8px)" },
                    "100%": { opacity: "1", transform: "translateX(0)" },
                },
                pipelinePulse: {
                    "0%, 100%": { boxShadow: "0 0 0 0 rgba(79,124,255,0)" },
                    "50%": { boxShadow: "0 0 0 6px rgba(79,124,255,0.25)" },
                },
                cardGlow: {
                    "0%, 100%": { borderColor: "rgba(79,124,255,0.3)" },
                    "50%": { borderColor: "rgba(79,124,255,0.7)" },
                },
                pulse: {
                    "0%, 100%": { opacity: "1" },
                    "50%": { opacity: "0.4" },
                },
            },
            animation: {
                "fade-up": "fadeSlideUp 0.4s ease both",
                "slide-right": "slideInRight 0.35s ease both",
                "slide-log": "slideInLog 0.25s ease both",
                "pipeline-pulse": "pipelinePulse 2s ease-in-out infinite",
                "card-glow": "cardGlow 2s ease-in-out infinite",
                pulse: "pulse 2s ease-in-out infinite",
            },
        },
    },
    plugins: [],
} satisfies Config;
