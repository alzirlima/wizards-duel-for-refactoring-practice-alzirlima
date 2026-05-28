const getHouseColor = (house) => {
  const houseColors = {
    Gryffindor: '#6b1010',
    Slytherin: '#0a3018',
    Hufflepuff: '#3a2800',
    Ravenclaw: '#0a1a3a',
  };
  return houseColors[house] || '#1e1040';
};

const getHouseEmoji = (house) => {
  const houseEmojis = {
    Gryffindor: '🦁',
    Slytherin: '🐍',
    Hufflepuff: '🦡',
    Ravenclaw: '🦅',
  };
  return houseEmojis[house] || '✦';
};

const getHpColor = (hpPct) => {
  if (hpPct > 0.6) return 'linear-gradient(90deg,#0a4a2a,#22cc77)';
  if (hpPct > 0.3) return 'linear-gradient(90deg,#4a3a00,#ccaa22)';
  return 'linear-gradient(90deg,#4a0a0a,#cc2222)';
};

export const logBattleMessage = (message, type = 'info') => {
  const logContainer = document.getElementById('battleLog');
  const logEntry = document.createElement('span');
  logEntry.className = `log-entry ${type}`;
  logEntry.textContent = message;
  logContainer.appendChild(logEntry);
  logContainer.scrollTop = logContainer.scrollHeight;
};

export const setBattleStatus = (message) => {
  document.getElementById('battleStatus').textContent = message;
};

export const showScreen = (screenId) => {
  document.querySelectorAll('.screen').forEach((screen) => {
    screen.classList.remove('active');
  });
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add('active');
  }
};

export const animateElement = (elementId, className, durationMs) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.add(className);
    setTimeout(() => {
      element.classList.remove(className);
    }, durationMs);
  }
};

export const renderCardHtml = (character) => {
  const healthPercentage = character.hp / character.maxHp;
  const houseColor = getHouseColor(character.house);
  const houseEmoji = getHouseEmoji(character.house);
  
  const fallback = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/'
    + 'ac/No_image_available.svg/300px-No_image_available.svg.png';

  return `
    <div class="card-img">
      <img src="${character.image}" alt="${character.name}" onerror="this.src='${fallback}'">
      <div class="house-badge" style="background:${houseColor}">${houseEmoji}</div>
    </div>
    <div class="card-body">
      <div class="card-name">${character.name}</div>
      <div class="card-meta">${character.species} · ${character.house}</div>
      <div class="hp-bar-wrap">
        <span class="hp-label">HP</span>
        <div class="hp-track">
          <div class="hp-fill" style="width:${Math.max(0, healthPercentage * 100)}%;background:${getHpColor(healthPercentage)}"></div>
        </div>
        <span class="hp-val">${Math.max(0, character.hp)}/${character.maxHp}</span>
      </div>
      <div class="mini-stats">
        <div class="mini-stat">
          <span class="mini-stat-icon">⚡</span>
          <span class="mini-stat-val">${character.power}</span>
          <span class="mini-stat-lbl">Poder</span>
        </div>
        <div class="mini-stat">
          <span class="mini-stat-icon">🔮</span>
          <span class="mini-stat-val">${character.magic}</span>
          <span class="mini-stat-lbl">Magia</span>
        </div>
        <div class="mini-stat">
          <span class="mini-stat-icon">🛡</span>
          <span class="mini-stat-val">${character.defense}</span>
          <span class="mini-stat-lbl">Defesa</span>
        </div>
      </div>
    </div>
  `;
};

export const renderDeckBadges = (deck, activeIndex, elementId) => {
  const container = document.getElementById(elementId);
  const fallback = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png';

  const badgesHtml = deck.map((character, index) => {
    let badgeClass = 'deck-thumb';
    if (character.hp <= 0) {
      badgeClass = 'deck-thumb dead';
    } else if (index === activeIndex) {
      badgeClass = 'deck-thumb active';
    }
    return `<div class="${badgeClass}"><img src="${character.image}" onerror="this.src='${fallback}'"></div>`;
  }).join('');

  container.innerHTML = badgesHtml;
};

export const renderSpellsList = (spells, isEnabled) => {
  const spellContainer = document.getElementById('spellList');
  
  const spellsHtml = spells.map((spell, index) => {
    const isHeal = spell.damage < 0;
    const dmgLabel = isHeal ? `💚 +${Math.abs(spell.damage)} HP` : `💀 ${spell.damage} dmg`;
    const dmgClass = isHeal ? 'spell-dmg heal' : 'spell-dmg attack';
    const disabledAttr = isEnabled ? '' : 'disabled';
    
    // Substituimos o onclick direto pelo atributo data-spell-idx
    return `
      <button class="spell-btn" data-spell-idx="${index}" ${disabledAttr}>
        <div>
          <span class="spell-name">${spell.name}</span>
          <span class="spell-effect">${spell.effect}</span>
        </div>
        <span class="${dmgClass}">${dmgLabel}</span>
      </button>
    `;
  }).join('');

  spellContainer.innerHTML = spellsHtml;
};