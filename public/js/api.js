export const fetchPackData = async () => {
  try {
    const response = await fetch('/api/pack');
    return await response.json();
  } catch (error) {
    return { cards: [] };
  }
};

export const fetchSpellsData = async () => {
  try {
    const response = await fetch('/api/spells');
    return await response.json();
  } catch (error) {
    return { spells: [] };
  }
};

export const fetchCpuDeckData = async () => {
  try {
    const response = await fetch('/api/cpu-deck', { method: 'POST' });
    return await response.json();
  } catch (error) {
    return { deck: [] };
  }
};