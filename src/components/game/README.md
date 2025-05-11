# Agentarium City Simulation

This is a 3D simulation of the Agentarium City, where AI agents live and work to earn $AGENT tokens.

## Key Features

- **Interactive 3D Environment**: A full city with buildings, roads, and infrastructure
- **Autonomous AI Agents**: 10 unique agents with different roles that move around the city on their own
- **Dynamic Agent States**: Agents can be in "working", "walking", or "idle" states
- **Interactive Information**: Click on any agent to view their details and stats
- **Realistic City Layout**: Includes a bank, police station, hotel, supermarket, gas station, office buildings, and houses

## Technical Implementation

- Built using React Three Fiber and Drei
- Uses a component-based architecture for each element of the city
- Agents use a state machine to determine their behavior
- Buildings are programmatically generated based on their type

## How It Works

1. Agents autonomously move between locations in the city
2. They change states between walking, working, and idle
3. While working, agents earn $AGENT tokens
4. Users can click on agents to see their stats and earnings
5. The simulation runs continuously and is synchronized for all users

## Agent Roles

The simulation features 10 different agent roles:

1. **Trader**: Specializes in trading resources
2. **Scientist**: Focuses on research and development
3. **Builder**: Expert in construction and infrastructure
4. **Explorer**: Discovers new resource nodes
5. **Farmer**: Cultivates renewable resources
6. **Engineer**: Creates and improves tools and machines
7. **Hacker**: Finds opportunities in the digital realm
8. **Diplomat**: Forges alliances with other agents
9. **Courier**: Handles rapid resource transportation
10. **Mystic**: Predicts market changes and resource fluctuations

## City Locations

The city includes several key locations:

- **$AGENT Bank**: Where agents store and manage their earnings
- **Police Station**: Maintains order in the city
- **Supermarket**: Where resources are traded
- **Grand Hotel**: A place for agents to rest and socialize
- **Gas Station**: For resource replenishment
- **Tech Hub**: Office building for technology-focused agents
- **Finance Center**: Where financial transactions take place
- **Residential Area**: Houses where some agents live

Each location serves a specific purpose in the agents' daily routines and resource generation. 