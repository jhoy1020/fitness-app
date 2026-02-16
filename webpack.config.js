const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const appDirectory = path.resolve(__dirname);

const babelLoaderConfiguration = {
  test: /\.(ts|tsx|js|jsx)$/,
  include: [
    path.resolve(appDirectory, 'src'),
    path.resolve(appDirectory, 'App.tsx'),
    path.resolve(appDirectory, 'index.web.js'),
    path.resolve(appDirectory, 'node_modules/react-native-vector-icons'),
    path.resolve(appDirectory, 'node_modules/react-native-paper'),
    path.resolve(appDirectory, 'node_modules/@react-navigation'),
    path.resolve(appDirectory, 'node_modules/@expo/vector-icons'),
  ],
  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      configFile: path.resolve(appDirectory, 'babel.config.web.js'),
    },
  },
};

const imageLoaderConfiguration = {
  test: /\.(gif|jpe?g|png|svg)$/,
  use: {
    loader: 'url-loader',
    options: {
      name: '[name].[ext]',
      esModule: false,
    },
  },
};

const fontLoaderConfiguration = {
  test: /\.(woff|woff2|eot|ttf|otf)$/,
  use: {
    loader: 'file-loader',
    options: {
      name: '[name].[ext]',
    },
  },
};

module.exports = {
  entry: path.resolve(appDirectory, 'index.web.js'),
  output: {
    path: path.resolve(appDirectory, 'dist'),
    filename: 'bundle.[contenthash].js',
    publicPath: '/',
  },
  resolve: {
    extensions: ['.web.tsx', '.web.ts', '.tsx', '.ts', '.web.js', '.js'],
    alias: {
      'react-native$': 'react-native-web',
      '@': path.resolve(appDirectory, 'src'),
      '@components': path.resolve(appDirectory, 'src/components'),
      '@screens': path.resolve(appDirectory, 'src/screens'),
      '@services': path.resolve(appDirectory, 'src/services'),
      '@context': path.resolve(appDirectory, 'src/context'),
      '@types': path.resolve(appDirectory, 'src/types'),
      '@utils': path.resolve(appDirectory, 'src/utils'),
      '@hooks': path.resolve(appDirectory, 'src/hooks'),
      // Stub out problematic icon packages for web
      '@react-native-vector-icons/material-design-icons': false,
      '@expo/vector-icons/MaterialCommunityIcons': path.resolve(appDirectory, 'src/stubs/icons.js'),
      '@expo/vector-icons': path.resolve(appDirectory, 'src/stubs/icons.js'),
      'react-native-vector-icons/MaterialCommunityIcons': path.resolve(appDirectory, 'src/stubs/icons.js'),
      'react-native-vector-icons': path.resolve(appDirectory, 'src/stubs/icons.js'),
    },
  },
  module: {
    rules: [
      babelLoaderConfiguration,
      imageLoaderConfiguration,
      fontLoaderConfiguration,
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(appDirectory, 'public/index.html'),
    }),
  ],
  devServer: {
    static: {
      directory: path.join(appDirectory, 'public'),
    },
    historyApiFallback: true,
    hot: true,
    port: 3000,
  },
};
