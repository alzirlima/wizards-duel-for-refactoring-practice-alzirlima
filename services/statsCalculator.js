const { DEFAULT_STAT_VALUE } = require('../constants');

const calculatePower = (house) => {
  const powerMap = {
    Gryffindor: 90,
    Slytherin: 85,
    Hufflepuff: 75,
    Ravenclaw: 80,
  };
  return powerMap[house] || DEFAULT_STAT_VALUE;
};

const calculateMagic = (species) => {
  const magicMap = {
    human: 70,
    'half-giant': 88,
    giant: 95,
    'house elf': 82,
    ghost: 60,
    werewolf: 91,
    vampire: 87,
    centaur: 78,
  };
  return magicMap[species] || DEFAULT_STAT_VALUE;
};

const calculateDefense = (ancestry) => {
  const defenseMap = {
    'pure-blood': 90,
    'half-blood': 75,
    'muggle-born': 70,
    muggle: 40,
    squib: 35,
  };
  return defenseMap[ancestry] || DEFAULT_STAT_VALUE;
};

module.exports = {
  calculatePower,
  calculateMagic,
  calculateDefense,
};
