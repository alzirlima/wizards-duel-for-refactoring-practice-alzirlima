import { fetchPackData, fetchSpellsData, fetchCpuDeckData } from './api';
import {
  renderCardHtml,
  renderDeckBadges,
  renderSpellsList,
  logBattleMessage,
  setBattleStatus,
  showScreen,
  animateElement,
} from './render';

const GAME_CONFIG = {
  MAX_DRAFT_CARDS: 2,
  STARTING_SPELLS_COUNT: 5,
  BASE_DAMAGE_MODIFIER: 0.8,
  RANDOM_DAMAGE_MODIFIER: 0.4,
  DELAY_SHORT_MS: 400,
  DELAY_NORMAL_MS: 500,
  DELAY_HIT_MS: 600,
  DELAY_DEATH_MS: 700,
  DELAY_CPU_TURN_MS: 800,
};

const state = {
  phase: 'loading',
  pack: [],
  selectedCards: [],
  playerDeck: [],
  cpuDeck: [],
  spells: [],
  playerSpells: [],
  round: 1,
  scorePlayer: 0,
  scoreCpu: 0,
  isWaiting: false,
};

const sleep = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const toggleDraftCard = (index) => {
  const position = state.selectedCards.indexOf(index);
  if (position >= 0) {
    state.selectedCards.splice(position, 1);
  } else {
    if (state.selectedCards.length >= GAME_CONFIG.MAX_DRAFT_CARDS) return;
    state.selectedCards.push(index);
  }
  renderPackCards(); // eslint-disable-line no-use-before-define
};

const renderPackCards = () => {
  const grid = document.getElementById('packGrid');
  grid.innerHTML = '';
  
  state.pack.forEach((character, index) => {
    const isSelected = state.selectedCards.includes(index);
    const cardContainer = document.createElement('div');
    cardContainer.className = `card ${isSelected ? 'selected' : ''}`;
    cardContainer.innerHTML = renderCardHtml(character);
    cardContainer.setAttribute('data-idx', index);
    
    // Configurando evento limpo sem window/onclick
    cardContainer.addEventListener('click', () => {
      toggleDraftCard(index);
    });
    
    grid.appendChild(cardContainer);
  });
  
  document.getElementById('draftCount').textContent = state.selectedCards.length;
  
  const canConfirm = state.selectedCards.length >= GAME_CONFIG.MAX_DRAFT_CARDS;
  document.getElementById('btnConfirmDraft').disabled = !canConfirm;
};

const rerollPack = async () => {
  state.selectedCards = [];
  
  const rerollMessage = '<div style="text-align:center;padding:40px;'
    + 'color:var(--parchment-dark);grid-column:1/-1">Invocando novos bruxos...</div>';
  
  document.getElementById('packGrid').innerHTML = rerollMessage;
  const data = await fetchPackData();
  state.pack = data.cards;
  renderPackCards();
};

const confirmDraft = () => {
  if (state.selectedCards.length < GAME_CONFIG.MAX_DRAFT_CARDS) return;
  state.playerDeck = [
    state.pack[state.selectedCards[0]],
    state.pack[state.selectedCards[1]],
  ];
  startBattle(); // eslint-disable-line no-use-before-define
};

const getActiveCharacterIndex = (deck) => deck.findIndex((char) => char.hp > 0);

