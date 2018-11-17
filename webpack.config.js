const path = require('path');
const webpack = require('webpack');

const baseConfig = {
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production', 
  devtool: 'source-map',

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },

  resolve: {
    extensions: [ '.tsx', '.ts', ],
  },
}

const nodeConfig = Object.assign({}, baseConfig, {
  name: 'node',
  entry: [
    './src/index.ts',
  ],

  target: 'node',

  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist', 'node'),
    libraryTarget: 'umd',
  },
});

const browserConfig = Object.assign({}, baseConfig, {
  name: 'browser',
  entry: [
    './src/index.ts',
  ],

  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist', 'browser'),
    library: 'twinepm',
    libraryTarget: 'umd',
    globalObject: 'this',
  },

  plugins: [
    new webpack.IgnorePlugin(/node_fetch/),
  ],
});

const cliConfig = Object.assign({}, baseConfig, {
  name: 'cli',
  entry: [
    './cli/index.ts',
  ],

  target: 'node',

  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist', 'cli'),
  },
});

module.exports = [
  nodeConfig,
  browserConfig,
  //cliConfig,
];
