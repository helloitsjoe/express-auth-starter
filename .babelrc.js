const makeBabelConfig = require('babel-react-simple');

const config = makeBabelConfig();

config.presets = [...config.presets, '@babel/preset-typescript'];

module.exports = config;
