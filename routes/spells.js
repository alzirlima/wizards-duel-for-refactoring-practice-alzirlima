const express = require('express');
const { fetchSpells, shuffleArray } = require('../services/potterApi');
const { SPELLS_COUNT } = require('../constants');

const router = express.Router();

// Função auxiliar para calcular o dano ou cura baseado na categoria do feitiço
const calculateDamage = (category) => {
  const damageMap = {
    Curse: 90,
    Hex: 65,
    Jinx: 55,
    Spell: 50,
    Charm: 45,
    Transfiguration: 40,
    'Counter-spell': 35,
    'Healing spell': -40, // Valores negativos representam cura no front-end
  };
  return damageMap[category] || 30; // 30 é o valor padrão caso a categoria não conste no mapa
};

router.get('/spells', async (req, res) => {
  try {
    const spellsData = await fetchSpells();
    const spellsList = [];

    spellsData.forEach((spell) => {
      const { attributes } = spell;
      
      // Ignora feitiços sem nome (mantendo a regra original)
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

    // Embaralha a lista e retorna apenas a quantidade definida nas constantes
    const shuffledSpells = shuffleArray(spellsList);
    res.json({ spells: shuffledSpells.slice(0, SPELLS_COUNT) });
  } catch (error) {
    console.error('Erro ao buscar feitiços:', error);
    res.status(500).json({ error: 'Erro interno ao buscar a lista de feitiços' });
  }
});

module.exports = router;