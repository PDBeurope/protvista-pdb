const webpack = require("webpack");
const path = require("path");
const camelCase = require("camelcase");
const CleanWebpackPlugin = require("clean-webpack-plugin");

const PACKAGE_ROOT_PATH = process.cwd();
const PKG_JSON = require(path.join(PACKAGE_ROOT_PATH, "package.json"));

const config = {
  entry: ["./src/index.js"],
  output: {
    path: path.resolve(PACKAGE_ROOT_PATH, "dist"),
    library: camelCase(PKG_JSON.name, { pascalCase: true }),
    filename: `${PKG_JSON.name}-${PKG_JSON.version}.js`
  },
  target: "web",
  devtool: "source-map",
  resolve: {
    extensions: [".js"]
  },
  externals: {
    d3: "d3",
    "resize-observer-polyfill": "ResizeObserver"
  },
  plugins: [new CleanWebpackPlugin([path.join(PACKAGE_ROOT_PATH, "dist")])],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          "style-loader",
          { loader: "css-loader", options: { importLoaders: 1 } }
        ]
      },
      {
        test: /.(jpg|jpeg|png|svg)$/,
        use: ['url-loader'],
      },
      {
        test: /\.(js)$/,
        exclude: function excludeCondition(path){
            
            const nonEs5SyntaxPackages = [
              'lit-element',
              'lit-html'
            ]
            
            // DO transpile these packages
            if (nonEs5SyntaxPackages.some( pkg => path.match(pkg))) {
              return false;
            }
          
            // Ignore all other modules that are in node_modules
            if (path.match(/node_modules\\/)) { return true; }
          
            else return false;
          },
        use: {
          loader: "babel-loader",
          options: {
            babelrc: false,
            presets: [
              // [
              //   "@babel/preset-env",
              //   {
              //     targets: {
              //       ie: 11,
              //       browsers: "last 2 versions"
              //     },
              //     modules: false
              //   }
              // ]
            ],
            plugins: [
              [
                "@babel/plugin-transform-runtime",
                {
                  regenerator: true
                }
              ]
            ]
          }
        }
      }
    ]
  }
};

module.exports = config;