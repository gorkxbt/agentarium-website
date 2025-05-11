# Enhanced Agentarium 3D City Simulation

This directory contains the 3D city simulation components for the Agentarium website.

## Features

The simulation has been enhanced with the following features:

- Larger, more realistic city layout with expanded city size
- Additional buildings:
  - Pulse Nightclub - Entertainment venue with neon lights and spotlights
  - Shopping Mall - Large retail center with glass front
  - Fine Dining Restaurant - High-end eatery with outdoor seating
  - City Hospital - Healthcare facility with emergency entrance
  - Factory - Industrial building with active chimney
  - Lucky Star Casino - Gaming venue with decorative lights
  
- Improved agent interactions:
  - Role-specific earnings multipliers (1.8x-2.6x) at specialized locations
  - Location-based earnings bonuses at certain buildings
  - More sophisticated economic simulation
  - 15 AI agents (previously 10) with unique roles and specializations

- Enhanced visuals:
  - More detailed building designs
  - Additional vehicles and pedestrians
  - Improved night and day cycle effects

## Technical Architecture

The simulation uses React Three Fiber (R3F) and Three.js for 3D rendering, with components organized as follows:

- `ClientGameScene.tsx` - The main 3D scene component with Canvas wrapper and error boundary
- `SceneContent` - The inner content that goes inside the Canvas (all R3F hooks must be used here)
- `City` - Contains all buildings, agents, vehicles, and NPCs
- `Agent` - Represents AI agents with autonomous behavior and location-based interactions
- `Building` - Different types of buildings with specialized rendering based on type
- `Vehicle` - Autonomous vehicles that navigate the city roads
- `NPC` - Non-player characters that walk around the city

## Running the Simulation

To run the simulation:

1. Navigate to the project root directory
2. Run `npm run dev` or use the `start-dev.bat` file
3. Open a browser at http://localhost:3000

## Troubleshooting

If you encounter any issues with the 3D rendering:

1. Ensure you have WebGL support in your browser
2. Check the browser console for specific errors
3. The simulation includes fallback components that will display if Three.js fails to initialize

## Future Enhancements

Planned improvements include:

- Additional agent jobs and interaction types
- More sophisticated traffic system
- Interior scenes for buildings
- Weather effects
- Day/night cycle with dynamic lighting 