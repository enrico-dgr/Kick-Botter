var path = require("path");

/**
 *
 */
module.exports = {
  watch: true,
  target: "electron-main",
  mode: "production",
  entry: {
    index: path.resolve(__dirname, "index.ts"),
  },

  output: {
    path: path.resolve(__dirname, "KickBotter"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  externals: {
    bufferutil: "bufferutil",
    "utf-8-validate": "utf-8-validate",
  },
};
