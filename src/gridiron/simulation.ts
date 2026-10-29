import type {
  GridironTeam,
  DriveResult,
  Play,
  GameStats,
  GameHighlight,
  SimulationResult,
  TeamRatings
} from './types.ts';
import { calculateTeamRatings, normalizeTeam } from './types.ts';

// Random utility functions
function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomBetween(min, max + 1));
}

function weightedRandom<T>(items: { value: T; weight: number }[]): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) return item.value;
  }
  
  return items[items.length - 1].value;
}

// Play generation
function generatePlay(
  offenseRating: number,
  defenseRating: number,
  fieldPosition: number,
  down: number,
  distance: number
): Play {
  const offenseAdvantage = offenseRating - defenseRating;
  const baseYards = randomBetween(0, 12 + (offenseAdvantage / 5));
  
  // Determine play type based on situation
  let playType: Play['type'];
  let yards: number;
  let description: string;
  let highlight = false;
  
  if (down === 4 && distance > 3 && fieldPosition < 40) {
    // Punt situation
    playType = 'PUNT';
    yards = randomInt(35, 50);
    description = `Punt for ${yards} yards`;
  } else if (distance <= 3 && fieldPosition > 35) {
    // Field goal range
    if (fieldPosition > 80 || randomBetween(0, 100) < 60) {
      playType = 'FIELD_GOAL';
      yards = fieldPosition - 35 + 17; // Approximate FG distance
      description = `Field goal attempt from ${yards} yards`;
    } else {
      playType = weightedRandom([
        { value: 'RUN' as const, weight: 60 },
        { value: 'PASS' as const, weight: 40 }
      ]);
      yards = Math.max(0, Math.round(baseYards));
      description = `${playType} for ${yards} yards`;
    }
  } else {
    // Normal play
    playType = weightedRandom([
      { value: 'RUN' as const, weight: 45 },
      { value: 'PASS' as const, weight: 55 }
    ]);
    
    yards = Math.round(baseYards);
    
    // Check for big plays or turnovers
    const turnoverChance = Math.max(0.5, 2 - (offenseAdvantage / 10));
    if (Math.random() * 100 < turnoverChance) {
      const originalPlayType = playType;
      playType = 'TURNOVER';
      yards = -yards;
      description = originalPlayType === 'PASS' ? 'Interception!' : 'Fumble!';
      highlight = true;
    } else if (Math.random() * 100 < 5) {
      yards += randomInt(20, 50);
      highlight = true;
      description = `Big ${playType}! ${yards} yards`;
    } else {
      description = `${playType} for ${yards} yards`;
    }
  }
  
  return {
    type: playType,
    yards,
    description,
    highlight
  };
}

