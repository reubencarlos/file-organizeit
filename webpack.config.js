const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const commonConfig = {
  mode: 'development',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/],
        },
        exclude: /node_modules/,
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.s(c|a)ss$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass'),
              sassOptions: {
                indentedSyntax: true
              },
            },
          },
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.vue'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'vue$': 'vue/dist/vue.esm-bundler.js'
    }
  },
  plugins: [
    new VueLoaderPlugin(),
  ],
};

const mainConfig = {
  ...commonConfig,
  target: 'electron-main',
  entry: './src/main.ts',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  externals: {
    diskusage: 'commonjs diskusage'
  },
};

const rendererConfig = {
  ...commonConfig,
  target: 'web',
  entry: './src/renderer.ts',
  output: {
    filename: 'renderer.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    ...commonConfig.plugins,
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      chunks: ['renderer']
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/index.html', to: 'index.html' }
      ]
    }),
  ],
};

const preloadConfig = {
  ...commonConfig,
  target: 'electron-preload',
  entry: './src/preload.ts',
  output: {
    filename: 'preload.js',
    path: path.resolve(__dirname, 'dist'),
  },
};

module.exports = [mainConfig, rendererConfig, preloadConfig];