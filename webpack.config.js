const path = require('path');
const { makeWebpackConfig } = require('webpack-simple');

module.exports = makeWebpackConfig({
  output: {
    path: path.join(__dirname, '/public'),
  },
});
