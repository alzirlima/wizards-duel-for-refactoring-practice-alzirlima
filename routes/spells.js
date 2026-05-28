const express = require('express');
const { fetchSpells, shuffleArray } = require('../services/potterApi');
const { SPELLS_COUNT } = require('../constants');

const router = express.Router();

const calculateDamage = (category) => {
  const damageMap = {
    Curse: 90,
    Hex: 65,
    Jinx: 55,
    Spell: 50,
    Charm: 45,
    Transfiguration: 40,
    'Counter-spell': 35,
    'Healing spell': -40,
  };
  return damageMap[category] || 30;
};

router.get('/spells', async (req, res) => {
  try {
    const spellsData = await fetchSpells();
    const spellsList = [];

    spellsData.forEach((spell) => {
      const { attributes } = spell;

      if (!attributes.name) return;

      const damage = calculateDamage(attributes.category);

      spellsList.push({
        id: spell.id,
        name: attributes.name,
        effect: attributes.effect || 'Efeito desconhecido',
        category: attributes.category || 'Spell',
        light: attributes.light || 'Unknown',
        damage,
      });
    });

    const shuffledSpells = shuffleArray(spellsList);
    res.json({ spells: shuffledSpells.slice(0, SPELLS_COUNT) });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar feitiços' });
  }
});

module.exports = router;