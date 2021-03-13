process.env.NODE_ENV = 'development';

const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const htmlWebpackPlugin = require('html-webpack-plugin');
const webpackCommon = require('./webpack.common.js');

module.exports = webpackMerge.merge(webpackCommon, {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.ProgressPlugin(function (percentage, message, ...args) {
      console.info(message + (percentage * 100).toFixed(2) + '%' + '. ' + args.join(','));
    }),
    new htmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, '../src/index.html'),
      title: '本地调试',
      cdnConfig: [] // cdn 配置
    })
  ],
  devServer: {
    inline: true,
    hot: true,
    port: 8080,
    historyApiFallback: {
      index: '/index.html'
    }, // react router要配置
    proxy: {
    }
  }
});