// Drive simulation
function simulateDrive(
  driveNumber: number,
  offense: GridironTeam & { id: string },
  defense: GridironTeam & { id: string },
  offenseRatings: TeamRatings,
  defenseRatings: TeamRatings,
  startingFieldPosition: number,
  quarter: number,
  timeRemaining: number
): DriveResult {
  const plays: Play[] = [];
  let currentFieldPosition = startingFieldPosition;
  let down = 1;
  let distance = 10;
  let points = 0;
  let result: DriveResult['result'] = 'PUNT';
  let timeElapsed = 0;
  
  const maxPlays = randomInt(3, 15);
  let playCount = 0;
  
  while (playCount < maxPlays && currentFieldPosition < 100 && currentFieldPosition > 0) {
    const play = generatePlay(
      offenseRatings.offenseRating,
      defenseRatings.defenseRating,
      currentFieldPosition,
      down,
      distance
    );
    
    plays.push(play);
    timeElapsed += randomInt(30, 50);
    
    if (play.type === 'TURNOVER') {
      result = 'TURNOVER';
      currentFieldPosition = Math.max(0, currentFieldPosition + play.yards);
      break;
    }
    
    if (play.type === 'PUNT') {
      result = 'PUNT';
      currentFieldPosition = Math.max(0, 100 - currentFieldPosition - play.yards);
      break;
    }
    
    if (play.type === 'FIELD_GOAL') {
      const fgSuccess = 70 + (offenseRatings.specialTeamsRating - 50) / 2;
      if (Math.random() * 100 < fgSuccess) {
        result = 'FG';
        points = 3;
      } else {
        result = 'PUNT';
        // Ball goes to opponent at spot of kick, but not inside the 20
        const newFieldPosition = 100 - currentFieldPosition;
        currentFieldPosition = Math.max(20, newFieldPosition);
      }
      break;
    }
    
    // Normal play
    currentFieldPosition += play.yards;
    currentFieldPosition = Math.max(0, Math.min(100, currentFieldPosition));
    
    // Check for touchdown
    if (currentFieldPosition >= 100) {
      result = 'TD';
      points = 6;
      // Add extra point
      const xpSuccess = 95 + (offenseRatings.specialTeamsRating - 50) / 10;
      if (Math.random() * 100 < xpSuccess) {
        points += 1;
        plays.push({
          type: 'EXTRA_POINT',
          yards: 0,
          description: 'Extra point good'
        });
      } else {
        plays.push({
          type: 'EXTRA_POINT',
          yards: 0,
          description: 'Extra point missed'
        });
      }
      break;
    }
    
    // Update down and distance
    distance -= play.yards;
    if (distance <= 0) {
      down = 1;
      distance = 10;
    } else {
      down++;
      if (down > 4) {
        result = 'PUNT';
        break;
      }
    }
    
    playCount++;
  }
  
  // Check for safety
  if (currentFieldPosition <= 0 && result !== 'TD') {
    result = 'SAFETY';
    points = 2;
  }
  
  return {
    driveNumber,
    startingTeam: offense.id,
    startingFieldPosition,
    plays,
    result,
    points,
    timeElapsed
  };
}

// Initialize game stats
function initializeStats(teamId: string): GameStats {
  return {
    teamId,
    totalYards: 0,
    passingYards: 0,
    rushingYards: 0,
    firstDowns: 0,
    thirdDownConversions: 0,
    thirdDownAttempts: 0,
    turnovers: 0,
    timeOfPossession: 0
  };
}

