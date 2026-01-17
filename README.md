# Three.js Project

A modern Three.js 3D visualization project featuring a rotating torus knot with texture mapping.

## Features

- 🎨 **Modern Three.js** - Latest version with WebGL rendering
- ⚡ **Vite** - Fast build tool and dev server
- 🧪 **Vitest** - Modern testing framework
- 📦 **ES6 Modules** - Modern JavaScript module system
- 🎯 **TypeScript Ready** - Easy to migrate if needed
- 🔧 **ESLint & Prettier** - Code quality and formatting

## Prerequisites

- Node.js 18+ and npm

## Installation

```bash
# Install dependencies
npm install
```

## Development

```bash
# Start development server (runs on http://localhost:9000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Testing

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## Project Structure

```
threejs/
├── app/
│   ├── css/
│   │   └── main.css          # Application styles
│   └── js/
│       ├── main.js           # Main application entry point
│       └── main.test.js      # Unit tests
├── textures/                 # Texture assets
├── dist/                     # Production build output (generated)
├── index.html                # HTML entry point
├── vite.config.js           # Vite configuration
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## What It Does

The application renders a 3D torus knot that continuously rotates. It features:

- **3D Scene**: Three.js scene with perspective camera
- **Torus Knot Geometry**: Complex 3D shape (200 radius, 60 tube radius)
- **Texture Mapping**: External texture loaded from Pexels
- **Lighting**: SpotLight with shadow casting enabled
- **Animation**: Smooth rotation on X and Y axes
- **Responsive**: Automatically adjusts to window resize

## Technologies Used

- **Three.js** - 3D graphics library
- **Vite** - Build tool and dev server
- **Vitest** - Unit testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Browser Support

Modern browsers with WebGL support:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run tests and linting
6. Submit a pull request
