const path = require("path");
var glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const pages = require.resolve('./pages/test1/index.js');

const webpackConfig = {
  entry: {},
  module: {
    rules: [
      {
        test: /\.js$/, use: 'babel-loader'
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {},
          },
        ],
      }
    ],
  },
  devServer: {
    contentBase: './dist'
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name]/index.js"
  },
  plugins: [],
  mode: 'development'
}

// 获取指定路径下的入口文件
function getEntries(globPath) {
  var files = glob.sync(globPath),
    entries = {};

  files.forEach(function (filepath) {
    var split = filepath.split('/');
    var name = split[split.length - 2];

    entries[name] = './' + filepath;
  });

  return entries;
}

var entries = getEntries('pages/**/index.js');

Object.keys(entries).forEach(function (name) {
  // 每个页面生成一个entry，如果需要HotUpdate，在这里修改entry
  webpackConfig.entry[name] = entries[name];

  // 每个页面生成一个html
  var plugin = new HtmlWebpackPlugin({
    // 生成出来的html文件名
    filename: name + '/index.html',
    // 每个html的模版，这里多个页面使用同一个模版
    template: './template.html',
    // 自动将引用插入html
    inject: true,
    // 每个html引用的js模块，也可以在这里加上vendor等公用模块
    chunks: [name]
  });
  webpackConfig.plugins.push(plugin);
})

module.exports = webpackConfig;