// Main simulation function
export function simulateGame(
  homeTeam: GridironTeam,
  awayTeam: GridironTeam
): SimulationResult {
  // Ensure teams have IDs
  const normalizedHomeTeam = normalizeTeam(homeTeam);
  const normalizedAwayTeam = normalizeTeam(awayTeam);

  const drives: DriveResult[] = [];
  const highlights: GameHighlight[] = [];

  // Calculate team ratings from players
  const homeRatings = calculateTeamRatings(normalizedHomeTeam);
  const awayRatings = calculateTeamRatings(normalizedAwayTeam);

  const homeStats = initializeStats(normalizedHomeTeam.id);
  const awayStats = initializeStats(normalizedAwayTeam.id);
  
  let homeScore = 0;
  let awayScore = 0;
  
  // Track score at start of each quarter to calculate per-quarter scoring
  let scoreAtQuarterStart = { home: 0, away: 0 };
  
  const quarterScores = {
    Q1: { home: 0, away: 0 },
    Q2: { home: 0, away: 0 },
    Q3: { home: 0, away: 0 },
    Q4: { home: 0, away: 0 }
  };
  
  let currentQuarter = 1;
  let quarterTime = 900; // 15 minutes in seconds
  let driveNumber = 1;
  let currentPossession = Math.random() < 0.5 ? normalizedHomeTeam : normalizedAwayTeam;
  let fieldPosition = randomInt(20, 30); // Start at own 20-30 yard line
  
  // Simulate drives until game ends
  while (currentQuarter <= 4) {
    const defense = currentPossession.id === normalizedHomeTeam.id ? normalizedAwayTeam : normalizedHomeTeam;
    const currentRatings = currentPossession.id === normalizedHomeTeam.id ? homeRatings : awayRatings;
    const defenseRatings = currentPossession.id === normalizedHomeTeam.id ? awayRatings : homeRatings;
    
    const drive = simulateDrive(
      driveNumber,
      currentPossession,
      defense,
      currentRatings,
      defenseRatings,
      fieldPosition,
      currentQuarter,
      quarterTime
    );
    
    drives.push(drive);
    
    // Update score
    if (currentPossession.id === normalizedHomeTeam.id) {
      homeScore += drive.points;
      homeStats.timeOfPossession += drive.timeElapsed;
    } else {
      awayScore += drive.points;
      awayStats.timeOfPossession += drive.timeElapsed;
    }
    
    // Update stats based on plays
    const stats = currentPossession.id === normalizedHomeTeam.id ? homeStats : awayStats;
    for (const play of drive.plays) {
      if (play.type === 'PASS') {
        stats.passingYards += Math.max(0, play.yards);
        stats.totalYards += Math.max(0, play.yards);
      } else if (play.type === 'RUN') {
        stats.rushingYards += Math.max(0, play.yards);
        stats.totalYards += Math.max(0, play.yards);
      }
      if (play.type === 'TURNOVER') {
        stats.turnovers++;
      }
      if (play.highlight) {
        const highlightType: GameHighlight['type'] =
          play.type === 'TURNOVER' ? (play.description.includes('Interception') ? 'INT' : 'FUMBLE') :
          Math.abs(play.yards) > 20 ? 'BIG_PLAY' : 'TD';
        highlights.push({
          type: highlightType,
          description: play.description,
          quarter: currentQuarter,
          timeRemaining: quarterTime,
          teamId: currentPossession.id
        });
      }
    }
    
    // Add TD/FG highlights
    if (drive.result === 'TD') {
      highlights.push({
        type: 'TD',
        description: `Touchdown! ${currentPossession.name}`,
        quarter: currentQuarter,
        timeRemaining: quarterTime,
        teamId: currentPossession.id
      });
    } else if (drive.result === 'FG') {
      highlights.push({
        type: 'FG',
        description: `Field goal! ${currentPossession.name}`,
        quarter: currentQuarter,
        timeRemaining: quarterTime,
        teamId: currentPossession.id
      });
    }

    // Advance time
    quarterTime -= drive.timeElapsed;
    
    // Check for quarter end
    if (quarterTime <= 0) {
      // Calculate points scored this quarter
      const pointsThisQuarter = {
        home: homeScore - scoreAtQuarterStart.home,
        away: awayScore - scoreAtQuarterStart.away
      };
      
      // Update quarter scores
      if (currentQuarter === 1) quarterScores.Q1 = pointsThisQuarter;
      else if (currentQuarter === 2) quarterScores.Q2 = pointsThisQuarter;
      else if (currentQuarter === 3) quarterScores.Q3 = pointsThisQuarter;
      else if (currentQuarter === 4) quarterScores.Q4 = pointsThisQuarter;
      
      // Reset for next quarter
      scoreAtQuarterStart = { home: homeScore, away: awayScore };
      currentQuarter++;
      quarterTime = 900;
      if (currentQuarter > 4) break;
    }
    
    // Switch possession
    currentPossession = currentPossession.id === normalizedHomeTeam.id ? normalizedAwayTeam : normalizedHomeTeam;
    fieldPosition = randomInt(20, 30);
    driveNumber++;
  }
  
  // Calculate first downs (simplified)
  homeStats.firstDowns = Math.floor(homeStats.totalYards / 15);
  awayStats.firstDowns = Math.floor(awayStats.totalYards / 15);
  
  // Calculate third down efficiency (simplified)
  homeStats.thirdDownAttempts = Math.floor(drives.length / 2);
  homeStats.thirdDownConversions = Math.floor(homeStats.thirdDownAttempts * 0.4);
  awayStats.thirdDownAttempts = Math.floor(drives.length / 2);
  awayStats.thirdDownConversions = Math.floor(awayStats.thirdDownAttempts * 0.4);
  
  // Normalize time of possession to exactly 60 minutes
  const totalTime = homeStats.timeOfPossession + awayStats.timeOfPossession;
  if (totalTime > 0) {
    const ratio = 3600 / totalTime;
    homeStats.timeOfPossession = Math.round(homeStats.timeOfPossession * ratio);
    awayStats.timeOfPossession = 3600 - homeStats.timeOfPossession;
  }
  
  return {
    homeTeam: normalizedHomeTeam,
    awayTeam: normalizedAwayTeam,
    finalScore: {
      home: homeScore,
      away: awayScore
    },
    quarterScores,
    drives,
    stats: {
      home: homeStats,
      away: awayStats
    },
    highlights,
    gameDuration: 3600 // 60 minutes
  };
}
