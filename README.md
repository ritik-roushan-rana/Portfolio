# Ritik Roushan Rana — Developer Portfolio

A single-page developer portfolio built with Next.js (App Router), covering projects, skills, experience, and contact details. Ritik is a machine learning engineer (deep RL and computer vision) specialising in information security at VIT Vellore. The design is editorial and scroll-driven: a CSS-drawn sunset behind the hero, oversized display type in cream over a warm plum ground, and hot orange reserved for fills, glows and anything interactive.

## Live Demo

[ritikrana-me.vercel.app](https://ritikrana-me.vercel.app/) — deployed on [Vercel](https://vercel.com).

## Preview

![Portfolio Screenshot](./public/preview.png)

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, React 18)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/), over a token layer of CSS custom properties in `app/globals.css`
- **Scrolling**: [Lenis](https://lenis.darkroom.engineering/) for momentum smoothing
- **Icons**: [Lucide React](https://lucide.dev/)
- **Fonts**: [Geist Sans & Geist Mono](https://vercel.com/font) for interface and mono, [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) for display
- **Deployment**: [Vercel](https://vercel.com/)

Every animation is CSS transitions and keyframes driven by small `IntersectionObserver` or `requestAnimationFrame` hooks — there is no animation library dependency. Everything decorative is disabled under `prefers-reduced-motion`.

## Features

- A layered CSS sunset with drifting cloud bands behind the hero — gradients, not images
- A network mark (3 → 2 → 1, output node filled) used unframed as both the header logo and the hero symbol, with a signal running its edges
- A centred nameplate over a CSS sunset: name, role, calls to action and availability, and nothing else
- Counter preloader that wipes away in columns to uncover the hero
- Custom two-part pointer that enlarges and labels itself over anything interactive
- Masked line-by-line reveals on every headline
- A statement that lights up word by word as it crosses the viewport
- Projects as a dealt card deck on a pinned stage: cards behind sit narrower, higher and tinted, and scrolling deals the front one away
- Experience as a master–detail: every role listed on a timeline rail, the selected one opened beside it, each point led by a bold outcome. A real tablist with arrow-key navigation
- The toolkit as a 65% mechanical keyboard, seen from above: your tools fill the alpha positions, standard modifiers frame the rows (the last one in each row flexes so every row lands flush), coloured arrow accents, and an LED dot-matrix strip that idles on a colour field and scrolls the pressed tool's name in a 5×7 pixel font (`lib/pixel-font.js`, canvas). Click a cap or press its corner letter on a real keyboard. Physical keys only work while the board is in view and never while an input has focus
- A right-edge compass rail with scroll-spy, plus a retracting top bar
- Responsive from 320px up, and fully usable with reduced motion or on touch

## Project Structure

```
app/                 Next.js App Router entry
  layout.tsx         Root layout, fonts, and metadata
  page.tsx           Renders the Portfolio component
  globals.css        Design tokens, type scale, and all component styles
components/
  Portfolio.jsx      Page composition and all content data
  site/              One file per interaction:
                       SmoothScroll  Lenis host; publishes --scroll-v
                       Preloader     Opening counter and column wipe
                       Cursor        Dot + lagging ring pointer
                       Grain         Film-grain and vignette plates
                       TopBar        Retracting header with a live clock
                       Compass       Right-edge section rail with scroll-spy
                       Progress      Read-progress hairline
                       MaskText      Line-by-line mask reveal
                       Statement     Word-by-word scroll illumination
                       ProjectDeck   Pinned, scroll-dealt project card deck
                       Mark          The network logo, sized by its caller
                       Sky           CSS sunset behind the hero
                       CareerTabs    Master–detail experience tabs
                       StackKeyboard Toolkit as a typeable 3D keyboard
                       Reveal        Fade/slide entrance, optionally staggered
lib/
  smooth-scroll.ts   Shared Lenis handle for in-page jumps
  deck-layout.js     Pure geometry for the project deck (no React, no DOM)
public/
  projects/<slug>/   Screenshots per project, wired up in components/Portfolio.jsx
                     as a project's `shots: [{ src, label }]` array. The card
                     shows them as a swipeable gallery inside a device frame;
                     a project with no shots falls back to its wash and glyph.
  ...                Profile photo, preview image
```

## Getting Started

Requires Node.js 18.18 or newer.

```bash
# Clone the repository
git clone https://github.com/ritik-roushan-rana/Portfolio.git
cd Portfolio

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Contact

- Email: ritikrana8596@gmail.com
- GitHub: [@ritik-roushan-rana](https://github.com/ritik-roushan-rana?tab=repositories)
- LinkedIn: [Ritik Roushan Rana](https://www.linkedin.com/in/ritik-roushan-rana-b6a89528a/)
