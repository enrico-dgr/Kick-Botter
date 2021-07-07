var path = require("path");
/**
 *
 */

function isNotPackaging() {
  return process.env.NODE_ENV !== "packaging";
}
/**
 *
 */
module.exports = {
  watch: isNotPackaging(),
  target: "electron-renderer",
  mode: "development",
  devtool: "inline-source-map",
  entry: {
    renderer: path.resolve(__dirname, "src/renderer.ts"),
    preload: path.resolve(__dirname, "src/preload.ts"),
    style: path.resolve(__dirname, "src/style.ts"),
  },

  output: {
    path: path.resolve(
      __dirname,
      "KickBotter",
      path.relative(
        path.resolve(__dirname, ".."),
        path.resolve(__dirname, "./src")
      )
    ),
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
