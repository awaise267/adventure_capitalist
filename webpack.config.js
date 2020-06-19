const path = require('path');

module.exports = {
  entry: './build-babel/Main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    libraryTarget: 'var',
    library: 'EntryPoint'
  }
};