module.exports = {
  mode: 'development',
  entry: {
    index: './src/index.ts',
    tutorial: './src/tutorial.js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].bundle.js',
  },
  devtool: 'inline-source-map',
  devServer: {
    static: 'dist',
    open: true
  }
};
