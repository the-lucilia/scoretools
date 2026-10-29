import { simulateGame, calculatePlayerRating, validateTeam, calculateTeamRatings, type GridironTeam } from './index.ts';
import { getTeam, customizeTeam, createTeam, createRandomPlayer } from './teams.ts';

// Example: Use predefined teams
const homeTeam = getTeam('CAROLINA_PANTHERS');
const awayTeam = getTeam('GREEN_BAY_PACKERS');

// Example: Customize a team (uncomment to try)
// const customTeam = customizeTeam('CAROLINA_PANTHERS', {
//   name: 'My Custom Panthers',
//   updateStats: [
//     { playerName: 'Bryce Young', stats: { accuracy: 90 } }
//   ]
// });

// Example: Create a completely custom team (uncomment to try)
// const customTeam = createTeam({
//   name: 'My Custom Team',
//   abbreviation: 'MCT',
//   players: [
//     createRandomPlayer('John Doe', 'QB', { min: 70, max: 85 }),
//     createRandomPlayer('Jane Smith', 'RB', { min: 70, max: 85 }),
//     createRandomPlayer('Bob Johnson', 'WR', { min: 70, max: 85 }),
//     createRandomPlayer('Alice Williams', 'CB', { min: 70, max: 85 }),
//     createRandomPlayer('Charlie Brown', 'S', { min: 70, max: 85 })
//   ]
// });

// Validate teams have required positions
console.log('=== TEAM VALIDATION ===\n');
const homeValidation = validateTeam(homeTeam);
const awayValidation = validateTeam(awayTeam);

console.log(`${homeTeam.name}: ${homeValidation.valid ? 'Valid' : 'Invalid'}`);
if (!homeValidation.valid) {
  homeValidation.errors.forEach(error => console.log(`  - ${error}`));
}

console.log(`${awayTeam.name}: ${awayValidation.valid ? 'Valid' : 'Invalid'}`);
if (!awayValidation.valid) {
  awayValidation.errors.forEach(error => console.log(`  - ${error}`));
}

if (!homeValidation.valid || !awayValidation.valid) {
  console.log('\nTeams are missing required positions. Please add them before simulating.');
} else {
  console.log('');
  
  // Calculate player ratings from stats
  console.log('=== PLAYER RATINGS (CALCULATED FROM STATS) ===\n');
  homeTeam.players.forEach(player => {
    console.log(`${player.name} (${player.position}): ${calculatePlayerRating(player)}`);
  });
  awayTeam.players.forEach(player => {
    console.log(`${player.name} (${player.position}): ${calculatePlayerRating(player)}`);
  });
  console.log('');
  
  // Calculate team ratings from players
  console.log('=== TEAM RATINGS (CALCULATED FROM PLAYERS) ===\n');
  const homeRatings = calculateTeamRatings(homeTeam);
  const awayRatings = calculateTeamRatings(awayTeam);
  console.log(`${homeTeam.name}:`);
  console.log(`  Offense: ${homeRatings.offenseRating}`);
  console.log(`  Defense: ${homeRatings.defenseRating}`);
  console.log(`  Special Teams: ${homeRatings.specialTeamsRating}`);
  console.log(``);
  console.log(`${awayTeam.name}:`);
  console.log(`  Offense: ${awayRatings.offenseRating}`);
  console.log(`  Defense: ${awayRatings.defenseRating}`);
  console.log(`  Special Teams: ${awayRatings.specialTeamsRating}`);
  console.log('');
  
  // Run simulation
  const result = simulateGame(homeTeam, awayTeam);

  // Display results
  console.log('=== GAME SIMULATION RESULTS ===\n');
  console.log(`${result.awayTeam.abbreviation} @ ${result.homeTeam.abbreviation}`);
  console.log(`Final Score: ${result.awayTeam.name} ${result.finalScore.away} - ${result.homeTeam.name} ${result.finalScore.home}\n`);

  console.log('Quarter Scores:');
  console.log(`Q1: ${result.awayTeam.abbreviation} ${result.quarterScores.Q1.away} - ${result.homeTeam.abbreviation} ${result.quarterScores.Q1.home}`);
  console.log(`Q2: ${result.awayTeam.abbreviation} ${result.quarterScores.Q2.away} - ${result.homeTeam.abbreviation} ${result.quarterScores.Q2.home}`);
  console.log(`Q3: ${result.awayTeam.abbreviation} ${result.quarterScores.Q3.away} - ${result.homeTeam.abbreviation} ${result.quarterScores.Q3.home}`);
  console.log(`Q4: ${result.awayTeam.abbreviation} ${result.quarterScores.Q4.away} - ${result.homeTeam.abbreviation} ${result.quarterScores.Q4.home}\n`);

  console.log('=== TEAM STATS ===');
  console.log(`\n${result.homeTeam.name}:`);
  console.log(`  Total Yards: ${result.stats.home.totalYards}`);
  console.log(`  Passing Yards: ${result.stats.home.passingYards}`);
  console.log(`  Rushing Yards: ${result.stats.home.rushingYards}`);
  console.log(`  First Downs: ${result.stats.home.firstDowns}`);
  console.log(`  3rd Down: ${result.stats.home.thirdDownConversions}/${result.stats.home.thirdDownAttempts}`);
  console.log(`  Turnovers: ${result.stats.home.turnovers}`);
  console.log(`  Time of Possession: ${Math.floor(result.stats.home.timeOfPossession / 60)}:${String(result.stats.home.timeOfPossession % 60).padStart(2, '0')}`);

  console.log(`\n${result.awayTeam.name}:`);
  console.log(`  Total Yards: ${result.stats.away.totalYards}`);
  console.log(`  Passing Yards: ${result.stats.away.passingYards}`);
  console.log(`  Rushing Yards: ${result.stats.away.rushingYards}`);
  console.log(`  First Downs: ${result.stats.away.firstDowns}`);
  console.log(`  3rd Down: ${result.stats.away.thirdDownConversions}/${result.stats.away.thirdDownAttempts}`);
  console.log(`  Turnovers: ${result.stats.away.turnovers}`);
  console.log(`  Time of Possession: ${Math.floor(result.stats.away.timeOfPossession / 60)}:${String(result.stats.away.timeOfPossession % 60).padStart(2, '0')}\n`);

  console.log('=== GAME HIGHLIGHTS ===');
  result.highlights.forEach((highlight, index) => {
    const teamName = highlight.teamId === result.homeTeam.id ? result.homeTeam.name : result.awayTeam.name;
    console.log(`${index + 1}. Q${highlight.quarter} - ${highlight.description} (${teamName})`);
  });

  console.log(`\n=== DRIVE SUMMARY (${result.drives.length} drives) ===`);
  result.drives.slice(0, 5).forEach((drive) => {
    const teamName = drive.startingTeam === result.homeTeam.id ? result.homeTeam.name : result.awayTeam.name;
    console.log(`Drive ${drive.driveNumber}: ${teamName} - ${drive.result} (${drive.points} pts)`);
  });

  if (result.drives.length > 5) {
    console.log(`... and ${result.drives.length - 5} more drives`);
  }
}
