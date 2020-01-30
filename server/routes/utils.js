const crypto = require('crypto');

const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

const generateRandom = len => {
  const rand = crypto
    .randomBytes(len)
    .toString('base64')
    .replace(/[/+=]/g, '')
    // length in bytes is greater than string length
    .slice(0, len);

  return rand;
};

module.exports = {
  ONE_DAY_IN_SECONDS,
  generateRandom,
};
