var path = require("path");

/**
 *
 */
module.exports = {
  watch: true,
  target: "electron-renderer",
  mode: "development",
  devtool: "source-map",
  entry: {
    renderer: path.resolve(__dirname, "renderer.ts"),
    preload: path.resolve(__dirname, "preload.ts"),
    style: path.resolve(__dirname, "style.ts"),
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
