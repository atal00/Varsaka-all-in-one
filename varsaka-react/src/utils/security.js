/**
 * 🛡️ Varsaka Security Utils - Hardened Version
 * Provides multi-layer sanitization to prevent XSS and Injection attacks.
 */

export const sanitize = (str) => {
  if (typeof str !== 'string') return str;
  
  // 🛡️ Step 1: Deep Strip Malicious Patterns
  let clean = str
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "[removed]") // Remove scripts
    .replace(/on\w+="[^"]*"/gim, "") // Remove event handlers like onclick
    .replace(/javascript:[^"]*/gim, "") // Remove JS links
    .replace(/expression\((.*?)\)/gim, "") // Remove CSS expressions
    .replace(/vbscript:[^"]*/gim, "") // Remove VBScript
    .trim();

  // 🛡️ Step 2: Character-Level Escaping (The most secure part for React)
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    "/": '&#x2F;',
    "`": '&#x60;',
    "=": '&#x3D;'
  };
  
  return clean.replace(/[&<>"'/`=]/g, (m) => map[m]);
};

export const validateEmail = (email) => {
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(email);
};

export const validatePhone = (phone) => {
  return /^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$/im.test(phone);
};
