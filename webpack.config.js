const path = require('path');
const { makeWebpackConfig } = require('webpack-simple');

const config = makeWebpackConfig({
  entry: './src/index.tsx',
  output: {
    path: path.join(__dirname, '/public'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
});

config.module.rules.push({
  test: /\.tsx?$/,
  use: { loader: 'ts-loader' },
});

module.exports = config;
