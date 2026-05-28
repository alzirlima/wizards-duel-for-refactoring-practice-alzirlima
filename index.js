const express = require('express');
const { PORT } = require('./constants');
const charactersRoute = require('./routes/characters');
const spellsRoute = require('./routes/spells');
const gameRoute = require('./routes/game');

const app = express();

app.use(express.static('public'));
app.use(express.json());

app.use('/api', charactersRoute);
app.use('/api', spellsRoute);
app.use('/api', gameRoute);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});