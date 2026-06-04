# Relatório de Refatoração — Wizard Duel

Este documento descreve os problemas encontrados no código original e as decisões tomadas para adequar o projeto ao guia de estilo Airbnb (ESLint).

## 1. Problemas encontrados

### 1.1. Back-end (`index.js` original)

- **Números mágicos:** valores literais sem contexto (`100`, `8`, `90`, `85`, `20`, etc.) espalhados pelas rotas.
- **Nomes sem significado:** variáveis curtas como `d`, `r`, `tmp`, `c`, `a`, `obj`, `x`, `y`, `z`, `pw`, `mg`, `df`, `pg`.
- **Funções com múltiplas responsabilidades:** rotas `/api/pack`, `/api/cpu-deck` e `/api/spells` faziam `fetch` na PotterDB API, filtravam, calculavam atributos e embaralhavam tudo no mesmo handler.
- **Código duplicado:** o cálculo de atributos (`power`, `magic`, `defense`) e a lógica de embaralhamento estavam idênticos em `/api/pack` e `/api/cpu-deck`.
- **Code smells gerais:** `console.log` no tratamento de erros, ausência de constantes nomeadas.

### 1.2. Front-end (`index.html` original)

- ~470 linhas de CSS embutidas em `<style>` no `<head>`.
- ~400 linhas de JS embutidas em `<script>` antes de `</body>`.
- Uso de `var` em todas as declarações.
- Comparações com `==` em vez de `===` (ex.: `if (h == 'Gryffindor')`).
- Construção manual de HTML via concatenação de strings (`html += '<div class="card-img">'`).
- Atributos `onclick="confirmDraft()"`, `onclick="rerollPack()"`, etc. acoplando handlers diretamente ao HTML.
- Nomes opacos: `pIdx`, `cIdx`, `pDmg`, `pChar`, `cChar`, `x`, `y`, `z`.

## 2. Decisões tomadas durante a refatoração

### 2.1. Extração de constantes

Criado `constants.js` na raiz com todos os números mágicos nomeados em `UPPER_SNAKE_CASE`: `PORT`, `POTTER_API_URL`, `MAX_PAGES`, `PAGE_SIZE`, `PACK_SIZE`, `CPU_DECK_SIZE`, `SPELLS_COUNT`, `DEFAULT_HP_BASE`, `HP_RANDOM_MULTIPLIER`.

### 2.2. Renomeação semântica

Variáveis obscuras renomeadas em todo o back-end e front-end. Exemplos: `pg` → `randomPage`, `d`/`r` → `response`/`responseData`, `tmp` → `characterList`/`spellsList`, `a`/`c` → `attributes`/`character`, `pw`/`mg`/`df` → `power`/`magic`/`defense`, `pIdx`/`cIdx` → `playerActiveIndex`/`cpuActiveIndex`, `pDmg` → `playerDamage`.

### 2.3. Separação de responsabilidades (back-end)

- `services/potterApi.js`: comunicação com a PotterDB API (`fetchCharacters`, `fetchSpells`) e utilitário `shuffleArray` (Fisher–Yates).
- `services/statsCalculator.js`: funções puras `calculatePower`, `calculateMagic`, `calculateDefense`.
- `routes/characters.js`, `routes/spells.js`, `routes/game.js`: handlers Express, cada um responsável por um recurso.
- `index.js`: passa a apenas instanciar o Express, registrar middlewares e montar as rotas.

A duplicação entre `/api/pack` e `/api/cpu-deck` foi eliminada — ambas agora consomem os mesmos serviços.

### 2.4. Refatoração do front-end (Clean Code)

- Todo o CSS embutido em `<style>` foi movido para `public/css/style.css` e carregado via `<link rel="stylesheet" href="css/style.css">`.
- Todo o JS embutido em `<script>` foi removido e substituído por `<script type="module" src="js/game.js"></script>`.
- O código JS foi fatiado em três módulos ES:
  - `public/js/api.js` — chamadas `fetch` para o back-end local.
  - `public/js/render.js` — funções de renderização (cartas, badges, lista de feitiços, log de batalha).
  - `public/js/game.js` — estado, fluxo do jogo (draft, batalha, fim) e bindings de eventos.
- Todos os `var` foram trocados por `const`/`let`.
- Todas as comparações `==` foram trocadas por `===`.
- Concatenações de HTML (`html += '<div>' + x + '</div>'`) foram substituídas por **template literals** (`` `<div>${x}</div>` ``).
- Os atributos `onclick="..."` foram removidos do HTML; os bindings foram feitos em `game.js` via `addEventListener` (`btnConfirmDraft`, `btnNext`, `btnReroll`, `btnRestart`).

### 2.5. Configuração do ESLint

- `.eslintrc.json` configurado com `extends: airbnb-base`.
- A regra `linebreak-style` foi desabilitada para evitar erros de CRLF/LF em ambiente Windows.
- Foi adicionado um bloco `overrides` para os arquivos em `public/js/**/*.js`, definindo:
  - `env: { browser: true, node: false }` — resolve os erros `'document' is not defined` (no-undef).
  - `parserOptions: { sourceType: 'module', ecmaVersion: 2022 }` — habilita `import`/`export`.
  - `import/extensions` configurada como `['error', 'always', { ignorePackages: true }]` — módulos ES nativos do browser exigem extensão `.js` nos imports, regra que diverge do padrão Airbnb (que assume um bundler).

### 2.6. Histórico de commits

A refatoração foi dividida em commits por etapa, permitindo rastrear cada decisão:

1. `chore(eslint)`: configuração do ESLint Airbnb, overrides do front e desabilitação de `linebreak-style` para cross-platform.
2. `refactor(front)`: separação do CSS inline para `public/css/style.css`.
3. `refactor(front)`: separação do JS inline, módulos ES e `addEventListener`.
4. `style`: correção automática de trailing spaces, `eol-last` e limpeza de comentários obsoletos.

## 3. Verificação final

- `npm run lint` retorna **0 erros**.
- `npm start` inicia o servidor na porta 3000.
- Todas as telas do jogo (loading, draft, batalha, fim) continuam funcionando como antes da refatoração — nenhum comportamento visível foi alterado.