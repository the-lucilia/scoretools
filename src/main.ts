import './style.css'
import { 
  simulateGame, 
  calculatePlayerRating, 
  validateTeam, 
  calculateTeamRatings, 
  getTeam, 
  createTeam, 
  createPlayer, 
  addPlayer, 
  removePlayer, 
  updatePlayerStats, 
  downloadTeamCSV, 
  importTeamFromCSV,
  type GridironTeam,
  type GridironPlayer 
} from './gridiron/index.ts'

// State management
type Tab = 'gridiron' | 'teambuilder';

interface AppState {
  currentTab: Tab;
  homeTeam: GridironTeam;
  awayTeam: GridironTeam;
  buildingTeam: GridironTeam;
  simulationResult: any;
}

const state: AppState = {
  currentTab: 'gridiron',
  homeTeam: getTeam('CAROLINA_PANTHERS'),
  awayTeam: getTeam('GREEN_BAY_PACKERS'),
  buildingTeam: createTeam({ name: 'New Team', abbreviation: 'NEW', players: [] }),
  simulationResult: null
};

// Tab switching
function switchTab(tab: Tab) {
  state.currentTab = tab;
  render();
}

// Run simulation
function runSimulation() {
  const homeValidation = validateTeam(state.homeTeam);
  const awayValidation = validateTeam(state.awayTeam);
  
  if (!homeValidation.valid || !awayValidation.valid) {
    alert('Teams are missing required positions: ' + [...homeValidation.errors, ...awayValidation.errors].join(', '));
    return;
  }
  
  state.simulationResult = simulateGame(state.homeTeam, state.awayTeam);
  render();
}

// Import team from file
function importTeam(target: 'home' | 'away') {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv';
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const team = importTeamFromCSV(e.target?.result as string);
          if (target === 'home') {
            state.homeTeam = team;
          } else {
            state.awayTeam = team;
          }
          state.simulationResult = null;
          render();
        } catch (err) {
          alert('Error importing team: ' + (err as Error).message);
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
}

// Teambuilder functions
function updateBuildingTeam(team: GridironTeam) {
  state.buildingTeam = team;
  render();
}

function addPlayerToBuildingTeam(player: GridironPlayer) {
  state.buildingTeam = addPlayer(state.buildingTeam, player);
  render();
}

function removePlayerFromBuildingTeam(playerName: string) {
  state.buildingTeam = removePlayer(state.buildingTeam, playerName);
  render();
}

function updateBuildingTeamStats(playerName: string, stats: Partial<GridironPlayer['stats']>) {
  state.buildingTeam = updatePlayerStats(state.buildingTeam, playerName, stats);
  render();
}

function saveBuildingTeam() {
  downloadTeamCSV(state.buildingTeam);
}

function loadTeamToSimulation(team: GridironTeam, target: 'home' | 'away') {
  if (target === 'home') {
    state.homeTeam = team;
  } else {
    state.awayTeam = team;
  }
  state.simulationResult = null;
  switchTab('gridiron');
}

// Render functions
function render() {
  const app = document.querySelector<HTMLDivElement>('#app')!;
  
  let html = '<div style="width: 100%; margin: 0 auto; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Oxygen, Ubuntu, sans-serif; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); min-height: 100vh; color: #fff;">';
  
  // Navigation tabs
  html += `
    <div style="display: flex; gap: 10px; margin-bottom: 30px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px;">
      <button 
        onclick="window.switchTab('gridiron')"
        style="padding: 12px 30px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600; transition: all 0.2s; ${
          state.currentTab === 'gridiron' 
            ? 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);' 
            : 'background: rgba(255,255,255,0.05); color: #7f8c8d;'
        }"
      >
        Gridiron Scorinator
      </button>
      <button 
        onclick="window.switchTab('teambuilder')"
        style="padding: 12px 30px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600; transition: all 0.2s; ${
          state.currentTab === 'teambuilder' 
            ? 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);' 
            : 'background: rgba(255,255,255,0.05); color: #7f8c8d;'
        }"
      >
        Teambuilder
      </button>
    </div>
  `;
  
  if (state.currentTab === 'gridiron') {
    html += renderGridiron();
  } else {
    html += renderTeambuilder();
  }
  
  html += '</div>';
  app.innerHTML = html;
}