const castSpell = async (spellIndex) => {
  if (state.isWaiting) return;
  state.isWaiting = true;
  renderSpellsList(state.playerSpells, false);

  const spell = state.playerSpells[spellIndex];
  const pIdx = getActiveCharacterIndex(state.playerDeck);
  const cIdx = getActiveCharacterIndex(state.cpuDeck);
  const playerChar = state.playerDeck[pIdx];
  const cpuChar = state.cpuDeck[cIdx];

  const randomMod = Math.random() * GAME_CONFIG.RANDOM_DAMAGE_MODIFIER;
  const damageMultiplier = randomMod + GAME_CONFIG.BASE_DAMAGE_MODIFIER;
  const playerDamage = Math.floor(spell.damage * (playerChar.magic / 100) * damageMultiplier);

  if (spell.damage < 0) {
    const healAmount = Math.abs(playerDamage);
    playerChar.hp = Math.min(playerChar.maxHp, playerChar.hp + healAmount);
    const msgHeal = `✨ ${spell.name} — você curou ${healAmount} HP! `
      + `(${playerChar.name}: ${playerChar.hp} HP)`;
    logBattleMessage(msgHeal, 'heal');
    animateElement('battleCardP', 'battling', GAME_CONFIG.DELAY_NORMAL_MS);
  } else {
    cpuChar.hp -= playerDamage;
    const msgAtk = `⚡ ${spell.name} → ${cpuChar.name} perdeu ${playerDamage} HP! `
      + `(${cpuChar.name}: ${Math.max(0, cpuChar.hp)} HP)`;
    logBattleMessage(msgAtk, 'win');
    animateElement('battleCardC', 'hit', GAME_CONFIG.DELAY_HIT_MS);
  }

  await sleep(GAME_CONFIG.DELAY_CPU_TURN_MS);

  const cpuSpellIndex = Math.floor(Math.random() * state.spells.length);
  const cpuSpell = state.spells[cpuSpellIndex];
  const cpuRandomMod = Math.random() * GAME_CONFIG.RANDOM_DAMAGE_MODIFIER;
  const cpuMultiplier = cpuRandomMod + GAME_CONFIG.BASE_DAMAGE_MODIFIER;
  const cpuDamage = Math.floor(cpuSpell.damage * (cpuChar.magic / 100) * cpuMultiplier);

  if (cpuSpell.damage < 0) {
    const cpuHeal = Math.abs(cpuDamage);
    cpuChar.hp = Math.min(cpuChar.maxHp, cpuChar.hp + cpuHeal);
    const msgCpuHeal = `🧙 CPU: ${cpuSpell.name} — curou ${cpuHeal} HP! `
      + `(${cpuChar.name}: ${cpuChar.hp} HP)`;
    logBattleMessage(msgCpuHeal, 'heal');
    animateElement('battleCardC', 'battling', GAME_CONFIG.DELAY_NORMAL_MS);
  } else {
    playerChar.hp -= cpuDamage;
    const msgCpuAtk = `💀 CPU: ${cpuSpell.name} → ${playerChar.name} perdeu `
      + `${cpuDamage} HP! (${playerChar.name}: ${Math.max(0, playerChar.hp)} HP)`;
    logBattleMessage(msgCpuAtk, 'lose');
    animateElement('battleCardP', 'hit', GAME_CONFIG.DELAY_HIT_MS);
  }

  await sleep(GAME_CONFIG.DELAY_DEATH_MS);
  processTurnResults(); // eslint-disable-line no-use-before-define
};

const attachSpellListeners = () => {
  const buttons = document.querySelectorAll('.spell-btn');
  buttons.forEach((button) => {
    button.addEventListener('click', (event) => {
      const idx = event.currentTarget.getAttribute('data-spell-idx');
      castSpell(parseInt(idx, 10));
    });
  });
};

const renderBattleState = () => {
  const playerActiveIndex = getActiveCharacterIndex(state.playerDeck);
  const cpuActiveIndex = getActiveCharacterIndex(state.cpuDeck);

  if (playerActiveIndex < 0 || cpuActiveIndex < 0) {
    endGame(); // eslint-disable-line no-use-before-define
    return;
  }

  const playerChar = state.playerDeck[playerActiveIndex];
  const cpuChar = state.cpuDeck[cpuActiveIndex];

  document.getElementById('playerActiveName').textContent = playerChar.name;
  document.getElementById('cpuActiveName').textContent = cpuChar.name;

  const playerSlot = document.getElementById('playerCardSlot');
  const cpuSlot = document.getElementById('cpuCardSlot');

  playerSlot.innerHTML = `<div class="card battle-card" id="battleCardP">${renderCardHtml(playerChar)}</div>`;
  cpuSlot.innerHTML = `<div class="card battle-card" id="battleCardC">${renderCardHtml(cpuChar)}</div>`;

  renderDeckBadges(state.playerDeck, playerActiveIndex, 'playerDeckBadges');
  renderDeckBadges(state.cpuDeck, cpuActiveIndex, 'cpuDeckBadges');
  
  renderSpellsList(state.playerSpells, !state.isWaiting);
  attachSpellListeners();
};

const startBattle = () => {
  state.round = 1;
  state.scorePlayer = 0;
  state.scoreCpu = 0;
  state.isWaiting = false;

  document.getElementById('scoreP').textContent = '0';
  document.getElementById('scoreC').textContent = '0';
  document.getElementById('roundNum').textContent = '1';
  document.getElementById('battleLog').innerHTML = '';
  document.getElementById('btnNext').style.display = 'none';

  showScreen('screen-battle');
  renderBattleState();
  logBattleMessage('⚔ O duelo começou! Escolha um feitiço para atacar.');
  setBattleStatus('Escolha um feitiço para atacar!');
};

