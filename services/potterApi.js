const fetch = require('node-fetch');
const { POTTER_API_URL, MAX_PAGES, PAGE_SIZE } = require('../constants');

const fetchCharacters = async () => {
  const randomPage = Math.floor(Math.random() * MAX_PAGES) + 1;
  const response = await fetch(`${POTTER_API_URL}/characters?page[size]=${PAGE_SIZE}&page[number]=${randomPage}`);
  const responseData = await response.json();
  return responseData.data;
};

const fetchSpells = async () => {
  const response = await fetch(`${POTTER_API_URL}/spells?page[size]=${PAGE_SIZE}`);
  const responseData = await response.json();
  return responseData.data;
};

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

module.exports = {
  fetchCharacters,
  fetchSpells,
  shuffleArray,
};
