const { theme } = require('antd');
const fs = require('fs');
const path = require('path');

const { defaultAlgorithm, defaultSeed } = theme;
const mapToken = defaultAlgorithm(defaultSeed);

fs.writeFileSync(
  path.join(__dirname, '/ant.config.default.output.js'),
  'module.exports = ' + JSON.stringify(mapToken, null, 2),
  'utf-8'
);
