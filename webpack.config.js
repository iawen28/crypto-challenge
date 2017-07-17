const webpack = require('webpack');
const path = require('path');
 
const DEV = path.resolve(__dirname, 'dev');
const OUTPUT = path.resolve(__dirname, 'output');
 
const config = {
  entry: DEV + '/index.jsx',
  output: {
    path: OUTPUT,
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        include: DEV,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
      },
      { test: /\.css$/, 
        loader: "style-loader!css-loader?sourceMap&modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]" 
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  }
};
 
module.exports = config;
