var path = require("path");
var TerserPlugin = require("terser-webpack-plugin");
/**
 *
 */
module.exports = {
  watch: false,
  target: "electron-renderer",
  mode: "production",
  entry: {
    renderer: path.resolve(__dirname, "renderer.ts"),
    preload: path.resolve(__dirname, "preload.ts"),
    style: path.resolve(__dirname, "style.ts"),
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  output: {
    path: path.resolve(__dirname, "KickBotter"),
    filename: "[name].js",
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
      {
        test: /\.s[ac]ss$/i,
        use: [
          "style-loader",
          "css-loader",

          {
            loader: "sass-loader",
            options: {
              implementation: require("sass"),
            },
          },
        ],
      },
    ],
  },
};
