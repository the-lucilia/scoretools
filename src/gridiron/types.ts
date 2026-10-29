export interface GridironPlayer {
  id?: string; // Optional - auto-generated if not provided
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

// Calculate player rating from stats (weighted average)
export function calculatePlayerRating(player: GridironPlayer): number {
  const { stats, position } = player;
  
  let rating = 0;
  
  // Base stats (always included)
  const baseStats = (stats.speed + stats.strength + stats.agility) / 3;
  
  // Position-specific weights
  switch (position) {
    case 'QB':
      // QB values accuracy highly
      rating = (baseStats * 0.4) + ((stats.accuracy || 50) * 0.6);
      break;
    case 'RB':
      // RB values speed and agility
      rating = ((stats.speed + stats.agility) / 2 * 0.7) + (stats.strength * 0.3);
      break;
    case 'WR':
      // WR values speed and agility
      rating = ((stats.speed + stats.agility) / 2 * 0.8) + (stats.strength * 0.2);
      break;
    case 'TE':
      // TE balanced between strength and agility
      rating = ((stats.strength + stats.agility) / 2 * 0.6) + (stats.speed * 0.4);
      break;
    case 'OL':
    case 'DL':
      // Linemen value strength
      rating = (stats.strength * 0.7) + ((stats.speed + stats.agility) / 2 * 0.3);
      break;
    case 'LB':
      // LB balanced
      rating = baseStats;
      break;
    case 'CB':
    case 'S':
      // Defensive backs value speed and agility
      rating = ((stats.speed + stats.agility) / 2 * 0.7) + (stats.strength * 0.3);
      break;
    case 'K':
    case 'P':
      // Kickers value accuracy/power
      rating = ((stats.accuracy || 50) * 0.5) + ((stats.power || 50) * 0.5);
      break;
    default:
      rating = baseStats;
  }
  
  return Math.round(rating);
}

export interface GridironTeam {
  id?: string; // Optional - auto-generated if not provided
  name: string;
  abbreviation: string;
  players: GridironPlayer[];
}

// Generate unique ID
let idCounter = 0;
export function generateId(): string {
  return `id_${++idCounter}_${Date.now()}`;
}

// Ensure team has an ID
export function ensureTeamId(team: GridironTeam): GridironTeam & { id: string } {
  return team.id ? (team as GridironTeam & { id: string }) : { ...team, id: generateId() };
}

// Ensure all players have IDs
export function ensurePlayerIds(team: GridironTeam & { id: string }): GridironTeam & { id: string } {
  return {
    ...team,
    players: team.players.map(player =>
      player.id ? player : { ...player, id: generateId() }
    )
  };
}

// Normalize team data (ensure IDs exist)
export function normalizeTeam(team: GridironTeam): GridironTeam & { id: string } {
  const withTeamId = ensureTeamId(team);
  return ensurePlayerIds(withTeamId);
}

export interface TeamRatings {
  offenseRating: number;
  defenseRating: number;
  specialTeamsRating: number;
  // TODO: Consider merging specialTeamsRating into offenseRating and creating an overall (OVR) rating based on offense and defense scores
}

// Validate that team has required minimum positions
export function validateTeam(team: GridironTeam): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const positions = team.players.map(p => p.position);
  
  // Required offensive positions
  if (!positions.includes('QB')) {
    errors.push('Team must have at least one QB');
  }
  if (!positions.includes('RB')) {
    errors.push('Team must have at least one RB');
  }
  if (!positions.includes('WR') && !positions.includes('TE')) {
    errors.push('Team must have at least one WR or TE');
  }
  
  // Required defensive positions
  if (!positions.includes('CB')) {
    errors.push('Team must have at least one CB');
  }
  if (!positions.includes('S')) {
    errors.push('Team must have at least one Safety');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Calculate team ratings from player ratings
export function calculateTeamRatings(team: GridironTeam): TeamRatings {
  const playerRatings = team.players.map(p => calculatePlayerRating(p));
  
  // Group players by position type
  const offensivePlayers = team.players.filter(p => 
    ['QB', 'RB', 'WR', 'TE', 'OL'].includes(p.position)
  );
  const defensivePlayers = team.players.filter(p => 
    ['DL', 'LB', 'CB', 'S'].includes(p.position)
  );
  const specialTeamsPlayers = team.players.filter(p => 
    ['K', 'P'].includes(p.position)
  );
  
  // Calculate offense rating (weighted by position importance)
  let offenseRating = 0;
  let offenseWeight = 0;
  
  offensivePlayers.forEach(player => {
    const rating = calculatePlayerRating(player);
    let weight = 1;
    
    // QB is most important for offense
    if (player.position === 'QB') weight = 2.5;
    // RB and WR are very important
    else if (player.position === 'RB' || player.position === 'WR') weight = 1.5;
    // TE is moderately important
    else if (player.position === 'TE') weight = 1.2;
    // OL is important but less visible
    else if (player.position === 'OL') weight = 1.0;
    
    offenseRating += rating * weight;
    offenseWeight += weight;
  });
  
  offenseRating = offenseWeight > 0 ? Math.round(offenseRating / offenseWeight) : 50;
  
  // Calculate defense rating
  let defenseRating = 0;
  let defenseWeight = 0;
  
  defensivePlayers.forEach(player => {
    const rating = calculatePlayerRating(player);
    let weight = 1;
    
    // CB and S are very important for pass defense
    if (player.position === 'CB' || player.position === 'S') weight = 1.5;
    // LB is important for run defense
    else if (player.position === 'LB') weight = 1.3;
    // DL is important for line of scrimmage
    else if (player.position === 'DL') weight = 1.2;
    
    defenseRating += rating * weight;
    defenseWeight += weight;
  });
  
  defenseRating = defenseWeight > 0 ? Math.round(defenseRating / defenseWeight) : 50;
  
  // Calculate special teams rating
  let specialTeamsRating = 0;
  
  if (specialTeamsPlayers.length > 0) {
    const stRatings = specialTeamsPlayers.map(p => calculatePlayerRating(p));
    specialTeamsRating = Math.round(stRatings.reduce((a, b) => a + b, 0) / stRatings.length);
  } else {
    // If no K/P, use average of all players as fallback
    specialTeamsRating = playerRatings.length > 0 
      ? Math.round(playerRatings.reduce((a, b) => a + b, 0) / playerRatings.length)
      : 50;
  }
  
  return {
    offenseRating: Math.max(1, Math.min(100, offenseRating)),
    defenseRating: Math.max(1, Math.min(100, defenseRating)),
    specialTeamsRating: Math.max(1, Math.min(100, specialTeamsRating))
  };
}

export interface DriveResult {
  driveNumber: number;
  startingTeam: string;
  startingFieldPosition: number; // 0-100 (0 = own goal line, 100 = opponent goal line)
  plays: Play[];
  result: 'TD' | 'FG' | 'PUNT' | 'TURNOVER' | 'SAFETY' | 'HALF_END' | 'GAME_END';
  points: number;
  timeElapsed: number; // in seconds
}

export interface Play {
  type: 'RUN' | 'PASS' | 'KICKOFF' | 'PUNT' | 'FIELD_GOAL' | 'EXTRA_POINT' | 'TURNOVER' | 'SACK';
  yards: number;
  description: string;
  highlight?: boolean;
}

export interface GameStats {
  teamId: string;
  totalYards: number;
  passingYards: number;
  rushingYards: number;
  firstDowns: number;
  thirdDownConversions: number;
  thirdDownAttempts: number;
  turnovers: number;
  timeOfPossession: number; // in seconds
}

export interface GameHighlight {
  type: 'TD' | 'INT' | 'FUMBLE' | 'BIG_PLAY' | 'FG' | 'SAFETY';
  description: string;
  quarter: number;
  timeRemaining: number; // in seconds
  teamId: string;
}

export interface SimulationResult {
  homeTeam: GridironTeam & { id: string };
  awayTeam: GridironTeam & { id: string };
  finalScore: {
    home: number;
    away: number;
  };
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
  gameDuration: number; // in seconds
}
