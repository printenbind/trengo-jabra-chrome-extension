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

var jabraConfig = Object.assign({}, config, {
  name: "jabra",
  entry: './src/jabra.js',
  output: {
    publicPath: '',
    filename: 'jabra.js',
    path: path.resolve(__dirname, 'dist'),
  },
});
var ringtoneConfig = Object.assign({}, config, {
  name: "ringtone",
  entry: './src/ringtone.js',
  output: {
    publicPath: '',
    filename: 'ringtone.js',
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
  jabraConfig, ringtoneConfig, backgroundConfig,
];
