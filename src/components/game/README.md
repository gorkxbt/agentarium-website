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

- Realistic NPC behaviors:
  - Vehicles follow roads and lane rules
  - Cars park in designated parking areas
  - NPCs gather at points of interest
  - NPCs show different behaviors (walking, sitting, talking, shopping)
  - Group behaviors and activities at specific locations

## Technical Architecture

The simulation uses React Three Fiber (R3F) and Three.js for 3D rendering, with components organized as follows:

- `ClientGameScene.tsx` - The main 3D scene component with Canvas wrapper and error boundary
- `SceneContent` - The inner content that goes inside the Canvas (all R3F hooks must be used here)
- `City` - Contains all buildings, agents, vehicles, and NPCs
- `Agent` - Represents AI agents with autonomous behavior and location-based interactions
- `Building` - Different types of buildings with specialized rendering based on type
- `Vehicle` - Autonomous vehicles that navigate the city roads with realistic behaviors
- `NPC` - Non-player characters that walk around the city with various activities

## Running the Simulation

To run the simulation:

1. Navigate to the project root directory
2. Use one of the following methods:
   - Double-click the `start-dev.bat` file (Windows CMD)
   - Right-click the `start-dev.ps1` file and select "Run with PowerShell" (Windows PowerShell)
   - From the terminal, run `npm run dev`
3. Open a browser at http://localhost:3000

## Troubleshooting

If you encounter any issues with the 3D rendering:

1. Ensure you have WebGL support in your browser
2. Check the browser console for specific errors
3. The simulation includes fallback components that will display if Three.js fails to initialize

If the welcome screen appears but doesn't go away:
- Click the "Enter City Simulation" button to manually dismiss it
- Check for any JavaScript errors in the browser console

## Vehicle and NPC Behaviors

The simulation now features much more realistic behaviors:

### Vehicles:
- Cars stay on roads and follow proper lanes
- Some vehicles park in designated parking areas
- Parked vehicles will stay parked for a period before rejoining traffic
- Vehicles use appropriate speeds and turning behaviors at intersections

### NPCs (Pedestrians):
- Walk on sidewalks and avoid walking into buildings
- Gather at points of interest like restaurant outdoor seating
- Perform appropriate activities based on location (sitting at benches, shopping at stores)
- Show animated behaviors like talking, shopping, and sitting
- Some NPCs act in groups, either as leaders or followers

## Future Enhancements

Planned improvements include:

- Additional agent jobs and interaction types
- More sophisticated traffic system
- Interior scenes for buildings
- Weather effects
- Day/night cycle with dynamic lighting 