# PlayHub

A modern, minimalistic web application showcasing classic games with clean design and smooth user experience.

## Table of Contents

-   [Features](#features)
-   [Demo](#demo)
-   [Tech Stack](#tech-stack)
-   [Getting Started](#getting-started)
-   [Project Structure](#project-structure)
-   [Available Games](#available-games)
-   [Development](#development)
-   [Acknowledgments](#acknowledgments)

## Features

-   **Modern Design System**: Clean, minimalistic interface with glass-morphism effects
-   **Theme Support**: Dark/light mode with system preference detection
-   **Responsive Layout**: Optimized for mobile, tablet, and desktop devices
-   **Game History**: Track progress and view game statistics
-   **Smooth Animations**: Enhanced UX with hover effects and transitions
-   **Accessibility**: Keyboard navigation and screen reader support
-   **Performance**: Optimized loading and rendering
-   **Category Filtering**: Filter games by classic, arcade, or strategy

## Demo

Visit the live application: [Live Demo](https://playhub.snickersluring.com)

## Tech Stack

**Frontend**

-   Next.js 15.4.6 - React framework with App Router
-   React 19.1.0 - UI library
-   JavaScript - Primary language

**Styling & UI**

-   Tailwind CSS v4 - Utility-first CSS framework
-   shadcn/ui - Built with Radix UI primitives
-   Lucide React 0.539.0 - Modern icon library
-   class-variance-authority 0.7.1 - Component variants
-   tailwind-merge 3.3.1 - Conditional class merging
-   clsx 2.1.1 - Utility for constructing className strings

**Theme & State**

-   next-themes 0.4.6 - Dark/light theme management
-   React hooks - State management

**Development Tools**

-   ESLint 9 - Code linting with Next.js config
-   Tailwind PostCSS 4 - CSS processing
-   tw-animate-css 1.3.6 - Animation utilities

## Getting Started

### Prerequisites

Ensure you have the following installed:

-   Node.js (v20 or higher)
-   npm (comes with Node.js) or yarn (v1.22 or higher)
-   Git - For cloning the repository

### Installation

1. Clone the repository

```bash
git clone https://github.com/your-username/playhub.git
cd playhub
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Start the development server

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
playhub/
├── public/                      # Static files
│   ├── next.svg
│   └── favicon.ico
├── src/
│   ├── app/                     # App Router pages
│   │   ├── globals.css          # Global styles
│   │   ├── layout.js            # Root layout
│   │   ├── page.js              # Home page
│   │   ├── space-invaders/      # Game routes
│   │   │   └── page.js
│   │   ├── rock-paper-scissors/
│   │   │   └── page.js
│   │   ├── pong/
│   │   │   └── page.js
│   │   ├── tic-tac-toe/
│   │   │   └── page.js
│   │   └── snake/
│   │       └── page.js
│   ├── components/              # React components
│   │   ├── space-invaders.jsx
│   │   ├── rock-paper-scissors.jsx
│   │   ├── pong.jsx
│   │   ├── tic-tac-toe.jsx
│   │   ├── snake.jsx
│   │   ├── theme-provider.jsx
│   │   ├── theme-toggle.jsx
│   │   └── ui/                  # Reusable UI components
│   │       ├── button.jsx
│   │       └── card.jsx
│   └── lib/
│       └── utils.js             # Utility functions
├── components.json              # shadcn/ui config
├── next.config.mjs             # Next.js configuration
├── postcss.config.mjs          # PostCSS configuration
├── package.json
└── README.md
```

## Available Games

### Space Invaders
-   **Type**: Arcade Shooter
-   **Players**: 1
-   **Duration**: 10-20 minutes
-   **Difficulty**: Hard
-   **Features**: Power-ups, progressive difficulty, classic arcade gameplay

### Rock Paper Scissors
-   **Type**: Strategy/Chance
-   **Players**: 1 (vs Computer)
-   **Duration**: 2-5 minutes
-   **Difficulty**: Easy
-   **Features**: Game history, win/loss tracking

### Pong
-   **Type**: Arcade Tennis
-   **Players**: 1
-   **Duration**: 3-8 minutes
-   **Difficulty**: Medium
-   **Features**: Classic paddle gameplay, skill-based scoring

### Tic Tac Toe
-   **Type**: Strategy
-   **Players**: 1-2
-   **Duration**: 1-3 minutes
-   **Difficulty**: Easy
-   **Features**: AI opponent, local multiplayer

### Snake
-   **Type**: Arcade
-   **Players**: 1
-   **Duration**: 5-15 minutes
-   **Difficulty**: Medium
-   **Features**: Growing snake mechanics, wall collision detection

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Create production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Adding New Games

1. **Create the game page**

    ```bash
    mkdir src/app/new-game
    touch src/app/new-game/page.js
    ```

2. **Create the game component**

    ```bash
    touch src/components/new-game.jsx
    ```

3. **Update the games array**
   Add your game to the `games` array in `src/app/page.js`:

    ```javascript
    {
      id: "new-game",
      title: "New Game",
      description: "Game description",
      icon: GameIcon,
      gradient: "from-[#color1] to-[#color2]",
      players: "1 Player",
      duration: "5-10 min",
      difficulty: "Medium",
      status: "available",
      href: "/new-game",
      category: "arcade"
    }
    ```

4. **Implement game logic**
   Follow existing patterns for state management and UI consistency

## Acknowledgments

-   [Next.js](https://nextjs.org/) - React framework
-   [Tailwind CSS](https://tailwindcss.com/) - CSS framework
-   [shadcn/ui](https://ui.shadcn.com/) - Component library
-   [Lucide](https://lucide.dev/) - Icon library

---

**Built with modern web technologies for optimal performance and user experience.**
