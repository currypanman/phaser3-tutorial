module.exports = {
  mode: 'development',
  entry: {
    connect: './src/connect.ts',
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
      {
        test: /\.(png|mp3)$/,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].bundle.js',
    assetModuleFilename: 'assets/[hash][ext][query]'
  },
  devtool: 'inline-source-map',
  devServer: {
    static: 'dist',
    open: true
  }
};
