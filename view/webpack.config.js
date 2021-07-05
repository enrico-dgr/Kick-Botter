var path = require("path");

module.exports = {
  watch: true,
  target: "electron-renderer",
  mode: "development",
  devtool: "inline-source-map",
  entry: path.resolve(__dirname, "src/renderer.ts"),
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "renderer.js",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
};
