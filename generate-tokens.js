// generate-tokens.js — ejecutar una sola vez para generar tokens
// node generate-tokens.js

const crypto = require("crypto");

// Generá tantos como pacientes tengas
const count = 10;

for (let i = 0; i < count; i++) {
  const token = crypto.randomBytes(16).toString("hex"); // 32 caracteres hex
  console.log(`PAC-${String(i + 1).padStart(3, "0")}: ${token}`);
}