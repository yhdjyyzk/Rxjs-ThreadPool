const { name } = require('../package.json');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const webpack = require('webpack');

const debug = process.env.NODE_ENV === 'development';
const styleLoader = debug ? 'style-loader' : MiniCssExtractPlugin.loader;

const banner = `
__      __.__            .___
/  \    /  \__| ____    __| _/
\   \/\/   /  |/    \  / __ | 
 \        /|  |   |  \/ /_/ | 
  \__/\  / |__|___|  /\____ | 
       \/          \/      \/ 
`;

console.log(banner);

module.exports = {
  entry: './src/index.js',
  output: {
    filename: '[name].[hash].js',
    path: path.resolve(__dirname, '../dist'),
    publicPath: debug ? '/' : '/' + name + '/' // 必须配置
  },
  externals: {},
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' },
      { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
      { test: /\.worker\.js$/, loader: 'worker-loader' }
    ]
  },
  plugins: [
    new ProgressBarPlugin(),
    new CleanWebpackPlugin(),
    // eslint-disable-next-line new-cap
    // new htmlWebpackPlugin({
    //   filename: 'index.html',
    //   template: path.resolve(__dirname, '../src/index.html'),
    //   title: debug ? '本地调试' : 'wind',
    //   cdnConfig: [] // cdn 配置
    // }),
    new webpack.BannerPlugin({
      banner: `
          ${banner}

          Author: kangzhaoyuan@gmail.com
          Date: ${new Date()}
        `
    })
  ],
  resolve: {
    extensions: ['.js', 'ts'],
    alias: {
      '@': path.resolve(__dirname, '../src')
    }
  }
};
