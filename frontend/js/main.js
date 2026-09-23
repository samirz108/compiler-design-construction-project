const sampleCode = `
int count = 0;
if (count < 5) {
    count = count + 1;
}
`;

const sourceCode = document.getElementById('sourceCode');
const tokenList = document.getElementById('tokenList');
const errorList = document.getElementById('errorList');
const symbolTable = document.getElementById('symbolTable');
const lexStatus = document.getElementById('lexStatus');
const syntaxStatus = document.getElementById('syntaxStatus');
const semanticStatus = document.getElementById('semanticStatus');
const overallStatus = document.getElementById('overallStatus');

function updateStatus(element, label, type) {
  element.textContent = label;
  element.className = `status ${type}`;
}

function renderList(target, items, emptyMessage) {
  target.innerHTML = '';

  if (!items.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = emptyMessage;
    target.appendChild(li);
    return;
  }

  items.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    target.appendChild(li);
  });
}

function tokenizeCode(text) {
  const tokens = [];
  const pattern = /(==|!=|>=|<=|[=+\-*/<>;(){}])|\b(?:int|float|string|bool|if|while)\b|\b[A-Za-z_][A-Za-z0-9_]*\b|\b\d+(?:\.\d+)?\b/g;

  const matches = text.match(pattern) || [];

  matches.forEach((match) => {
    const trimmed = match.trim();
    if (!trimmed) {
      return;
    }

    if (/^(int|float|string|bool|if|while)$/.test(trimmed)) {
      tokens.push({ type: 'keyword', value: trimmed });
      return;
    }

    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(trimmed)) {
      tokens.push({ type: 'identifier', value: trimmed });
      return;
    }

    if (/^\d+(?:\.\d+)?$/.test(trimmed)) {
      tokens.push({ type: 'number', value: trimmed });
      return;
    }

    if (/^(==|!=|>=|<=|[=+\-*/<>;(){}])$/.test(trimmed)) {
      tokens.push({ type: 'operator', value: trimmed });
      return;
    }

    tokens.push({ type: 'unknown', value: trimmed });
  });

  return tokens;
}

