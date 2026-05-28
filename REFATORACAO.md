1. Configuração do eslint airbnb realizada no projeto node.
2. 400+ erros corrigidos automaticamente após a aplicação do comando "eslint . --fix".
3. Criação desse arquivo (REFATORACAO.md) para registrar o passo a passo, lista de problemas encontrados e decisões tomadas durante a refatoração.
4. O seguinte prompt foi enviado ao Google Gemini (junto com o index.html, index.js e o .pdf contendo a explicação do trabalho):
"Estou precisando da sua ajuda para a resolução de um trabalho de faculdade. Estou cursando Análise e Desenvolvimento de Sistemas, e na disciplina de Ambientes de Desenvolvimento de Software, está sendo solicitado que eu faça a refatoração de uma aplicação Node, de acordo com o .pdf que estou te enviando.

Estou te enviando os arquivos index.html e index.js para que possamos refatorar/reorganizar esses códigos de acordo com as etapas solicitadas no .pdf.

O arquivo REFATORACAO.md já foi criado e preciso que você me ajude a descrever nele tudo o que foi feito para refatorar esse projeto, de acordo com o solicitado, por etapas e decisões. "

5. O prompt retornou a seguinte refatoração, cujo o passo a passo será descrito nesse markdown a partir de agora:

# Relatório de Refatoração - Wizard Duel

Este documento detalha os problemas identificados no código original e as decisões arquiteturais e de formatação tomadas para adequar o projeto ao padrão de qualidade exigido, utilizando o guia de estilo da Airbnb (ESLint).

## 1. Lista de Problemas Encontrados

Durante a análise inicial do código (`index.js` e `index.html`), foram identificados os seguintes problemas:

* **Números Mágicos:** Valores literais espalhados pelo back-end (ex: `100`, `8`, `90`, `85`, `20`) sem contexto claro, dificultando a manutenção.
* **Nomes Sem Significado:** Uso de variáveis de uma letra ou abreviações não semânticas (`d`, `r`, `tmp`, `c`, `a`, `obj`, `x`, `y`, `z`, `pw`, `mg`, `df`, `pg`), o que prejudicava a legibilidade.
* **Funções com Múltiplas Responsabilidades:** As rotas Express (`/api/pack`, `/api/cpu-deck` e `/api/spells`) acumulavam as responsabilidades de fazer fetch na API externa, calcular atributos e embaralhar arrays.
* **Código Duplicado (DRY):** A lógica de cálculo de atributos de personagens e a lógica de embaralhamento de arrays estavam idênticas e repetidas nas rotas `/api/pack` e `/api/cpu-deck`.
* **Code Smells Gerais:**
    * Uso excessivo de `var` no front-end em vez de escopos de bloco (`let`/`const`).
    * Criação de elementos HTML no front-end utilizando concatenação manual de strings (`+`), tornando o código frágil e de difícil leitura.
    * Comparações não estritas (`==` no lugar de `===`), abrindo margem para bugs de coerção de tipo.
    * Tratamento de erros genérico com `console.log` no back-end.

## 2. Decisões Tomadas Durante a Refatoração

Para sanar os problemas relatados e seguir estritamente o guia da Airbnb, as seguintes decisões foram implementadas:

### 2.1. Extração de Constantes
* Criado o arquivo `constants.js` na raiz do projeto.
* Movidos todos os números mágicos para constantes nomeadas em `UPPER_SNAKE_CASE` (ex: `PACK_SIZE`, `SPELLS_COUNT`, `MAX_PAGES`, `DEFAULT_HP_BASE`).

### 2.2. Renomeação Semântica
* Variáveis obscuras foram renomeadas para refletir seu propósito real. 
    * `pg` virou `randomPage`
    * `d` e `r` viraram `response` e `responseData`
    * `tmp` virou `characterList` ou `spellsList`
    * `a` e `c` viraram `attributes` e `character`

### 2.3. Separação de Responsabilidades (Back-end)
* **Serviços (`/services`):** * A comunicação com a PotterDB API foi isolada em `potterApi.js`.
    * A lógica repetida de cálculo de atributos (`power`, `magic`, `defense`) foi abstraída e isolada em `statsCalculator.js`.
* **Utilitários:** A função de embaralhamento (Fisher-Yates) foi extraída para uma função utilitária reutilizável, eliminando a duplicação.
* **Rotas (`/routes`):** As rotas foram divididas em arquivos específicos (`characters.js`, `spells.js`, `game.js`).
* **Inicialização:** O `index.js` agora serve apenas para instanciar o Express e conectar os middlewares e rotas.

### 2.4. Refatoração do Front-end (Clean Code)
* O arquivo `index.html` foi limpo. O CSS embutido foi movido para `public/css/style.css`.
* O script principal foi fatiado e movido para a pasta `public/js/`:
    * `api.js`: Lida exclusivamente com os `fetches` para o back-end local.
    * `render.js`: Concentra as funções de criação de interface.
    * `game.js`: Controla o estado global da aplicação e a lógica do duelo.
* Todas as declarações `var` foram substituídas por `let` ou `const`.
* As concatenações de HTML (ex: `'<div class="card">' + char.name + '</div>'`) foram substituídas por **Template Literals** (\`<div class="card">\${char.name}</div>\`), melhorando drasticamente a legibilidade.
* Comparações (`==`) foram atualizadas para igualdade estrita (`===`).