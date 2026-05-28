const express = require('express');
const { fetchCharacters, shuffleArray } = require('../services/potterApi');
const { calculatePower, calculateMagic, calculateDefense } = require('../services/statsCalculator');
const { CPU_DECK_SIZE, DEFAULT_HP_BASE, HP_RANDOM_MULTIPLIER } = require('../constants');

const router = express.Router();

router.post('/cpu-deck', async (req, res) => {
  try {
    const charactersData = await fetchCharacters();
    const characterList = [];

    charactersData.forEach((character) => {
      const { attributes } = character;

      if (!attributes.name || !attributes.image) return;

      const power = calculatePower(attributes.house);
      const magic = calculateMagic(attributes.species);
      const defense = calculateDefense(attributes.ancestry);
      
      const randomHp = Math.floor(Math.random() * HP_RANDOM_MULTIPLIER);
      const hitPoints = defense + randomHp + DEFAULT_HP_BASE;

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

    const shuffledDeck = shuffleArray(characterList);
    res.json({ deck: shuffledDeck.slice(0, CPU_DECK_SIZE) });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar o deck do adversário' });
  }
});

module.exports = router;