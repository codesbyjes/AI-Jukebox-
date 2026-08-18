/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14121A",
        canvas: "#FBFAF8",
        surface: "#FFFFFF",
        line: "#EAE7E1",
        muted: "#8B8578",
        // Stage accent colors — one per capability family (spec section 8)
        stage: {
          doc: "#3E6BFF", // document / PDF stages
          write: "#FF7A45", // writing / script stages
          audio: "#FF4D9E", // voice / audio stages
          video: "#8B5CF6", // video stages
          image: "#F5B700", // image stages
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
      },
      backgroundImage: {
        rainbow:
          "linear-gradient(90deg, #3E6BFF 0%, #8B5CF6 30%, #FF4D9E 55%, #FF7A45 78%, #F5B700 100%)",
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,18,26,0.04), 0 8px 24px rgba(20,18,26,0.06)",
        glow: "0 0 0 1px rgba(139,92,246,0.15), 0 8px 30px rgba(255,77,158,0.12)",
      },
      keyframes: {
        drift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        rise: {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        pulseRing: {
          "0%, 100%": { opacity: 0.5, transform: "scale(1)" },
          "50%": { opacity: 1, transform: "scale(1.03)" },
        },
      },
      animation: {
        drift: "drift 6s ease infinite",
        rise: "rise 0.5s ease both",
        pulseRing: "pulseRing 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
