var path = require("path");

module.exports = {
  watch: false,
  target: "electron-renderer",
  mode: "development",
  devtool: "inline-source-map",
  entry: path.resolve(__dirname, "build/renderer.js"),
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "renderer.js",
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".js"],
  },
};
