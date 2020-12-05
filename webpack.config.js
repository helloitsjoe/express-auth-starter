const path = require('path');
const { makeWebpackConfig } = require('webpack-simple');

const config = makeWebpackConfig({
  ts: true,
  entry: './src/index.tsx',
  output: {
    path: path.join(__dirname, '/public'),
  },
});

module.exports = config;
