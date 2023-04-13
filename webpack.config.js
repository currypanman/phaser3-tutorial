module.exports = {
  mode: 'development',
  entry: {
    index: './src/index.js',
    tutorial: './src/tutorial.js',
  },
  output: {
    filename: '[name].bundle.js',
  },
  devServer: {
    static: 'dist',
    open: true
  }
};