function renderGridiron(): string {
  const homeValidation = validateTeam(state.homeTeam);
  const awayValidation = validateTeam(state.awayTeam);
  
  let html = '';
  
  // Team selection and import buttons
  html += `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
      <div style="background: rgba(255,255,255,0.05); padding: 25px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
        <h3 style="color: #3498db; margin: 0 0 15px; font-size: 16px; font-weight: 600;">Home Team</h3>
        <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 15px;">
          <span style="font-size: 18px; font-weight: 700; color: #fff;">${state.homeTeam.name}</span>
          <span style="color: #7f8c8d;">(${state.homeTeam.abbreviation})</span>
        </div>
        <button 
          onclick="window.importTeam('home')"
          style="padding: 10px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; background: rgba(52, 152, 219, 0.2); color: #3498db; transition: all 0.2s;"
        >
          Import Team
        </button>
      </div>
      <div style="background: rgba(255,255,255,0.05); padding: 25px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
        <h3 style="color: #f39c12; margin: 0 0 15px; font-size: 16px; font-weight: 600;">Away Team</h3>
        <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 15px;">
          <span style="font-size: 18px; font-weight: 700; color: #fff;">${state.awayTeam.name}</span>
          <span style="color: #7f8c8d;">(${state.awayTeam.abbreviation})</span>
        </div>
        <button 
          onclick="window.importTeam('away')"
          style="padding: 10px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; background: rgba(243, 156, 18, 0.2); color: #f39c12; transition: all 0.2s;"
        >
          Import Team
        </button>
      </div>
    </div>
    
    <div style="text-align: center; margin-bottom: 30px;">
      <button 
        onclick="window.runSimulation()"
        style="padding: 15px 40px; border: none; border-radius: 8px; cursor: pointer; font-size: 18px; font-weight: 700; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: all 0.2s;"
      >
        Run Simulation
      </button>
    </div>
  `;
  
  if (!homeValidation.valid || !awayValidation.valid) {
    html += '<div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 30px; backdrop-filter: blur(10px);">';
    html += '<h1 style="color: #fff; margin: 0 0 20px;">Team Validation Errors</h1>';
    html += '<p style="color: #ccc;">Teams are missing required positions:</p>';
    html += '<ul style="color: #ccc;">';
    [...homeValidation.errors, ...awayValidation.errors].forEach(error => {
      html += `<li>${error}</li>`;
    });
    html += '</ul></div>';
    return html;
  }
  
  if (!state.simulationResult) {
    html += '<div style="text-align: center; padding: 60px; background: rgba(255,255,255,0.05); border-radius: 12px;">';
    html += '<p style="color: #7f8c8d; font-size: 18px;">Click "Run Simulation" to simulate the game</p>';
    html += '</div>';
    return html;
  }
  
  const result = state.simulationResult;
  const homeRatings = calculateTeamRatings(state.homeTeam);
  const awayRatings = calculateTeamRatings(state.awayTeam);

  html += `
    <!-- Scoreboard Header -->
    <div style="background: linear-gradient(180deg, #0d1b2a 0%, #1b263b 100%); border-radius: 16px; padding: 50px 30px; margin-bottom: 30px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);">
      <div style="display: flex; justify-content: center; align-items: center; gap: 40px;">
        <div style="text-align: center; flex: 1; min-width: 0;">
          <div style="font-size: 12px; color: #7f8c8d; letter-spacing: 2px; margin-bottom: 12px;">AWAY</div>
          <div style="font-size: 48px; font-weight: 800; color: #fff; text-shadow: 0 2px 10px rgba(0,0,0,0.5); white-space: nowrap; overflow: visible; line-height: 1.1;">${result.awayTeam.abbreviation}</div>
          <div style="font-size: 14px; color: #bdc3c7; margin-top: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${result.awayTeam.name}</div>
        </div>
        <div style="text-align: center; flex: 0 0 200px; min-width: 200px;">
          <div style="font-size: 56px; font-weight: 900; color: #e74c3c; text-shadow: 0 4px 20px rgba(231, 76, 60, 0.4); letter-spacing: 4px; line-height: 1; white-space: nowrap;">
            ${result.finalScore.away} - ${result.finalScore.home}
          </div>
          <div style="font-size: 12px; color: #7f8c8d; letter-spacing: 3px; margin-top: 10px;">FINAL</div>
        </div>
        <div style="text-align: center; flex: 1; min-width: 0;">
          <div style="font-size: 12px; color: #7f8c8d; letter-spacing: 2px; margin-bottom: 12px;">HOME</div>
          <div style="font-size: 48px; font-weight: 800; color: #fff; text-shadow: 0 2px 10px rgba(0,0,0,0.5); white-space: nowrap; overflow: visible; line-height: 1.1;">${result.homeTeam.abbreviation}</div>
          <div style="font-size: 14px; color: #bdc3c7; margin-top: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${result.homeTeam.name}</div>
        </div>
      </div>
    </div>

    <!-- Team Ratings -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
      <div style="background: rgba(255,255,255,0.05); padding: 25px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px);">
        <h3 style="color: #3498db; margin: 0 0 15px; font-size: 18px; font-weight: 600;">${result.homeTeam.name}</h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
          <div style="text-align: center; background: rgba(52, 152, 219, 0.1); padding: 15px; border-radius: 8px;">
            <div style="font-size: 12px; color: #7f8c8d; margin-bottom: 5px;">OFFENSE</div>
            <div style="font-size: 28px; font-weight: 700; color: #3498db;">${homeRatings.offenseRating}</div>
          </div>
          <div style="text-align: center; background: rgba(231, 76, 60, 0.1); padding: 15px; border-radius: 8px;">
            <div style="font-size: 12px; color: #7f8c8d; margin-bottom: 5px;">DEFENSE</div>
            <div style="font-size: 28px; font-weight: 700; color: #e74c3c;">${homeRatings.defenseRating}</div>
          </div>
          <div style="text-align: center; background: rgba(46, 204, 113, 0.1); padding: 15px; border-radius: 8px;">
            <div style="font-size: 12px; color: #7f8c8d; margin-bottom: 5px;">SPECIAL</div>
            <div style="font-size: 28px; font-weight: 700; color: #2ecc71;">${homeRatings.specialTeamsRating}</div>
          </div>
        </div>
      </div>
      <div style="background: rgba(255,255,255,0.05); padding: 25px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px);">
        <h3 style="color: #f39c12; margin: 0 0 15px; font-size: 18px; font-weight: 600;">${result.awayTeam.name}</h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
          <div style="text-align: center; background: rgba(52, 152, 219, 0.1); padding: 15px; border-radius: 8px;">
            <div style="font-size: 12px; color: #7f8c8d; margin-bottom: 5px;">OFFENSE</div>
            <div style="font-size: 28px; font-weight: 700; color: #3498db;">${awayRatings.offenseRating}</div>
          </div>
          <div style="text-align: center; background: rgba(231, 76, 60, 0.1); padding: 15px; border-radius: 8px;">
            <div style="font-size: 12px; color: #7f8c8d; margin-bottom: 5px;">DEFENSE</div>
            <div style="font-size: 28px; font-weight: 700; color: #e74c3c;">${awayRatings.defenseRating}</div>
          </div>
          <div style="text-align: center; background: rgba(46, 204, 113, 0.1); padding: 15px; border-radius: 8px;">
            <div style="font-size: 12px; color: #7f8c8d; margin-bottom: 5px;">SPECIAL</div>
            <div style="font-size: 28px; font-weight: 700; color: #2ecc71;">${awayRatings.specialTeamsRating}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quarter Scores -->
    <div style="background: rgba(255,255,255,0.05); padding: 25px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 30px; backdrop-filter: blur(10px);">
      <h3 style="color: #fff; margin: 0 0 20px; font-size: 20px; font-weight: 600; display: flex; align-items: center; gap: 10px;">
        <span style="background: #e74c3c; width: 4px; height: 24px; display: inline-block; border-radius: 2px;"></span>
        QUARTER SCORES
      </h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: rgba(255,255,255,0.05);">
            <th style="padding: 12px 15px; text-align: center; color: #7f8c8d; font-size: 12px; font-weight: 600; letter-spacing: 1px;">TEAM</th>
            <th style="padding: 12px 15px; text-align: center; color: #7f8c8d; font-size: 12px; font-weight: 600; letter-spacing: 1px;">Q1</th>
            <th style="padding: 12px 15px; text-align: center; color: #7f8c8d; font-size: 12px; font-weight: 600; letter-spacing: 1px;">Q2</th>
            <th style="padding: 12px 15px; text-align: center; color: #7f8c8d; font-size: 12px; font-weight: 600; letter-spacing: 1px;">Q3</th>
            <th style="padding: 12px 15px; text-align: center; color: #7f8c8d; font-size: 12px; font-weight: 600; letter-spacing: 1px;">Q4</th>
            <th style="padding: 12px 15px; text-align: center; color: #7f8c8d; font-size: 12px; font-weight: 600; letter-spacing: 1px;">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
            <td style="padding: 15px; text-align: center; color: #f39c12; font-weight: 700; font-size: 16px;">${result.awayTeam.abbreviation}</td>
            <td style="padding: 15px; text-align: center; font-size: 20px; font-weight: 700; color: #fff;">${result.quarterScores.Q1.away}</td>
            <td style="padding: 15px; text-align: center; font-size: 20px; font-weight: 700; color: #fff;">${result.quarterScores.Q2.away}</td>
            <td style="padding: 15px; text-align: center; font-size: 20px; font-weight: 700; color: #fff;">${result.quarterScores.Q3.away}</td>
            <td style="padding: 15px; text-align: center; font-size: 20px; font-weight: 700; color: #fff;">${result.quarterScores.Q4.away}</td>
            <td style="padding: 15px; text-align: center; font-size: 24px; font-weight: 900; color: #f39c12; background: rgba(243, 156, 18, 0.1);">${result.finalScore.away}</td>
          </tr>
          <tr>
            <td style="padding: 15px; text-align: center; color: #3498db; font-weight: 700; font-size: 16px;">${result.homeTeam.abbreviation}</td>
            <td style="padding: 15px; text-align: center; font-size: 20px; font-weight: 700; color: #fff;">${result.quarterScores.Q1.home}</td>
            <td style="padding: 15px; text-align: center; font-size: 20px; font-weight: 700; color: #fff;">${result.quarterScores.Q2.home}</td>
            <td style="padding: 15px; text-align: center; font-size: 20px; font-weight: 700; color: #fff;">${result.quarterScores.Q3.home}</td>
            <td style="padding: 15px; text-align: center; font-size: 20px; font-weight: 700; color: #fff;">${result.quarterScores.Q4.home}</td>
            <td style="padding: 15px; text-align: center; font-size: 24px; font-weight: 900; color: #3498db; background: rgba(52, 152, 219, 0.1);">${result.finalScore.home}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Team Stats -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
      <div style="background: rgba(255,255,255,0.05); padding: 25px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px);">
        <h4 style="color: #3498db; margin: 0 0 20px; font-size: 18px; font-weight: 600;">${result.homeTeam.name} Stats</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 8px;">
            <div style="font-size: 11px; color: #7f8c8d; letter-spacing: 1px; margin-bottom: 5px;">TOTAL YARDS</div>
            <div style="font-size: 24px; font-weight: 700; color: #fff;">${result.stats.home.totalYards}</div>
          </div>
          <div style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 8px;">
            <div style="font-size: 11px; color: #7f8c8d; letter-spacing: 1px; margin-bottom: 5px;">PASSING</div>
            <div style="font-size: 24px; font-weight: 700; color: #fff;">${result.stats.home.passingYards}</div>
          </div>
          <div style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 8px;">
            <div style="font-size: 11px; color: #7f8c8d; letter-spacing: 1px; margin-bottom: 5px;">RUSHING</div>
            <div style="font-size: 24px; font-weight: 700; color: #fff;">${result.stats.home.rushingYards}</div>
          </div>
          <div style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 8px;">
            <div style="font-size: 11px; color: #7f8c8d; letter-spacing: 1px; margin-bottom: 5px;">1ST DOWNS</div>
            <div style="font-size: 24px; font-weight: 700; color: #fff;">${result.stats.home.firstDowns}</div>
          </div>
          <div style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 8px;">
            <div style="font-size: 11px; color: #7f8c8d; letter-spacing: 1px; margin-bottom: 5px;">3RD DOWN</div>
            <div style="font-size: 24px; font-weight: 700; color: #fff;">${result.stats.home.thirdDownConversions}/${result.stats.home.thirdDownAttempts}</div>
          </div>
          <div style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 8px;">
            <div style="font-size: 11px; color: #7f8c8d; letter-spacing: 1px; margin-bottom: 5px;">TURNOVERS</div>
            <div style="font-size: 24px; font-weight: 700; color: #e74c3c;">${result.stats.home.turnovers}</div>
          </div>
          <div style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 8px; grid-column: span 2;">
            <div style="font-size: 11px; color: #7f8c8d; letter-spacing: 1px; margin-bottom: 5px;">TIME OF POSSESSION</div>
            <div style="font-size: 24px; font-weight: 700; color: #fff;">${Math.floor(result.stats.home.timeOfPossession / 60)}:${String(result.stats.home.timeOfPossession % 60).padStart(2, '0')}</div>
          </div>
        </div>
      </div>
      <div style="background: rgba(255,255,255,0.05); padding: 25px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px);">
        <h4 style="color: #f39c12; margin: 0 0 20px; font-size: 18px; font-weight: 600;">${result.awayTeam.name} Stats</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 8px;">
            <div style="font-size: 11px; color: #7f8c8d; letter-spacing: 1px; margin-bottom: 5px;">TOTAL YARDS</div>
            <div style="font-size: 24px; font-weight: 700; color: #fff;">${result.stats.away.totalYards}</div>
          </div>
          <div style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 8px;">
            <div style="font-size: 11px; color: #7f8c8d; letter-spacing: 1px; margin-bottom: 5px;">PASSING</div>
            <div style="font-size: 24px; font-weight: 700; color: #fff;">${result.stats.away.passingYards}</div>
          </div>
          <div style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 8px;">
            <div style="font-size: 11px; color: #7f8c8d; letter-spacing: 1px; margin-bottom: 5px;">RUSHING</div>
            <div style="font-size: 24px; font-weight: 700; color: #fff;">${result.stats.away.rushingYards}</div>
          </div>
          <div style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 8px;">
            <div style="font-size: 11px; color: #7f8c8d; letter-spacing: 1px; margin-bottom: 5px;">1ST DOWNS</div>
            <div style="font-size: 24px; font-weight: 700; color: #fff;">${result.stats.away.firstDowns}</div>
          </div>
          <div style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 8px;">
            <div style="font-size: 11px; color: #7f8c8d; letter-spacing: 1px; margin-bottom: 5px;">3RD DOWN</div>
            <div style="font-size: 24px; font-weight: 700; color: #fff;">${result.stats.away.thirdDownConversions}/${result.stats.away.thirdDownAttempts}</div>
          </div>
          <div style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 8px;">
            <div style="font-size: 11px; color: #7f8c8d; letter-spacing: 1px; margin-bottom: 5px;">TURNOVERS</div>
            <div style="font-size: 24px; font-weight: 700; color: #e74c3c;">${result.stats.away.turnovers}</div>
          </div>
          <div style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 8px; grid-column: span 2;">
            <div style="font-size: 11px; color: #7f8c8d; letter-spacing: 1px; margin-bottom: 5px;">TIME OF POSSESSION</div>
            <div style="font-size: 24px; font-weight: 700; color: #fff;">${Math.floor(result.stats.away.timeOfPossession / 60)}:${String(result.stats.away.timeOfPossession % 60).padStart(2, '0')}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Game Highlights -->
    <!-- TODO: Improve highlights display - consider filtering by type, adding timestamps, or collapsible sections -->
    <div style="background: rgba(255,255,255,0.05); padding: 25px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 30px; backdrop-filter: blur(10px);">
      <h3 style="color: #fff; margin: 0 0 20px; font-size: 20px; font-weight: 600; display: flex; align-items: center; gap: 10px;">
        <span style="background: #f39c12; width: 4px; height: 24px; display: inline-block; border-radius: 2px;"></span>
        GAME HIGHLIGHTS
      </h3>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${result.highlights.map(h => {
          const teamName = h.teamId === result.homeTeam.id ? result.homeTeam.name : result.awayTeam.name;
          const teamColor = h.teamId === result.homeTeam.id ? '#3498db' : '#f39c12';
          const highlightColor = h.type === 'TD' ? '#2ecc71' : h.type === 'INT' || h.type === 'FUMBLE' ? '#e74c3c' : '#f39c12';
          return `
            <div style="display: flex; align-items: center; gap: 15px; padding: 12px 15px; background: rgba(255,255,255,0.03); border-radius: 8px; border-left: 3px solid ${highlightColor};">
              <span style="background: ${highlightColor}; color: #fff; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; min-width: 45px; text-align: center;">Q${h.quarter}</span>
              <span style="color: #fff; font-weight: 500;">${h.description}</span>
              <span style="color: ${teamColor}; font-weight: 600; font-size: 14px; margin-left: auto;">${teamName}</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Drive Summary -->
    <!-- TODO: Improve drive summary display - consider pagination, filtering by result type, or expandable drive details -->
    <div style="background: rgba(255,255,255,0.05); padding: 25px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px);">
      <h3 style="color: #fff; margin: 0 0 20px; font-size: 20px; font-weight: 600; display: flex; align-items: center; gap: 10px;">
        <span style="background: #2ecc71; width: 4px; height: 24px; display: inline-block; border-radius: 2px;"></span>
        DRIVE SUMMARY (${result.drives.length} drives)
      </h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;">
        ${result.drives.slice(0, 10).map(d => {
          const teamName = d.startingTeam === result.homeTeam.id ? result.homeTeam.name : result.awayTeam.name;
          const teamColor = d.startingTeam === result.homeTeam.id ? '#3498db' : '#f39c12';
          const resultColor = d.result === 'TD' ? '#2ecc71' : d.result === 'FG' ? '#f39c12' : d.result === 'TURNOVER' ? '#e74c3c' : '#7f8c8d';
          return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 15px; background: rgba(255,255,255,0.03); border-radius: 8px;">
              <div>
                <span style="color: #7f8c8d; font-size: 12px; margin-right: 8px;">Drive ${d.driveNumber}</span>
                <span style="color: ${teamColor}; font-weight: 600; font-size: 14px;">${teamName}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="background: ${resultColor}; color: #fff; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;">${d.result}</span>
                <span style="color: #fff; font-weight: 700; font-size: 16px;">${d.points}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
      ${result.drives.length > 10 ? `<div style="text-align: center; padding: 15px;">
        <span style="color: #7f8c8d; font-size: 14px;">... and ${result.drives.length - 10} more drives</span>
      </div>` : ''}
    </div>
  `;

  return html;
}

function renderTeambuilder(): string {
  let html = '';
  
  html += `
    <div style="display: grid; grid-template-columns: 350px 1fr; gap: 30px;">
      <!-- Team Info -->
      <div style="background: rgba(255,255,255,0.05); padding: 25px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px);">
        <h3 style="color: #fff; margin: 0 0 20px; font-size: 20px; font-weight: 600;">Team Information</h3>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; color: #7f8c8d; font-size: 12px; margin-bottom: 8px; letter-spacing: 1px;">SPORT</label>
          <select 
            id="sport-select"
            disabled
            style="width: 100%; padding: 12px; border: none; border-radius: 6px; background: rgba(255,255,255,0.08); color: #fff; font-size: 14px; box-sizing: border-box;"
          >
            <option value="gridiron">Gridiron (Football)</option>
          </select>
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; color: #7f8c8d; font-size: 12px; margin-bottom: 8px; letter-spacing: 1px;">TEAM NAME</label>
          <input 
            type="text"
            id="team-name"
            value="${state.buildingTeam.name}"
            onchange="window.updateTeamName(this.value)"
            style="width: 100%; padding: 12px; border: none; border-radius: 6px; background: rgba(255,255,255,0.08); color: #fff; font-size: 14px; box-sizing: border-box;"
          />
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; color: #7f8c8d; font-size: 12px; margin-bottom: 8px; letter-spacing: 1px;">ABBREVIATION</label>
          <input 
            type="text"
            id="team-abbreviation"
            value="${state.buildingTeam.abbreviation}"
            onchange="window.updateTeamAbbreviation(this.value)"
            style="width: 100%; padding: 12px; border: none; border-radius: 6px; background: rgba(255,255,255,0.08); color: #fff; font-size: 14px; box-sizing: border-box;"
          />
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button 
            onclick="window.saveBuildingTeam()"
            style="padding: 12px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; transition: all 0.2s;"
          >
            Save Team (CSV)
          </button>
          <button 
            onclick="window.loadTeamToSimulation('home')"
            style="padding: 12px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; background: rgba(52, 152, 219, 0.2); color: #3498db; transition: all 0.2s;"
          >
            Load as Home Team
          </button>
          <button 
            onclick="window.loadTeamToSimulation('away')"
            style="padding: 12px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; background: rgba(243, 156, 18, 0.2); color: #f39c12; transition: all 0.2s;"
          >
            Load as Away Team
          </button>
        </div>
      </div>
      
      <!-- Players -->
      <div style="background: rgba(255,255,255,0.05); padding: 25px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="color: #fff; margin: 0; font-size: 20px; font-weight: 600;">Players (${state.buildingTeam.players.length})</h3>
          <button 
            onclick="window.showAddPlayerForm()"
            style="padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; transition: all 0.2s;"
          >
            + Add Player
          </button>
        </div>
        
        ${state.buildingTeam.players.length === 0 ? `
          <div style="text-align: center; padding: 40px; background: rgba(255,255,255,0.03); border-radius: 8px;">
            <p style="color: #7f8c8d; font-size: 14px;">No players yet. Click \"Add Player\" to start building your team.</p>
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${state.buildingTeam.players.map((player, index) => `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 18px; background: rgba(255,255,255,0.03); border-radius: 8px;">
                <div style="min-width: 0;">
                  <div style="color: #fff; font-weight: 600; font-size: 16px; margin-bottom: 4px;">${player.name}</div>
                  <div style="color: #7f8c8d; font-size: 14px;">${player.position}</div>
                </div>
                <div style="display: flex; gap: 18px; align-items: center;">
                  <div style="text-align: center; min-width: 40px;">
                    <div style="color: #7f8c8d; font-size: 11px; margin-bottom: 2px;">SPD</div>
                    <div style="color: #fff; font-weight: 600; font-size: 15px;">${player.stats.speed}</div>
                  </div>
                  <div style="text-align: center; min-width: 40px;">
                    <div style="color: #7f8c8d; font-size: 11px; margin-bottom: 2px;">STR</div>
                    <div style="color: #fff; font-weight: 600; font-size: 15px;">${player.stats.strength}</div>
                  </div>
                  <div style="text-align: center; min-width: 40px;">
                    <div style="color: #7f8c8d; font-size: 11px; margin-bottom: 2px;">AGI</div>
                    <div style="color: #fff; font-weight: 600; font-size: 15px;">${player.stats.agility}</div>
                  </div>
                  ${player.stats.accuracy ? `
                    <div style="text-align: center; min-width: 40px;">
                      <div style="color: #7f8c8d; font-size: 11px; margin-bottom: 2px;">ACC</div>
                      <div style="color: #fff; font-weight: 600; font-size: 15px;">${player.stats.accuracy}</div>
                    </div>
                  ` : ''}
                  <button 
                    onclick="window.removePlayerFromBuildingTeam('${player.name}')"
                    style="padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; background: rgba(231, 76, 60, 0.2); color: #e74c3c; transition: all 0.2s; white-space: nowrap;"
                  >
                    Remove
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
    
    <!-- Add Player Form (hidden by default) -->
    <div id="add-player-form" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 1000; align-items: center; justify-content: center;">
      <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); max-width: 500px; width: 90%;">
        <h3 style="color: #fff; margin: 0 0 20px; font-size: 20px; font-weight: 600;">Add Player</h3>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; color: #7f8c8d; font-size: 12px; margin-bottom: 5px; letter-spacing: 1px;">NAME</label>
          <input 
            type="text"
            id="new-player-name"
            style="width: 100%; padding: 10px; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; background: rgba(255,255,255,0.05); color: #fff; font-size: 14px;"
          />
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; color: #7f8c8d; font-size: 12px; margin-bottom: 5px; letter-spacing: 1px;">POSITION</label>
          <select 
            id="new-player-position"
            style="width: 100%; padding: 10px; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; background: rgba(255,255,255,0.05); color: #fff; font-size: 14px;"
          >
            <option value="QB">QB (Quarterback)</option>
            <option value="RB">RB (Running Back)</option>
            <option value="WR">WR (Wide Receiver)</option>
            <option value="TE">TE (Tight End)</option>
            <option value="OL">OL (Offensive Lineman)</option>
            <option value="DL">DL (Defensive Lineman)</option>
            <option value="LB">LB (Linebacker)</option>
            <option value="CB">CB (Cornerback)</option>
            <option value="S">S (Safety)</option>
            <option value="K">K (Kicker)</option>
            <option value="P">P (Punter)</option>
          </select>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 15px;">
          <div>
            <label style="display: block; color: #7f8c8d; font-size: 12px; margin-bottom: 5px; letter-spacing: 1px;">SPEED</label>
            <input 
              type="number"
              id="new-player-speed"
              min="0"
              max="100"
              value="75"
              style="width: 100%; padding: 10px; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; background: rgba(255,255,255,0.05); color: #fff; font-size: 14px;"
            />
          </div>
          <div>
            <label style="display: block; color: #7f8c8d; font-size: 12px; margin-bottom: 5px; letter-spacing: 1px;">STRENGTH</label>
            <input 
              type="number"
              id="new-player-strength"
              min="0"
              max="100"
              value="75"
              style="width: 100%; padding: 10px; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; background: rgba(255,255,255,0.05); color: #fff; font-size: 14px;"
            />
          </div>
          <div>
            <label style="display: block; color: #7f8c8d; font-size: 12px; margin-bottom: 5px; letter-spacing: 1px;">AGILITY</label>
            <input 
              type="number"
              id="new-player-agility"
              min="0"
              max="100"
              value="75"
              style="width: 100%; padding: 10px; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; background: rgba(255,255,255,0.05); color: #fff; font-size: 14px;"
            />
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
          <div>
            <label style="display: block; color: #7f8c8d; font-size: 12px; margin-bottom: 5px; letter-spacing: 1px;">ACCURACY (QB/K)</label>
            <input 
              type="number"
              id="new-player-accuracy"
              min="0"
              max="100"
              value=""
              placeholder="Optional"
              style="width: 100%; padding: 10px; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; background: rgba(255,255,255,0.05); color: #fff; font-size: 14px;"
            />
          </div>
          <div>
            <label style="display: block; color: #7f8c8d; font-size: 12px; margin-bottom: 5px; letter-spacing: 1px;">POWER (K/P)</label>
            <input 
              type="number"
              id="new-player-power"
              min="0"
              max="100"
              value=""
              placeholder="Optional"
              style="width: 100%; padding: 10px; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; background: rgba(255,255,255,0.05); color: #fff; font-size: 14px;"
            />
          </div>
        </div>
        
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button 
            onclick="window.hideAddPlayerForm()"
            style="padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; background: rgba(255,255,255,0.1); color: #fff; transition: all 0.2s;"
          >
            Cancel
          </button>
          <button 
            onclick="window.confirmAddPlayer()"
            style="padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; transition: all 0.2s;"
          >
            Add Player
          </button>
        </div>
      </div>
    </div>
  `;
  
  return html;
}

// Teambuilder helper functions
(window as any).updateTeamName = (name: string) => {
  state.buildingTeam.name = name;
};

(window as any).updateTeamAbbreviation = (abbreviation: string) => {
  state.buildingTeam.abbreviation = abbreviation;
};

(window as any).showAddPlayerForm = () => {
  const form = document.getElementById('add-player-form');
  if (form) {
    form.style.display = 'flex';
  }
};

(window as any).hideAddPlayerForm = () => {
  const form = document.getElementById('add-player-form');
  if (form) {
    form.style.display = 'none';
  }
};

(window as any).confirmAddPlayer = () => {
  const name = (document.getElementById('new-player-name') as HTMLInputElement).value;
  const position = (document.getElementById('new-player-position') as HTMLSelectElement).value as GridironPlayer['position'];
  const speed = parseInt((document.getElementById('new-player-speed') as HTMLInputElement).value);
  const strength = parseInt((document.getElementById('new-player-strength') as HTMLInputElement).value);
  const agility = parseInt((document.getElementById('new-player-agility') as HTMLInputElement).value);
  const accuracy = (document.getElementById('new-player-accuracy') as HTMLInputElement).value;
  const power = (document.getElementById('new-player-power') as HTMLInputElement).value;
  
  const stats: GridironPlayer['stats'] = { speed, strength, agility };
  if (accuracy) stats.accuracy = parseInt(accuracy);
  if (power) stats.power = parseInt(power);
  
  const player = createPlayer({ name, position, stats });
  addPlayerToBuildingTeam(player);
  hideAddPlayerForm();
};

// Expose functions to window
(window as any).switchTab = switchTab;
(window as any).runSimulation = runSimulation;
(window as any).importTeam = importTeam;
(window as any).saveBuildingTeam = saveBuildingTeam;
(window as any).loadTeamToSimulation = loadTeamToSimulation;
(window as any).removePlayerFromBuildingTeam = removePlayerFromBuildingTeam;

// Initial render
render();
