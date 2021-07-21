var path = require("path");

/**
 *
 */
module.exports = {
  watch: false,
  target: "electron-renderer",
  mode: "development",
  devtool: "inline-source-map",
  entry: {
    renderer: path.resolve(__dirname, "RendererProcess/index.ts"),
    preload: path.resolve(__dirname, "Preload/index.ts"),
    style: path.resolve(__dirname, "./style.ts"),
  },

  output: {
    path: path.resolve(__dirname, "./KickBotter"),
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
