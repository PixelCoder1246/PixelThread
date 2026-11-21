const crypto = require('crypto');

class AICache {
  constructor(maxSize = 200, ttlMs = 15 * 60 * 1000) {
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
    this.cache = new Map();
  }

  generateKey(action, payload) {
    const serialized =
      typeof payload === 'object' ? JSON.stringify(payload) : String(payload);
    return `${action}:${crypto.createHash('sha256').update(serialized).digest('hex')}`;
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    // Refresh LRU position
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  clear() {
    this.cache.clear();
  }
}

module.exports = new AICache();
