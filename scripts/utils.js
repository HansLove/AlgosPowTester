// Utility functions and helpers
export const $ = (sel) => document.querySelector(sel);
export const $$ = (sel) => document.querySelectorAll(sel);

// Formatting utilities
export const fmt = {
  number: (n, decimals = 2) => n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }),
  currency: (n, currency = 'USD') => n.toLocaleString(undefined, { style: 'currency', currency }),
  percentage: (n, decimals = 2) => `${n.toFixed(decimals)}%`,
  date: (timestamp) => new Date(timestamp).toLocaleDateString(),
  datetime: (timestamp) => new Date(timestamp).toLocaleString(),
  compact: (n) => {
    if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return n.toString();
  }
};

// Math utilities
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const map = (value, inMin, inMax, outMin, outMax) => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

// Array utilities
export const array = {
  sum: (arr) => arr.reduce((a, b) => a + b, 0),
  average: (arr) => arr.reduce((a, b) => a + b, 0) / arr.length,
  min: (arr) => Math.min(...arr),
  max: (arr) => Math.max(...arr),
  range: (arr) => Math.max(...arr) - Math.min(...arr),
  shuffle: (arr) => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },
  chunk: (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  },
  unique: (arr) => [...new Set(arr)],
  sortBy: (arr, key, direction = 'asc') => {
    const sorted = [...arr];
    sorted.sort((a, b) => {
      if (direction === 'asc') {
        return a[key] > b[key] ? 1 : -1;
      } else {
        return a[key] < b[key] ? 1 : -1;
      }
    });
    return sorted;
  }
};

// Object utilities
export const object = {
  deepClone: (obj) => JSON.parse(JSON.stringify(obj)),
  merge: (target, ...sources) => {
    sources.forEach(source => {
      Object.keys(source).forEach(key => {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          target[key] = target[key] || {};
          object.merge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      });
    });
    return target;
  },
  pick: (obj, keys) => {
    const picked = {};
    keys.forEach(key => {
      if (obj.hasOwnProperty(key)) {
        picked[key] = obj[key];
      }
    });
    return picked;
  },
  omit: (obj, keys) => {
    const omitted = { ...obj };
    keys.forEach(key => delete omitted[key]);
    return omitted;
  }
};

// String utilities
export const string = {
  capitalize: (str) => str.charAt(0).toUpperCase() + str.slice(1),
  camelCase: (str) => str.replace(/-([a-z])/g, (g) => g[1].toUpperCase()),
  snakeCase: (str) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`),
  truncate: (str, length, suffix = '...') => {
    if (str.length <= length) return str;
    return str.substring(0, length) + suffix;
  },
  slugify: (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
};

// Date utilities
export const date = {
  now: () => new Date(),
  addDays: (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000),
  addMonths: (date, months) => new Date(date.setMonth(date.getMonth() + months)),
  addYears: (date, years) => new Date(date.setFullYear(date.getFullYear() + years)),
  isWeekend: (date) => date.getDay() === 0 || date.getDay() === 6,
  isBusinessDay: (date) => !date.isWeekend(date),
  format: (date, format = 'YYYY-MM-DD') => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day);
  }
};

// Crypto utilities
export function hex(buffer) {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function sha256Hex(str) {
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(str));
  return hex(digest);
}

export function startsWithZeros(hexStr, zeros) {
  return hexStr.startsWith("0".repeat(zeros));
}

// Random number generation utilities
export function seedToInt(seed) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randNorm(prng) {
  let u = 0, v = 0;
  while (u === 0) u = prng();
  while (v === 0) v = prng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); // N(0,1)
}

export function randInt(min, max, prng = Math.random) {
  return Math.floor(prng() * (max - min + 1)) + min;
}

export function randFloat(min, max, prng = Math.random) {
  return prng() * (max - min) + min;
}

export function randChoice(arr, prng = Math.random) {
  return arr[Math.floor(prng() * arr.length)];
}

// Validation utilities
export const validate = {
  email: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },
  url: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  number: (value) => !isNaN(value) && isFinite(value),
  integer: (value) => Number.isInteger(Number(value)),
  positive: (value) => Number(value) > 0,
  range: (value, min, max) => Number(value) >= min && Number(value) <= max,
  required: (value) => value !== null && value !== undefined && value !== ''
};

// Async utilities
export const async = {
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  retry: async (fn, maxAttempts = 3, delay = 1000) => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxAttempts) throw error;
        await async.delay(delay * attempt);
      }
    }
  },
  timeout: (promise, ms) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
    ]);
  }
};

// Storage utilities
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch {
      return false;
    }
  }
};

// DOM utilities
export const dom = {
  create: (tag, attributes = {}, children = []) => {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'textContent') {
        element.textContent = value;
      } else {
        element.setAttribute(key, value);
      }
    });
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
    return element;
  },
  addEvent: (element, event, handler, options = {}) => {
    element.addEventListener(event, handler, options);
    return () => element.removeEventListener(event, handler);
  },
  removeEvent: (element, event, handler) => {
    element.removeEventListener(event, handler);
  },
  show: (element) => {
    element.style.display = '';
  },
  hide: (element) => {
    element.style.display = 'none';
  },
  toggle: (element) => {
    element.style.display = element.style.display === 'none' ? '' : 'none';
  }
};

// Chart utilities
export const chart = {
  createCanvas: (width, height) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  },
  drawLine: (ctx, points, color = '#000', width = 1) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    points.forEach((point, i) => {
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();
  },
  drawBar: (ctx, x, y, width, height, color = '#000') => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
  },
  drawText: (ctx, text, x, y, font = '12px Arial', color = '#000') => {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }
};

// Export all utilities as a single object for convenience
export default {
  $, $$, fmt, clamp, lerp, map,
  array, object, string, date,
  hex, sha256Hex, startsWithZeros,
  seedToInt, mulberry32, randNorm, randInt, randFloat, randChoice,
  validate, async, storage, dom, chart
};