function analyzeSyntax(tokens) {
  const errors = [];

  if (!tokens.length) {
    errors.push('No source code entered.');
    return { valid: false, errors };
  }

  const hasKeyword = tokens.some((token) => token.type === 'keyword');
  const hasIdentifier = tokens.some((token) => token.type === 'identifier');

  if (!hasKeyword && !hasIdentifier) {
    errors.push('No valid statements were detected.');
  }

  const unknownTokens = tokens.filter((token) => token.type === 'unknown');
  if (unknownTokens.length > 0) {
    errors.push(`Unexpected token(s): ${unknownTokens.map((token) => token.value).join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function analyzeSemantics(tokens) {
  const errors = [];
  const symbols = new Map();

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];

    if (token.type === 'keyword' && ['int', 'float', 'string', 'bool'].includes(token.value)) {
      const nextToken = tokens[i + 1];
      if (!nextToken || nextToken.type !== 'identifier') {
        errors.push(`Missing variable name after ${token.value}.`);
        continue;
      }

      const name = nextToken.value;
      if (symbols.has(name)) {
        errors.push(`Duplicate declaration for '${name}'.`);
      } else {
        symbols.set(name, token.value);
      }
    }

    if (token.type === 'identifier') {
      const nextToken = tokens[i + 1];
      if (nextToken && nextToken.value === '=') {
        if (!symbols.has(token.value)) {
          errors.push(`Variable '${token.value}' is used before declaration.`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    symbols: Array.from(symbols.entries()).map(([name, type]) => `${name}: ${type}`),
  };
}

function showLocalAnalysis(text) {
  const tokens = tokenizeCode(text);
  const lexicalErrors = tokens.filter((token) => token.type === 'unknown');

  const syntaxResult = analyzeSyntax(tokens);
  const semanticResult = analyzeSemantics(tokens);

  const lexicalValid = lexicalErrors.length === 0;
  const lexicalMessage = lexicalValid ? 'OK' : 'ERROR';
  const syntaxMessage = syntaxResult.valid ? 'OK' : 'ERROR';
  const semanticMessage = semanticResult.valid ? 'OK' : 'ERROR';

  updateStatus(lexStatus, lexicalMessage, lexicalValid ? 'ok' : 'error');
  updateStatus(syntaxStatus, syntaxMessage, syntaxResult.valid ? 'ok' : 'error');
  updateStatus(semanticStatus, semanticMessage, semanticResult.valid ? 'ok' : 'error');

  const overallType = lexicalValid && syntaxResult.valid && semanticResult.valid ? 'ok' : 'warning';
  const overallLabel = lexicalValid && syntaxResult.valid && semanticResult.valid ? 'Ready' : 'Needs Review';
  updateStatus(overallStatus, overallLabel, overallType);

  const tokenNames = tokens.map((token) => `${token.type}:${token.value}`);
  renderList(tokenList, tokenNames, 'No tokens recognized');

  const errorMessages = [];
  if (lexicalErrors.length > 0) {
    errorMessages.push(`Lexical: ${lexicalErrors.map((token) => token.value).join(', ')}`);
  }
  if (!syntaxResult.valid) {
    errorMessages.push(...syntaxResult.errors.map((message) => `Syntax: ${message}`));
  }
  if (!semanticResult.valid) {
    errorMessages.push(...semanticResult.errors.map((message) => `Semantic: ${message}`));
  }

  if (!errorMessages.length) {
    errorMessages.push('No errors found in the current sample.');
  }

  renderList(errorList, errorMessages, 'No errors');
  renderList(symbolTable, semanticResult.symbols, 'No symbols declared');
}

function showApiAnalysis(data) {
  const tokens = Array.isArray(data.tokens) ? data.tokens : [];
  const lexicalErrors = Array.isArray(data.lexicalErrors) ? data.lexicalErrors : [];
  const syntaxErrors = Array.isArray(data.syntaxErrors) ? data.syntaxErrors : [];
  const semanticErrors = Array.isArray(data.semanticErrors) ? data.semanticErrors : [];
  const symbols = Array.isArray(data.symbols) ? data.symbols : [];

  updateStatus(lexStatus, lexicalErrors.length ? 'ERROR' : 'OK', lexicalErrors.length ? 'error' : 'ok');
  updateStatus(syntaxStatus, syntaxErrors.length ? 'ERROR' : 'OK', syntaxErrors.length ? 'error' : 'ok');
  updateStatus(semanticStatus, semanticErrors.length ? 'ERROR' : 'OK', semanticErrors.length ? 'error' : 'ok');

  const overallType = lexicalErrors.length || syntaxErrors.length || semanticErrors.length ? 'warning' : 'ok';
  const overallLabel = lexicalErrors.length || syntaxErrors.length || semanticErrors.length ? 'Needs Review' : 'Ready';
  updateStatus(overallStatus, overallLabel, overallType);

  renderList(tokenList, tokens, 'No tokens recognized');

  const errorMessages = [];
  if (lexicalErrors.length > 0) errorMessages.push(...lexicalErrors.map((item) => `Lexical: ${item}`));
  if (syntaxErrors.length > 0) errorMessages.push(...syntaxErrors.map((item) => `Syntax: ${item}`));
  if (semanticErrors.length > 0) errorMessages.push(...semanticErrors.map((item) => `Semantic: ${item}`));
  if (errorMessages.length === 0) errorMessages.push('No errors found in the current sample.');

  renderList(errorList, errorMessages, 'No errors');
  renderList(symbolTable, symbols, 'No symbols declared');
}

function analyzeCode() {
  const text = sourceCode.value.trim();

  if (!text) {
    updateStatus(lexStatus, 'EMPTY', 'warning');
    updateStatus(syntaxStatus, 'EMPTY', 'warning');
    updateStatus(semanticStatus, 'EMPTY', 'warning');
    updateStatus(overallStatus, 'Waiting', 'warning');
    renderList(tokenList, [], 'No tokens yet');
    renderList(errorList, ['Enter source code to begin analysis.'], '');
    renderList(symbolTable, [], 'No symbols yet');
    return;
  }

  updateStatus(overallStatus, 'Connecting...', 'warning');

  fetch('http://localhost:8080/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ source: text })
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Compiler API unavailable');
      }
      return response.json();
    })
    .then((data) => {
      showApiAnalysis(data);
    })
    .catch(() => {
      showLocalAnalysis(text);
    });
}

function loadSample() {
  sourceCode.value = sampleCode.trim();
  analyzeCode();
}

function clearCode() {
  sourceCode.value = '';
  analyzeCode();
}

document.getElementById('analyzeBtn').addEventListener('click', analyzeCode);
document.getElementById('loadSampleBtn').addEventListener('click', loadSample);
document.getElementById('clearBtn').addEventListener('click', clearCode);

loadSample();
