const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: './src/main.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/', // necesario para rutas como /admin en SPA
  },
  devServer: {
    historyApiFallback: true, // permite navegación en rutas como /admin
    port: 3000,
    open: true, // abre navegador automáticamente (opcional)
    hot: true, // recarga en caliente (opcional)
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new Dotenv(), // ⬅️ Esto inyecta el .env en process.env
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};
