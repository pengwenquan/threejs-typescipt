const path = require('path');

module.exports = {
  entry: './src/client/client.ts', // 入口文件
  module: { // loader
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: '/node_modules/'
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'], // 引入文件可以忽略后缀名，同个文件夹多个同名的文件，只解释第一个后缀名的文件
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../../dist/client'),
  },
}