const processTurnResults = async () => {
  const playerActiveIndex = getActiveCharacterIndex(state.playerDeck);
  const cpuActiveIndex = getActiveCharacterIndex(state.cpuDeck);
  let isRoundOver = false;

  if (playerActiveIndex >= 0 && state.playerDeck[playerActiveIndex].hp <= 0) {
    logBattleMessage(`💀 ${state.playerDeck[playerActiveIndex].name} derrotado!`, 'lose');
    state.scoreCpu += 1;
    document.getElementById('scoreC').textContent = state.scoreCpu;
    isRoundOver = true;
  }
  
  if (cpuActiveIndex >= 0 && state.cpuDeck[cpuActiveIndex].hp <= 0) {
    logBattleMessage(`🏆 ${state.cpuDeck[cpuActiveIndex].name} derrotado!`, 'win');
    state.scorePlayer += 1;
    document.getElementById('scoreP').textContent = state.scorePlayer;
    isRoundOver = true;
  }

  renderBattleState();

  const isPlayerAlive = getActiveCharacterIndex(state.playerDeck) >= 0;
  const isCpuAlive = getActiveCharacterIndex(state.cpuDeck) >= 0;

  if (!isPlayerAlive || !isCpuAlive) {
    await sleep(GAME_CONFIG.DELAY_CPU_TURN_MS);
    endGame(); // eslint-disable-line no-use-before-define
    return;
  }

  state.isWaiting = false;

  if (isRoundOver) {
    state.round += 1;
    document.getElementById('roundNum').textContent = state.round;
    logBattleMessage(`— Rodada ${state.round} —`);
  }

  setBattleStatus('Escolha um feitiço para atacar!');
  renderSpellsList(state.playerSpells, true);
  attachSpellListeners();
};

const nextRound = () => {
  document.getElementById('btnNext').style.display = 'none';
  state.round += 1;
  document.getElementById('roundNum').textContent = state.round;
  logBattleMessage(`— Rodada ${state.round} —`);
  state.isWaiting = false;
  renderBattleState();
  setBattleStatus('Escolha um feitiço para atacar!');
};

const endGame = () => {
  const overScreen = document.getElementById('screen-over');
  const glyph = document.getElementById('overGlyph');
  const title = document.getElementById('overTitle');
  const sub = document.getElementById('overSub');
  const score = document.getElementById('overScore');

  if (state.scorePlayer > state.scoreCpu) {
    glyph.textContent = '🏆';
    title.textContent = 'Vitória!';
    sub.textContent = 'Você dominou o duelo!';
  } else if (state.scoreCpu > state.scorePlayer) {
    glyph.textContent = '💀';
    title.textContent = 'Derrota';
    sub.textContent = 'O CPU foi mais poderoso desta vez.';
  } else {
    glyph.textContent = '✦';
    title.textContent = 'Empate';
    sub.textContent = 'Bruxos igualmente poderosos.';
  }
  
  score.textContent = `Você ${state.scorePlayer}  ×  ${state.scoreCpu} CPU`;
  overScreen.classList.add('active');
};

const loadGame = async () => {
  const bar = document.getElementById('loadBar');
  const msgElement = document.getElementById('loadMsg');

  msgElement.textContent = 'Invocando personagens...';
  bar.style.width = '20%';

  const packData = await fetchPackData();
  state.pack = packData.cards || [];

  bar.style.width = '55%';
  msgElement.textContent = 'Consultando o livro de feitiços...';

  const spellData = await fetchSpellsData();
  state.spells = spellData.spells || [];

  bar.style.width = '85%';
  msgElement.textContent = 'Preparando o adversário...';

  const cpuData = await fetchCpuDeckData();
  state.cpuDeck = cpuData.deck || [];

  const shuffledSpells = shuffleArray(state.spells);
  state.playerSpells = shuffledSpells.slice(0, GAME_CONFIG.STARTING_SPELLS_COUNT);

  bar.style.width = '100%';
  msgElement.textContent = 'Pronto!';

  setTimeout(() => {
    document.getElementById('screen-loading').classList.add('fade-out');
    setTimeout(() => {
      document.getElementById('screen-loading').style.display = 'none';
      showScreen('screen-draft');
      renderPackCards();
    }, GAME_CONFIG.DELAY_HIT_MS);
  }, GAME_CONFIG.DELAY_SHORT_MS);
};

const restartGame = () => {
  document.getElementById('screen-over').classList.remove('active');
  state.selectedCards = [];
  state.pack = [];
  state.playerDeck = [];

  const loadingElement = document.getElementById('screen-loading');
  loadingElement.style.display = 'flex';
  loadingElement.classList.remove('fade-out');
  document.getElementById('loadBar').style.width = '0%';
  
  showScreen('');
  loadGame();
};

// Vinculando eventos nativamente (Sem usar global window ou onclick no HTML)
document.getElementById('btnConfirmDraft').addEventListener('click', confirmDraft);
document.getElementById('btnNext').addEventListener('click', nextRound);

// Note que o HTML possui botões cujo id precisará corresponder a estes:
// Crie/Adicione id="btnReroll" no HTML: <button id="btnReroll" class="btn">🎲 Novo Pack</button>
const btnReroll = document.getElementById('btnReroll');
if (btnReroll) btnReroll.addEventListener('click', rerollPack);

// Crie/Adicione id="btnRestart" no HTML: <button id="btnRestart" class="btn btn-lg">⚡ Jogar Novamente</button>
const btnRestart = document.getElementById('btnRestart');
if (btnRestart) btnRestart.addEventListener('click', restartGame);

loadGame();