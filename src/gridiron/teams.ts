import type { GridironTeam, GridironPlayer } from './types.ts';

// Predefined team roster
export const PREDEFINED_TEAMS: Record<string, GridironTeam> = {
  CAROLINA_PANTHERS: {
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
      {
        name: 'Jalen Coker',
        position: 'WR',
        stats: { speed: 78, strength: 68, agility: 82 }
      },
      {
        name: 'Jaycee Horn',
        position: 'CB',
        stats: { speed: 88, strength: 72, agility: 85 }
      },
      {
        name: 'Xavier Woods',
        position: 'S',
        stats: { speed: 82, strength: 75, agility: 78 }
      }
    ]
  },
  GREEN_BAY_PACKERS: {
    name: 'Green Bay Packers',
    abbreviation: 'GB',
    players: [
      {
        name: 'Jordan Love',
        position: 'QB',
        stats: { speed: 78, strength: 75, agility: 76, accuracy: 86 }
      },
      {
        name: 'Josh Jacobs',
        position: 'RB',
        stats: { speed: 84, strength: 88, agility: 82 }
      },
      {
        name: 'Christian Watson',
        position: 'WR',
        stats: { speed: 92, strength: 70, agility: 88 }
      },
      {
        name: 'Jaire Alexander',
        position: 'CB',
        stats: { speed: 90, strength: 70, agility: 88 }
      },
      {
        name: 'Xavier McKinney',
        position: 'S',
        stats: { speed: 85, strength: 78, agility: 82 }
      }
    ]
  }
};

// Get a predefined team by key
export function getTeam(key: keyof typeof PREDEFINED_TEAMS): GridironTeam {
  return JSON.parse(JSON.stringify(PREDEFINED_TEAMS[key]));
}

// Get all predefined team keys
export function getTeamKeys(): (keyof typeof PREDEFINED_TEAMS)[] {
  return Object.keys(PREDEFINED_TEAMS) as (keyof typeof PREDEFINED_TEAMS)[];
}

// Create a custom team from scratch
export function createTeam(config: {
  name: string;
  abbreviation: string;
  players?: GridironPlayer[];
}): GridironTeam {
  return {
    name: config.name,
    abbreviation: config.abbreviation,
    players: config.players || []
  };
}

// Create a custom player
export function createPlayer(config: {
  name: string;
  position: GridironPlayer['position'];
  stats: GridironPlayer['stats'];
}): GridironPlayer {
  return {
    name: config.name,
    position: config.position,
    stats: config.stats
  };
}

// Add a player to a team (returns new team)
export function addPlayer(team: GridironTeam, player: GridironPlayer): GridironTeam {
  return {
    ...team,
    players: [...team.players, player]
  };
}

// Remove a player from a team by name (returns new team)
export function removePlayer(team: GridironTeam, playerName: string): GridironTeam {
  return {
    ...team,
    players: team.players.filter(p => p.name !== playerName)
  };
}

// Update a player's stats (returns new team)
export function updatePlayerStats(
  team: GridironTeam,
  playerName: string,
  stats: Partial<GridironPlayer['stats']>
): GridironTeam {
  return {
    ...team,
    players: team.players.map(p => 
      p.name === playerName 
        ? { ...p, stats: { ...p.stats, ...stats } }
        : p
    )
  };
}

// Clone a team (useful for creating variations)
export function cloneTeam(team: GridironTeam, newName?: string, newAbbreviation?: string): GridironTeam {
  return {
    name: newName || team.name,
    abbreviation: newAbbreviation || team.abbreviation,
    players: JSON.parse(JSON.stringify(team.players))
  };
}

// Create a team from a predefined template with customizations
export function customizeTeam(
  teamKey: keyof typeof PREDEFINED_TEAMS,
  customizations: {
    name?: string;
    abbreviation?: string;
    addPlayers?: GridironPlayer[];
    removePlayers?: string[];
    updateStats?: Array<{ playerName: string; stats: Partial<GridironPlayer['stats']> }>;
  }
): GridironTeam {
  let team = getTeam(teamKey);
  
  if (customizations.name) team.name = customizations.name;
  if (customizations.abbreviation) team.abbreviation = customizations.abbreviation;
  
  if (customizations.addPlayers) {
    customizations.addPlayers.forEach(player => {
      team = addPlayer(team, player);
    });
  }
  
  if (customizations.removePlayers) {
    customizations.removePlayers.forEach(playerName => {
      team = removePlayer(team, playerName);
    });
  }
  
  if (customizations.updateStats) {
    customizations.updateStats.forEach(({ playerName, stats }) => {
      team = updatePlayerStats(team, playerName, stats);
    });
  }
  
  return team;
}

// Generate random stats for a player (useful for quick team creation)
export function generateRandomStats(
  position: GridironPlayer['position'],
  ratingRange: { min: number; max: number } = { min: 60, max: 90 }
): GridironPlayer['stats'] {
  const random = () => Math.floor(Math.random() * (ratingRange.max - ratingRange.min + 1)) + ratingRange.min;
  
  const baseStats = {
    speed: random(),
    strength: random(),
    agility: random()
  };
  
  // Add position-specific stats
  if (position === 'QB' || position === 'K') {
    return { ...baseStats, accuracy: random() };
  }
  
  if (position === 'K' || position === 'P') {
    return { ...baseStats, accuracy: random(), power: random() };
  }
  
  return baseStats;
}

// Create a random player
export function createRandomPlayer(
  name: string,
  position: GridironPlayer['position'],
  ratingRange?: { min: number; max: number }
): GridironPlayer {
  return createPlayer({
    name,
    position,
    stats: generateRandomStats(position, ratingRange)
  });
}

// Export team to CSV format
export function exportTeamToCSV(team: GridironTeam): string {
  const headers = ['Team Name', 'Team Abbreviation', 'Player Name', 'Position', 'Speed', 'Strength', 'Agility', 'Accuracy', 'Power'];
  const rows = team.players.map(player => [
    team.name,
    team.abbreviation,
    player.name,
    player.position,
    player.stats.speed,
    player.stats.strength,
    player.stats.agility,
    player.stats.accuracy ?? '',
    player.stats.power ?? ''
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  
  return csvContent;
}

// Import team from CSV format
export function importTeamFromCSV(csvContent: string): GridironTeam {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  
  const players: GridironPlayer[] = [];
  let teamName = '';
  let teamAbbreviation = '';
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    
    teamName = row['Team Name'];
    teamAbbreviation = row['Team Abbreviation'];
    
    const stats: GridironPlayer['stats'] = {
      speed: parseInt(row['Speed']),
      strength: parseInt(row['Strength']),
      agility: parseInt(row['Agility'])
    };
    
    if (row['Accuracy']) {
      stats.accuracy = parseInt(row['Accuracy']);
    }
    
    if (row['Power']) {
      stats.power = parseInt(row['Power']);
    }
    
    players.push({
      name: row['Player Name'],
      position: row['Position'] as GridironPlayer['position'],
      stats
    });
  }
  
  return {
    name: teamName,
    abbreviation: teamAbbreviation,
    players
  };
}

// Download team as CSV file
export function downloadTeamCSV(team: GridironTeam, filename?: string): void {
  const csv = exportTeamToCSV(team);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename || `${team.name.replace(/\s+/g, '_')}_team.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
