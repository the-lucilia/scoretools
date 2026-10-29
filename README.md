# ScoreTools

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-7.0.2-blue.svg)
![Vite](https://img.shields.io/badge/Vite-8.3.5-646CFF.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-WIP-yellow.svg)

A collection of sports simulation tools (scorinators) for generating realistic game outcomes. Currently featuring a comprehensive American football (gridiron) simulation engine.

## Features

### Gridiron Simulation
- **Player Rating System**: Position-specific rating calculations based on player attributes (speed, strength, agility, accuracy, power)
- **Team Validation**: Ensures teams have required positions before simulation
- **Team Ratings**: Calculates overall offense, defense, and special teams ratings from player data
- **Realistic Game Simulation**:
  - Drive-by-drive simulation with play-by-play generation
  - Quarter-by-quarter scoring
  - Comprehensive game statistics (yards, first downs, third down efficiency, turnovers, time of possession)
  - Game highlights (touchdowns, interceptions, fumbles, big plays, field goals)
  - Drive summary with results and points
- **Web Interface**: Beautiful, responsive dashboard displaying simulation results

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/scoretools.git
cd scoretools

# Install dependencies
npm install
```

## Usage

### Running the Demo

```bash
# Start the development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Using the Gridiron Simulation

```typescript
import { 
  simulateGame, 
  calculatePlayerRating, 
  validateTeam, 
  calculateTeamRatings,
  type GridironTeam 
} from './gridiron';

// Define your teams
const homeTeam: GridironTeam = {
  name: 'Carolina Panthers',
  abbreviation: 'CAR',
  players: [
    { 
      name: 'Bryce Young', 
      position: 'QB', 
      stats: { speed: 75, strength: 70, agility: 72, accuracy: 80 } 
    },
    { 
      name: 'Chuba Hubbard', 
      position: 'RB', 
      stats: { speed: 85, strength: 82, agility: 80 } 
    },
    // ... more players
  ]
};

const awayTeam: GridironTeam = {
  name: 'Green Bay Packers',
  abbreviation: 'GB',
  players: [
    // ... players
  ]
};

// Validate teams
const homeValidation = validateTeam(homeTeam);
const awayValidation = validateTeam(awayTeam);

if (!homeValidation.valid || !awayValidation.valid) {
  console.error('Invalid teams:', [...homeValidation.errors, ...awayValidation.errors]);
} else {
  // Calculate team ratings
  const homeRatings = calculateTeamRatings(homeTeam);
  const awayRatings = calculateTeamRatings(awayTeam);
  
  // Simulate the game
  const result = simulateGame(homeTeam, awayTeam);
  
  console.log(`Final Score: ${result.awayTeam.name} ${result.finalScore.away} - ${result.homeTeam.name} ${result.finalScore.home}`);
  console.log('Quarter Scores:', result.quarterScores);
  console.log('Game Stats:', result.stats);
  console.log('Highlights:', result.highlights);
}
```

## API Reference

### Types

#### `GridironPlayer`
```typescript
interface GridironPlayer {
  id?: string;
  name: string;
  position: 'QB' | 'RB' | 'WR' | 'TE' | 'OL' | 'DL' | 'LB' | 'CB' | 'S' | 'K' | 'P';
  stats: {
    speed: number;
    strength: number;
    agility: number;
    accuracy?: number; // for QB/K
    power?: number; // for K/P
  };
}
```

#### `GridironTeam`
```typescript
interface GridironTeam {
  id?: string;
  name: string;
  abbreviation: string;
  players: GridironPlayer[];
}
```

#### `SimulationResult`
```typescript
interface SimulationResult {
  homeTeam: GridironTeam & { id: string };
  awayTeam: GridironTeam & { id: string };
  finalScore: { home: number; away: number };
  quarterScores: {
    Q1: { home: number; away: number };
    Q2: { home: number; away: number };
    Q3: { home: number; away: number };
    Q4: { home: number; away: number };
  };
  drives: DriveResult[];
  stats: {
    home: GameStats;
    away: GameStats;
  };
  highlights: GameHighlight[];
  gameDuration: number;
}
```

### Functions

#### `calculatePlayerRating(player: GridironTeam): number`
Calculates a player's overall rating based on their position and stats. Uses position-specific weights for more accurate ratings.

#### `validateTeam(team: GridironTeam): { valid: boolean; errors: string[] }`
Validates that a team has all required positions (QB, RB, WR/TE, CB, S).

#### `calculateTeamRatings(team: GridironTeam): TeamRatings`
Calculates team-wide offense, defense, and special teams ratings from player data.

#### `simulateGame(homeTeam: GridironTeam, awayTeam: GridironTeam): SimulationResult`
Simulates a complete game between two teams and returns detailed results including scores, stats, and highlights.

## Roadmap

This project is currently a work in progress. Planned features include:

- [ ] Additional scorinators for other sports (basketball, soccer, baseball, hockey)
- [ ] More advanced simulation algorithms
- [ ] Historical team data integration
- [ ] Season simulation mode
- [ ] Playoff bracket simulation
- [ ] Player import/export functionality
- [] Enhanced web UI with interactive controls
- [ ] API endpoints for programmatic access
- [ ] Unit tests and integration tests

## Tech Stack

- **TypeScript** 7.0.2 - Type-safe JavaScript
- **Vite** 8.3.5 - Fast build tool and dev server
- **No external runtime dependencies** - Pure TypeScript simulation logic

## Project Structure

```
scoretools/
├── src/
│   ├── gridiron/
│   │   ├── index.ts          # Module exports
│   │   ├── types.ts          # Type definitions and utility functions
│   │   ├── simulation.ts     # Game simulation logic
│   │   └── example.ts        # Usage examples
│   ├── main.ts               # Demo web application
│   └── style.css             # Styling
├── public/                   # Static assets
├── index.html                # HTML entry point
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── vite.config.ts            # Vite configuration
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Live Demo

Coming soon to GitHub Pages!

## Contact

For questions or suggestions, please open an issue on GitHub.

---

## Notes and Disclosures

This project acknowledges the use of LLM tools as development aids, primarily for documentation (README generation) and commit message assistance. These tools were used to streamline the development workflow and improve quality. 

**Note**: This project is currently in active development. APIs and features may change as the project evolves.
