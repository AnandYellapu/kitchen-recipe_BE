// utils/generateResetToken.js
const crypto = require('crypto');
const { promisify } = require('util');

const randomBytesAsync = promisify(crypto.randomBytes);

async function generateResetToken() {
  try {
    const buffer = await randomBytesAsync(32);
    return buffer.toString('hex');
  } catch (error) {
    throw error;
  }
}

module.exports = generateResetToken;
