const { MAX_INPUT_LENGTH } = require('./ai.constants');

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim()
    .substring(0, MAX_INPUT_LENGTH);
};

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'string' ? sanitizeInput(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

const parseAIResponse = (response) => {
  if (!response || !response.choices || response.choices.length === 0) {
    throw new Error('Empty AI response received');
  }
  return response.choices[0].message.content;
};

const tryParse = (str) => {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
};

const extractBalancedBlock = (text, startPos) => {
  const ch = text[startPos];
  if (ch !== '{' && ch !== '[') return null;

  const openChar = ch;
  const closeChar = ch === '{' ? '}' : ']';
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = startPos; i < text.length; i++) {
    const c = text[i];

    if (escaped) {
      escaped = false;
      continue;
    }
    if (c === '\\' && inString) {
      escaped = true;
      continue;
    }
    if (c === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (c === openChar) depth++;
    else if (c === closeChar) {
      depth--;
      if (depth === 0) return text.slice(startPos, i + 1);
    }
  }

  return null;
};

const extractJSON = (text) => {
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid AI response text');
  }

  const cleaned = text.trim();
  if (!cleaned) throw new Error('No JSON object or array found in AI response');

  // Strategy 1: Try parsing the entire cleaned text
  let result = tryParse(cleaned);
  if (result) return result;

  // Strategy 2: Try extracting from markdown code blocks
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  if (codeBlockMatch) {
    result = tryParse(codeBlockMatch[1].trim());
    if (result) return result;
  }

  // Strategy 3: Find all balanced JSON blocks, try from end first (JSON typically after reasoning)
  const allStarts = [];
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === '{' || cleaned[i] === '[') {
      allStarts.push(i);
    }
  }

  // Try blocks in reverse (end of response is most likely to contain valid JSON)
  for (let idx = allStarts.length - 1; idx >= 0; idx--) {
    const pos = allStarts[idx];
    const block = extractBalancedBlock(cleaned, pos);
    if (!block) continue;

    result = tryParse(block);
    if (result) return result;

    const repaired = repairJSON(block);
    result = tryParse(repaired);
    if (result) return result;
  }

  const logger = require('../../config/logger');
  logger.warn('No parseable JSON found in AI response', {
    preview: cleaned.slice(0, 500),
  });
  throw new Error('No JSON object or array found in AI response');
};

const repairJSON = (raw) => {
  let depth = 0;
  let inString = false;
  let escaped = false;
  let result = '';

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];

    if (escaped) {
      result += ch;
      escaped = false;
      continue;
    }

    if (ch === '\\' && inString) {
      result += ch;
      escaped = true;
      continue;
    }

    if (ch === '"' && !inString) {
      inString = true;
      result += ch;
      continue;
    }

    if (ch === '"' && inString) {
      let lookahead = i + 1;
      while (
        lookahead < raw.length &&
        (raw[lookahead] === ' ' ||
          raw[lookahead] === '\t' ||
          raw[lookahead] === '\n' ||
          raw[lookahead] === '\r')
      ) {
        lookahead++;
      }
      if (
        lookahead < raw.length &&
        (raw[lookahead] === ',' ||
          raw[lookahead] === '}' ||
          raw[lookahead] === ']' ||
          raw[lookahead] === ':')
      ) {
        inString = false;
        result += ch;
        continue;
      }
      result += '\\"';
      continue;
    }

    if (ch === '\n' && inString) {
      result += '\\n';
      continue;
    }

    if (ch === '\r' && inString) {
      result += '\\r';
      continue;
    }

    if (ch === '\t' && inString) {
      result += '\\t';
      continue;
    }

    result += ch;
  }

  return result;
};

const buildTokenUsage = (response, model, startTime) => {
  const endTime = Date.now();
  return {
    model: model || response.model || 'unknown',
    promptTokens: response.usage?.prompt_tokens || 0,
    completionTokens: response.usage?.completion_tokens || 0,
    totalTokens: response.usage?.total_tokens || 0,
    responseTime: `${endTime - startTime}ms`,
    finishReason: response.choices?.[0]?.finish_reason || 'unknown',
  };
};

module.exports = {
  sanitizeInput,
  sanitizeObject,
  parseAIResponse,
  extractJSON,
  buildTokenUsage,
};
