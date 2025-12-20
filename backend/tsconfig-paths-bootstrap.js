// This file is used by ts-node to register path aliases
const tsConfigPaths = require('tsconfig-paths');
const tsConfig = require('./tsconfig.json');

const baseUrl = tsConfig.compilerOptions.baseUrl || './';
const paths = tsConfig.compilerOptions.paths || {};

tsConfigPaths.register({
  baseUrl,
  paths,
});


