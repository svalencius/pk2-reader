const webpack = require('webpack');

module.exports = {
  entry: './app/index.js',
  output: {
    filename: "./build/bundle.js",
    sourceMapFilename: "./build/bundle.map"
  },
  devtool: '#source-map',
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
            presets: ['es2015','react']
        }
      }
    ]
  },
}
