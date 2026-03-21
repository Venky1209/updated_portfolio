# Venkatkaushal A — Portfolio

A world-class, production-ready personal portfolio built with **Next.js 14**, **GSAP**, **Three.js**, and **Tailwind CSS**.

## Features

- **Cinematic Intro Sequence** — Letter-by-letter name reveal with curtain wipe transition
- **Physical Lamp Toggle** — Pull-string dark/light mode switch with spring physics
- **Three.js Particle Field** — Interactive particle canvas on the hero section
- **Scroll-Driven Flip Cards** — Project cards that flip as you scroll (tap on mobile)
- **Embla Carousel** — Featured works carousel with snap navigation
- **Scroll Progress Line** — Vertical progress indicator with color-shifting dot
- **Magnetic Nav Links** — Links that subtly follow your cursor
- **Section Reveals** — Scroll-triggered entrance animations via GSAP ScrollTrigger
- **Lenis Smooth Scroll** — Physics-based smooth scrolling synced with GSAP
- **Full Responsiveness** — Mobile-first design with adaptive interactions
- **Accessibility** — Keyboard navigation, ARIA labels, reduced-motion support

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + CSS Custom Properties |
| Animation | GSAP + ScrollTrigger |
| 3D | Three.js |
| Smooth Scroll | Lenis |
| Carousel | Embla Carousel |
| Icons | Lucide React |
| Fonts | Local variable fonts (Geist) |

## Getting Started

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start
```

## Deploy to Vercel

```bash
npx vercel
```

Or connect this repository to [Vercel](https://vercel.com) for automatic deployments.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with metadata + theme script
│   ├── page.tsx            # Main page orchestrator
│   └── globals.css         # All styles + CSS custom properties
├── components/
│   ├── intro/              # Cinematic opening overlay
│   ├── lamp/               # Pull-string theme toggle
│   ├── hero/               # Hero section
│   ├── canvas/             # Three.js particle field
│   ├── navbar/             # Navigation with mobile overlay
│   ├── about/              # About + Education
│   ├── skills/             # Skills grid
│   ├── projects/           # Carousel + Flip grid
│   ├── experience/         # Timeline
│   ├── achievements/       # Achievement cards
│   ├── contact/            # Contact links
│   └── ui/                 # ScrollProgressLine, MagneticLink, SectionReveal, MarqueeTrack
├── hooks/
│   ├── useLenis.ts         # Smooth scroll + GSAP sync
│   ├── useTheme.ts         # Dark/light persistence
│   └── useReducedMotion.ts # Accessibility
├── data/
│   └── portfolio.ts        # All personal content
├── lib/
│   └── gsap.ts             # GSAP + ScrollTrigger registration
└── styles/
    └── variables.css        # CSS custom properties for theming
```

## License

MIT
