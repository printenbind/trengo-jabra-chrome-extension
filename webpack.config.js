const path = require('path');
const webpack = require('webpack');

var config = {
  mode: 'production',
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    })
  ],
};

var contentConfig = Object.assign({}, config, {
  name: "content",
  entry: './src/content.js',
  output: {
    publicPath: '',
    filename: 'content.js',
    path: path.resolve(__dirname, 'dist'),
  },
});
var backgroundConfig = Object.assign({}, config,{
  name: "background",
  entry: './src/background.js',
  output: {
    publicPath: '',
    filename: 'background.js',
    path: path.resolve(__dirname, 'dist'),
  },
});

module.exports = [
  contentConfig, backgroundConfig,
];
