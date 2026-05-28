const express = require('express');
const { fetchCharacters, shuffleArray } = require('../services/potterApi');
const { calculatePower, calculateMagic, calculateDefense } = require('../services/statsCalculator');
const { PACK_SIZE, DEFAULT_HP_BASE, HP_RANDOM_MULTIPLIER } = require('../constants');

const router = express.Router();

router.get('/pack', async (req, res) => {
  try {
    const charactersData = await fetchCharacters();
    const characterList = [];

    charactersData.forEach((character) => {
      const { attributes } = character;
      if (!attributes.name || !attributes.image) return;

      const power = calculatePower(attributes.house);
      const magic = calculateMagic(attributes.species);
      const defense = calculateDefense(attributes.ancestry);
      const hitPoints = defense + Math.floor(Math.random() * HP_RANDOM_MULTIPLIER) + DEFAULT_HP_BASE;

      characterList.push({
        id: character.id,
        name: attributes.name,
        house: attributes.house || 'Unknown',
        species: attributes.species || 'Unknown',
        ancestry: attributes.ancestry || 'Unknown',
        image: attributes.image,
        power,
        magic,
        defense,
        hp: hitPoints,
        maxHp: hitPoints,
      });
    });

    const shuffledCharacters = shuffleArray(characterList);
    res.json({ cards: shuffledCharacters.slice(0, PACK_SIZE) });
  } catch (error) {
    console.error('Erro ao buscar personagens:', error);
    res.status(500).json({ error: 'Erro interno ao buscar o pack de personagens' });
  }
});

module.exports = router;