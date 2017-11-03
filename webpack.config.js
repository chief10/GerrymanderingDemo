const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: {
    main: './scripts/index.ts'
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  }
  // ,plugins: [
  //   UglifyJSPlugin({
  //     uglifyOptions: {
  //       ecma: 7
  //     }
  //   })
  // ]
};